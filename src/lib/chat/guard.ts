/* Abuse protection for the chat API: identity, origin, blocklist and Redis rate limits. Server only. */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cmd, k, multi, pipeline } from './redis';

const secret = () => process.env.CHAT_SECRET || process.env.AUTH_SECRET || 'dev-only-secret';
const hmac = (s: string) => createHmac('sha256', secret()).update(s).digest('hex').slice(0, 32);

/* ---------- who is asking ---------- */

export function clientIp(h: Headers): string {
  return (h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0] || '').trim() || 'unknown';
}

/** IPv6 addresses are grouped by their /64 (one household or one phone), so rotating within it does not help. */
function ipKey(ip: string) {
  if (!ip.includes(':')) return ip;
  const [a, b = ''] = ip.split('::');
  const head = a ? a.split(':') : [];
  const tail = b ? b.split(':') : [];
  const full = ip.includes('::') ? [...head, ...Array(Math.max(0, 8 - head.length - tail.length)).fill('0'), ...tail] : head;
  return full.slice(0, 4).join(':').toLowerCase();
}
export const hashIp = (ip: string) => hmac('ip:' + ipKey(ip));
export const hashFp = (fp: string) => hmac('fp:' + fp);

/** What the admin sees: enough to recognise a network, not enough to identify a person. */
export function maskIp(ip: string) {
  if (ip.includes(':')) return ip.split(':').slice(0, 2).join(':') + ':…';
  const p = ip.split('.');
  return p.length === 4 ? `${p[0]}.${p[1]}.•.•` : 'unknown';
}

/* ---------- signed visitor cookie ---------- */

export const VISITOR_COOKIE = 'pr_vid';
const sign = (id: string, ts: string) => hmac(`vid:${id}.${ts}`);

export function newVisitor() {
  const id = randomBytes(12).toString('base64url');
  const ts = String(Date.now());
  return { id, ts: Number(ts), cookie: `${id}.${ts}.${sign(id, ts)}` };
}

export function readVisitor(cookieHeader: string | null): { id: string; ts: number } | null {
  const m = cookieHeader?.match(new RegExp(`(?:^|;\s*)${VISITOR_COOKIE}=([^;]+)`));
  const [id, ts, sig] = (m?.[1] ?? '').split('.');
  if (!id || !ts || !sig) return null;
  const want = Buffer.from(sign(id, ts)); const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  return { id, ts: Number(ts) };
}

/* ---------- origin ---------- */

/** Browsers always send Origin on a POST. Allow our own host, the configured site, localhost, and Vercel previews. */
export function originOk(req: Request): boolean {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = req.headers.get('origin');
  if (!origin) return false;
  let host: string;
  try { host = new URL(origin).host; } catch { return false; }
  const own = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (own && host === own) return true;
  try { if (process.env.NEXT_PUBLIC_SITE_URL && host === new URL(process.env.NEXT_PUBLIC_SITE_URL).host) return true; } catch {}
  if (process.env.VERCEL_ENV !== 'production') {
    if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)) return true;
    if (host.endsWith('.vercel.app')) return true;
  }
  return false;
}

/* ---------- blocklist (admin-managed; stores hashes only) ---------- */

export type BlockKind = 'ip' | 'visitor' | 'fp';
export const blockKey = (kind: BlockKind, hash: string) => `${kind}:${hash}`;

export async function isBlocked(ipH: string, visitorId: string | null, fpH: string | null): Promise<boolean> {
  const cmds: (string | number)[][] = [
    ['HEXISTS', k('block'), blockKey('ip', ipH)],
    ['EXISTS', k('tmpblock', ipH)],
  ];
  if (visitorId) cmds.push(['HEXISTS', k('block'), blockKey('visitor', visitorId)]);
  if (fpH) cmds.push(['HEXISTS', k('block'), blockKey('fp', fpH)]);
  return (await pipeline(cmds)).some(Boolean);
}
/** Honeypot hits: a short automatic block. */
export const tempBlock = (ipH: string, seconds = 3600) => cmd('SET', k('tmpblock', ipH), '1', 'EX', seconds);

/* ---------- rate limits ---------- */

export type Verdict = { ok: true } | { ok: false; retryAfter: number; scope: string };

/** Sliding-window counter (current window plus the weighted previous one), atomic in Redis. */
export async function slide(scope: string, id: string, limit: number, windowSec: number): Promise<Verdict> {
  const now = Date.now(); const w = windowSec * 1000;
  const idx = Math.floor(now / w); const elapsed = (now - idx * w) / w;
  const cur = k('rl', scope, id, idx);
  const [c, , p] = await multi([['INCR', cur], ['EXPIRE', cur, windowSec * 2 + 5], ['GET', k('rl', scope, id, idx - 1)]]);
  if (Number(p ?? 0) * (1 - elapsed) + Number(c) <= limit) return { ok: true };
  await cmd('DECR', cur); // refused requests do not count against the guest
  return { ok: false, retryAfter: Math.max(1, Math.ceil((1 - elapsed) * windowSec)), scope };
}

/** India-time day, used for the daily counters so "tomorrow" means the resort's tomorrow. */
export function istDay(now = Date.now()) {
  const t = now + 5.5 * 3600_000;
  return { key: new Date(t).toISOString().slice(0, 10), secondsLeft: Math.max(60, 86400 - Math.floor((t / 1000) % 86400)) };
}

/** Fixed daily counter. */
export async function daily(scope: string, id: string, limit: number): Promise<Verdict> {
  const { key, secondsLeft } = istDay();
  const kk = k('day', scope, id, key);
  const [c] = await multi([['INCR', kk], ['EXPIRE', kk, 172800]]);
  if (Number(c) <= limit) return { ok: true };
  await cmd('DECR', kk);
  return { ok: false, retryAfter: secondsLeft, scope };
}

/* ---------- whole-site daily spend caps (circuit breaker) ---------- */

export const globalKeys = () => { const d = istDay().key; return { req: k('global', 'req', d), tok: k('global', 'tok', d) }; };

export async function globalUsage() {
  const g = globalKeys();
  const [req, tok] = await pipeline([['GET', g.req], ['GET', g.tok]]);
  return { requests: Number(req ?? 0), tokens: Number(tok ?? 0) };
}
export async function noteGlobal(tokens: number, requests = 1) {
  const g = globalKeys();
  await pipeline([['INCRBY', g.req, requests], ['EXPIRE', g.req, 172800], ['INCRBY', g.tok, Math.max(0, Math.round(tokens))], ['EXPIRE', g.tok, 172800]]);
}
/** Tokens allowed per day = replies cap x a generous average reply; stops a few giant prompts from draining credits. */
export const tokenCap = (dailyCap: number) => dailyCap * 1200;

export function fmtWait(sec: number) {
  if (sec < 90) return `${sec} seconds`;
  if (sec < 5400) return `${Math.ceil(sec / 60)} minutes`;
  return `${Math.ceil(sec / 3600)} hours`;
}
