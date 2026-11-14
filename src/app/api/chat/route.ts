import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { getSettings } from '@/lib/chat/config';
import { redisConfigured } from '@/lib/chat/redis';
import {
  VISITOR_COOKIE, clientIp, daily, fmtWait, globalUsage, hashFp, hashIp, isBlocked, maskIp, newVisitor, noteGlobal,
  originOk, readVisitor, slide, tempBlock, tokenCap, type Verdict,
} from '@/lib/chat/guard';
import { getConv, saveConv, scriptOf, validCid, type Conv } from '@/lib/chat/store';
import { scriptNote, systemPrompt } from '@/lib/chat/prompt';
import { knowledgeFor, NO_MATCH } from '@/lib/chat/kb';
import { decideHandoff, markerStripper, type HandoffReason } from '@/lib/chat/handoff';
import { content } from '@/content/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.SARVAM_CHAT_MODEL || 'sarvam-105b-conversations';
const HISTORY = 10; // messages of context sent to the model: bounds input cost
const MIN_VISITOR_AGE = 1500; // ms between getting a cookie and the first message: scripts that skip the widget fail this

const fail = (status: number, error: string, message: string, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error, message, ...extra }, { status, headers: { 'Cache-Control': 'no-store', ...(extra.retryAfter ? { 'Retry-After': String(extra.retryAfter) } : {}) } });

const limited = (v: Extract<Verdict, { ok: false }>) =>
  fail(429, 'rate', `You are sending messages a little quickly. Please try again in ${fmtWait(v.retryAfter)}.`, { retryAfter: v.retryAfter });

const UNAVAILABLE = 'The assistant is not available right now. Please call or WhatsApp us, or use Book direct.';

