'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fingerprint } from './fingerprint';
import './chat.css';

type Msg = { r: 'u' | 'a' | 'e'; t: string; i?: number; fb?: 1 | -1 };
type Contact = { phone: string; email: string; whatsapp: string };
type Cfg = { enabled: boolean; name: string; greeting: string; maxInput: number; contact?: Contact; message?: string };

const API = '/api/chat/';
const CID_KEY = 'pr_chat_cid';
const store = {
  get: () => { try { return sessionStorage.getItem(CID_KEY) || undefined; } catch { return undefined; } },
  set: (v: string | null) => { try { v ? sessionStorage.setItem(CID_KEY, v) : sessionStorage.removeItem(CID_KEY); } catch {} },
};
const CHIPS = ['Suites and prices', 'Check availability', 'How to get here'];

export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [ended, setEnded] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const hp = useRef<HTMLInputElement>(null);
  const cid = useRef<string | undefined>(undefined);
  const fp = useRef<string>('');
  const aborter = useRef<AbortController | null>(null);

  const init = useCallback(async () => {
    const off = (message: string) => setCfg({ enabled: false, name: 'Concierge', greeting: '', maxInput: 500, message });
    try {
      const r = await fetch(API, { cache: 'no-store' });
      const j = await r.json();
      if (r.status === 429) setWait(j.retryAfter || 60);
      if (r.ok) setCfg(j); else off(j.message);
    } catch { off('The assistant is not available right now. Please call or WhatsApp us.'); }
  }, []);

  useEffect(() => { init(); fingerprint().then(v => { fp.current = v; }).catch(() => {}); return () => aborter.current?.abort(); }, [init]);

  // the page does not scroll while the panel is open (Lenis is paused); the panel scrolls itself
  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (open) lenis?.stop?.(); else lenis?.start?.();
    return () => (window as any).__lenis?.start?.();
  }, [open]);

  // focus the message box once it can take focus (it is disabled until the session has started)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => (cfg?.enabled ? field.current : root.current?.querySelector<HTMLElement>('.chat-x'))?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, cfg]);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs, busy, handoff]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setInterval(() => setWait(w => Math.max(0, w - 1)), 1000);
    return () => clearInterval(t);
  }, [wait > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab' || !root.current) return;
    const f = Array.from(root.current.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), a[href]'));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const reset = () => { aborter.current?.abort(); cid.current = undefined; store.set(null); setMsgs([]); setEnded(false); setBusy(false); setHandoff(false); };

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || busy || wait > 0 || !cfg?.enabled) return;
    setInput(''); setBusy(true);
    setMsgs(m => [...m, { r: 'u', t: text }]);
    const ac = new AbortController(); aborter.current = ac;
    try {
      cid.current ||= store.get();
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ac.signal,
        body: JSON.stringify({ message: text, cid: cid.current, fp: fp.current, hp: hp.current?.value || '' }),
      });
      if (!res.ok || !(res.headers.get('content-type') || '').includes('ndjson')) {
        const j = await res.json().catch(() => ({} as any));
        if (j.error === 'session') await init();
        if (j.retryAfter) setWait(Math.min(Number(j.retryAfter), 86400));
        if (j.newChat || ['paused', 'blocked', 'off'].includes(j.error)) setEnded(true);
        if (['paused', 'off', 'turns'].includes(j.error)) setHandoff(true);
        setMsgs(m => [...m, { r: 'e', t: j.message || 'Sorry, something went wrong. Please try again.' }]);
        return;
      }
      setMsgs(m => [...m, { r: 'a', t: '' }]);
      const reader = res.body!.getReader(); const dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let n: number;
        while ((n = buf.indexOf('\n')) >= 0) {
          const ln = buf.slice(0, n); buf = buf.slice(n + 1);
          if (!ln) continue;
          const ev = JSON.parse(ln);
          if (ev.cid) { cid.current = ev.cid; store.set(ev.cid); }
          if (ev.d) setMsgs(m => { const c = m.slice(); c[c.length - 1] = { ...c[c.length - 1], t: c[c.length - 1].t + ev.d }; return c; });
          if (ev.mi !== undefined) setMsgs(m => { const c = m.slice(); c[c.length - 1] = { ...c[c.length - 1], i: ev.mi }; return c; });
          if (ev.handoff) setHandoff(true);
          if (ev.err) { setMsgs(m => [...m.slice(0, -1), { r: 'e', t: ev.message }]); setHandoff(true); }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') { setMsgs(m => [...m, { r: 'e', t: 'Connection problem. Please try again.' }]); setHandoff(true); }
    } finally { setBusy(false); setTimeout(() => field.current?.focus(), 0); }
  }

  function rate(idx: number, v: 1 | -1) {
    setMsgs(m => m.map(x => (x.i === idx ? { ...x, fb: v } : x)));
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback: { cid: cid.current, i: idx, v } }) }).catch(() => {});
  }

  const blocked = !cfg?.enabled || ended || wait > 0 || busy;
  const mins = Math.floor(wait / 60);
  const waitText = wait >= 3600 ? 'a while' : mins >= 1 ? `${mins}m ${String(wait % 60).padStart(2, '0')}s` : `${wait}s`;
  const c = cfg?.contact;
  const wa = c?.whatsapp?.replace(/\D/g, '');
  const topic = [...msgs].reverse().find(m => m.r === 'u')?.t.replace(/\s+/g, ' ').slice(0, 120);
  const hi = `Hi Palm Regal, I was chatting on your website${topic ? ` about: ${topic}` : ''}`;
  const hasUser = msgs.some(m => m.r === 'u');

  return (
    <div ref={root} className="chat" role="dialog" aria-modal="true" aria-labelledby="chat-title" data-open={open} hidden={!open} onKeyDown={onKey}>
      <header className="chat-head">
        <div><h2 id="chat-title">{cfg?.name || 'Concierge'}</h2><p>AI assistant for Palm Regal</p></div>
        <div className="chat-head-actions">
          <button type="button" onClick={() => setHandoff(true)} className="chat-link">Talk to our team</button>
          {hasUser && <button type="button" onClick={reset} className="chat-link">New chat</button>}
          <button type="button" onClick={onClose} className="chat-x" aria-label="Close chat">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </header>

      <div ref={log} className="chat-log" data-lenis-prevent role="log" aria-live="polite" aria-label="Conversation">
        {!cfg && <p className="chat-note">Connecting</p>}
        {cfg && !cfg.enabled && <p className="chat-msg chat-msg--e">{cfg.message}</p>}
        {cfg?.enabled && <p className="chat-msg chat-msg--a">{cfg.greeting}</p>}
        {cfg?.enabled && !hasUser && (
          <div className="chat-chips">
            {CHIPS.map(t => <button key={t} type="button" onClick={() => send(t)} disabled={blocked}>{t}</button>)}
            <button type="button" onClick={() => setHandoff(true)}>Talk to our team</button>
          </div>
        )}
        {msgs.map((m, i) => (m.r === 'a' && !m.t) ? null : (
          <div key={i} className={`chat-turn chat-turn--${m.r}`}>
            <p className={`chat-msg chat-msg--${m.r}`}>{m.t}</p>
            {m.r === 'a' && m.i !== undefined && !busy && (
              <span className="chat-rate">
                <button type="button" aria-label="Helpful" aria-pressed={m.fb === 1} onClick={() => rate(m.i!, 1)}>{m.fb === 1 ? '\u{1F44D}' : '\u{1F44D}︎'}</button>
                <button type="button" aria-label="Not helpful" aria-pressed={m.fb === -1} onClick={() => rate(m.i!, -1)}>{m.fb === -1 ? '\u{1F44E}' : '\u{1F44E}︎'}</button>
              </span>
            )}
          </div>
        ))}
        {busy && (msgs[msgs.length - 1]?.r !== 'a' || !msgs[msgs.length - 1].t) && (
          <p className="chat-msg chat-msg--a chat-typing" aria-label="Typing"><i /><i /><i /></p>
        )}
        {handoff && (
          <div className="chat-handoff" role="group" aria-label="Contact our team">
            <p><strong>Talk to our team</strong><br />We are glad to help directly.</p>
            <div>
              {wa && <a className="chat-cta chat-cta--wa" href={`https://wa.me/${wa}?text=${encodeURIComponent(hi)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              {c?.phone && <a className="chat-cta" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>Call</a>}
              {c?.email && <a className="chat-cta" href={`mailto:${c.email}?subject=${encodeURIComponent('Enquiry from the website')}&body=${encodeURIComponent(hi)}`}>Email</a>}
            </div>
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={e => { e.preventDefault(); send(); }}>
        {/* honeypot: hidden from people and assistive tech, bots fill it */}
        <input ref={hp} className="chat-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {wait > 0 && <p className="chat-cool" role="status">Please wait {waitText} before sending another message.</p>}
        {ended && wait === 0 && <button type="button" className="chat-link" onClick={reset}>Start a new chat</button>}
        <div className="chat-row">
          <textarea
            ref={field} rows={1} value={input} maxLength={cfg?.maxInput ?? 500} placeholder="Type your question" aria-label="Your message"
            disabled={!cfg?.enabled} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button type="submit" className="chat-send" disabled={blocked || !input.trim()} aria-label="Send">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        <p className="chat-note">AI answers can be wrong. We keep this chat for 90 days to improve the service. Please do not share cards or passwords. For rates and availability, use Book direct.</p>
      </form>
    </div>
  );
}