/* Session start: issues the signed visitor cookie and returns what the widget needs to render. */
export async function GET(req: Request) {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return fail(403, 'origin', UNAVAILABLE);
  if (!redisConfigured()) return fail(503, 'off', UNAVAILABLE);
  const s = await getSettings();
  const ipH = hashIp(clientIp(req.headers));
  if (!s.enabled) return NextResponse.json({ enabled: false, message: UNAVAILABLE }, { headers: { 'Cache-Control': 'no-store' } });
  if (await isBlocked(ipH, null, null)) return fail(403, 'blocked', UNAVAILABLE);
  const v = await slide('session', ipH, 30, 3600); // cookie minting is capped per network
  if (!v.ok) return limited(v);

  const res = NextResponse.json(
    { enabled: true, name: s.name, greeting: s.greeting, maxInput: s.maxInput, minAge: MIN_VISITOR_AGE, contact: { phone: content.general.phone, email: content.general.email, whatsapp: content.general.whatsapp } },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  if (!readVisitor(req.headers.get('cookie'))) {
    res.cookies.set(VISITOR_COOKIE, newVisitor().cookie, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/chat', maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export async function POST(req: Request) {
  if (!originOk(req)) return fail(403, 'origin', UNAVAILABLE);
  if (!redisConfigured() || !process.env.SARVAM_API_KEY) return fail(503, 'off', UNAVAILABLE);

  let body: any;
  try { body = await req.json(); } catch { return fail(400, 'bad', 'That message could not be read.'); }

  const s = await getSettings();
  if (!s.enabled) return fail(503, 'off', UNAVAILABLE);

  const ipH = hashIp(clientIp(req.headers));
  const visitor = readVisitor(req.headers.get('cookie'));
  const fpH = typeof body.fp === 'string' && /^[a-f0-9]{16,64}$/.test(body.fp) ? hashFp(body.fp) : null;

  // honeypot: real guests never see this field
  if (body.hp) { await tempBlock(ipH).catch(() => {}); return fail(400, 'bad', 'That message could not be sent.'); }
  if (await isBlocked(ipH, visitor?.id ?? null, fpH)) return fail(403, 'blocked', UNAVAILABLE);
  if (!visitor) return fail(401, 'session', 'Please reopen the chat and try again.');
  if (Date.now() - visitor.ts < MIN_VISITOR_AGE) return fail(429, 'rate', 'One moment, then try again.', { retryAfter: 2 });

  // thumbs up/down on a reply: light, no model call
  if (body.feedback) {
    const v = await slide('fb', visitor.id, 30, 60);
    const fb = body.feedback; const conv = validCid(fb?.cid) ? await getConv(fb.cid) : null;
    if (v.ok && conv && conv.visitor === visitor.id && Number.isInteger(fb.i) && conv.msgs[fb.i]?.r === 'a' && (fb.v === 1 || fb.v === -1)) {
      conv.msgs[fb.i].fb = fb.v; await saveConv(conv);
    }
    return NextResponse.json({ ok: true });
  }

  const text = String(body.message ?? '').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim();
  if (!text) return fail(400, 'bad', 'Please type a message.');
  if (text.length > s.maxInput) return fail(400, 'long', `Please keep your message under ${s.maxInput} characters.`);

  // whole-site circuit breaker: reads only, counts after the reply
  const g = await globalUsage();
  if (g.requests >= s.dailyCap || g.tokens >= tokenCap(s.dailyCap)) {
    return fail(503, 'paused', 'Our assistant has reached its limit for today and will be back tomorrow. Please call, WhatsApp or use Book direct and the team will help.');
  }

  // per-network, per-guest and per-device limits
  const checks: Verdict[] = [
    await slide('ip', ipH, s.ipPerHour, 3600),
    await slide('vmin', visitor.id, s.perMinute, 60),
    await daily('vday', visitor.id, s.perDay),
  ];
  if (fpH) checks.push(await daily('fpday', fpH, Math.round(s.perDay * 1.5)));
  const bad = checks.find((c): c is Extract<Verdict, { ok: false }> => !c.ok);

  // the conversation (history comes from here, never from the browser)
  let conv: Conv | null = validCid(body.cid) ? await getConv(body.cid) : null;
  if (conv && conv.visitor !== visitor.id) conv = null;
  const { script, label } = scriptOf(text);
  if (!conv) {
    conv = {
      id: randomBytes(15).toString('base64url'), visitor: visitor.id, ipHash: ipH, ipMask: maskIp(clientIp(req.headers)), fp: fpH,
      createdAt: Date.now(), updatedAt: Date.now(), lang: label, msgs: [], limited: 0,
    };
  }
  const c = conv;
  if (bad) {
    c.limited += 1;
    if (c.msgs.length) await saveConv(c).catch(() => {});
    return limited(bad);
  }
  if (c.msgs.filter(m => m.r === 'u').length >= s.maxTurns) {
    return fail(429, 'turns', 'This chat has reached its length limit. Please start a new chat, or call or WhatsApp us.', { newChat: true });
  }

  c.msgs.push({ r: 'u', t: text, ts: Date.now() });
  c.lang = label;
  await saveConv(c);
  await noteGlobal(0);

  const history = c.msgs.slice(-HISTORY).map(m => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.t }));
  history[history.length - 1].content += `\n\n${scriptNote(script, text)}`;
  const knowledge = await knowledgeFor(text).catch(() => '');
  const system = systemPrompt(s, knowledge);
  const prevUser = c.msgs.filter(m => m.r === 'u').slice(-2, -1)[0]?.t;
  const kbMatched = !!knowledge && !knowledge.startsWith(NO_MATCH);

  const enc = new TextEncoder();
  const line = (o: unknown) => enc.encode(JSON.stringify(o) + '\n');
  const signal = AbortSignal.any([req.signal, AbortSignal.timeout(40_000)]);

  const stream = new ReadableStream({
    async start(controller) {
      let reply = ''; let tokens = 0;
      const think = thinkStripper(); const marker = markerStripper();
      const emit = (out: string) => { if (out) { reply += out; controller.enqueue(line({ d: out })); } };
      const send = (chunk: string) => emit(marker.push(think(chunk)));
      try {
        controller.enqueue(line({ cid: c.id }));
        const r = await fetch('https://api.sarvam.ai/v1/chat/completions', {
          method: 'POST', signal,
          headers: { 'Content-Type': 'application/json', 'api-subscription-key': process.env.SARVAM_API_KEY! },
          body: JSON.stringify({
            model: MODEL, stream: true, stream_options: { include_usage: true },
            max_tokens: s.maxReplyTokens, temperature: 0.3,
            messages: [{ role: 'system', content: system }, ...history],
          }),
        });
        if (!r.ok || !r.body) throw new Error(`sarvam-${r.status}`);
        const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf('\n')) >= 0) {
            const ln = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
            if (!ln.startsWith('data:')) continue;
            const data = ln.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const j = JSON.parse(data);
              const piece = j.choices?.[0]?.delta?.content; // reasoning_content is deliberately ignored
              if (typeof piece === 'string' && piece) send(piece);
              if (j.usage?.total_tokens) tokens = j.usage.total_tokens;
            } catch {}
          }
        }
        emit(marker.flush());
        if (!reply.trim()) throw new Error('empty');
      } catch {
        if (!reply) controller.enqueue(line({ err: 'busy', message: 'Sorry, I could not answer just now. Please try again, or call or WhatsApp us.' }));
      } finally {
        try {
          // the model's marker is only a suggestion; decideHandoff filters it (greetings, identity and full answers never get a card)
          const reason: HandoffReason | null = reply.trim() ? decideHandoff({ text, reply, model: marker.reason(), kbMatched, prevUser }) : null;
          if (reason) {
            c.handoff = reason;
            if (reason === 'unknown') c.unanswered = [...(c.unanswered ?? []), text.slice(0, 200)].slice(-10);
            controller.enqueue(line({ handoff: reason }));
          }
          if (reply.trim()) {
            c.msgs.push({ r: 'a', t: reply.trim(), ts: Date.now() });
            controller.enqueue(line({ mi: c.msgs.length - 1 }));
          }
          if (reply.trim() || reason) await saveConv(c);
          await noteGlobal(tokens || Math.ceil((system.length + reply.length) / 3), 0);
        } catch {}
        try { controller.enqueue(line({ end: true })); controller.close(); } catch {}
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
}

/* Removes <think>...</think> reasoning from streamed text, even when a tag is split across chunks. */
function thinkStripper() {
  let inside = false; let hold = '';
  return (chunk: string) => {
    let s = hold + chunk; hold = ''; let out = '';
    for (;;) {
      if (inside) {
        const e = s.indexOf('</think>');
        if (e < 0) { hold = s.slice(-8); return out; }
        s = s.slice(e + 8); inside = false;
      } else {
        const b = s.indexOf('<think>');
        if (b >= 0) { out += s.slice(0, b); s = s.slice(b + 7); inside = true; continue; }
        const lt = s.lastIndexOf('<');
        if (lt >= 0 && '<think>'.startsWith(s.slice(lt))) { out += s.slice(0, lt); hold = s.slice(lt); } else out += s;
        return out;
      }
    }
  };
}
