'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

/* The only chat code in the page's first load: a button and the greeting bubble. The panel, its styles and the
   fingerprint are separate chunks fetched on first click (or hover/focus, so it opens instantly).
   Whether to show at all comes from a tiny cached endpoint fetched after the page is idle. */
const ChatPanel = dynamic(() => import('./chat/ChatPanel'), { ssr: false });
const warm = () => { void import('./chat/ChatPanel'); };

type Cfg = { enabled: boolean; name?: string; teaser?: { text: string; delay: number; scroll: boolean; mobile: boolean; days: number } | null };
const KEY = 'pr_chat_tease';
const lsGet = () => { try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; } };
const lsSet = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} };

export function ChatLauncher() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [tease, setTease] = useState(false);
  const everOpened = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const go = () => fetch('/api/chat/config/').then(r => r.json()).then(setCfg).catch(() => {});
    const w = window as any;
    if (w.requestIdleCallback) { const h = w.requestIdleCallback(go, { timeout: 4000 }); return () => w.cancelIdleCallback?.(h); }
    const t = setTimeout(go, 2000); return () => clearTimeout(t);
  }, []);

  const t = cfg?.enabled ? cfg.teaser : null;
  useEffect(() => {
    if (!t) return;
    if (Date.now() - lsGet() < t.days * 86400_000) return;
    if (!t.mobile && matchMedia('(max-width: 760px)').matches) return;
    let done = false;
    const show = () => {
      if (done || everOpened.current || document.querySelector('dialog[open]')) return;
      done = true; lsSet(); setTease(true); cleanup();
    };
    const onScroll = () => { if (scrollY > (document.documentElement.scrollHeight - innerHeight) * 0.5) show(); };
    const timer = setTimeout(show, t.delay * 1000);
    if (t.scroll) addEventListener('scroll', onScroll, { passive: true });
    function cleanup() { clearTimeout(timer); removeEventListener('scroll', onScroll); }
    return cleanup;
  }, [t]);

  // the bubble goes away by itself, on Esc, or when dismissed; it never takes focus
  useEffect(() => {
    if (!tease) return;
    const off = setTimeout(() => setTease(false), 16000);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setTease(false); };
    addEventListener('keydown', esc);
    return () => { clearTimeout(off); removeEventListener('keydown', esc); };
  }, [tease]);

  const start = () => { everOpened.current = true; setTease(false); setLoaded(true); setOpen(true); };
  const close = () => { setOpen(false); btn.current?.focus(); };

  if (!cfg?.enabled) return null;
  const name = cfg.name || 'our assistant';
  return (
    <>
      {tease && t && !open && (
        <div className="chat-tease">
          <button type="button" className="chat-tease-text" onClick={start}>{t.text}</button>
          <button type="button" className="chat-tease-x" aria-label="Dismiss" onClick={() => setTease(false)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      )}
      <button
        ref={btn} type="button" className="chat-fab" aria-label={`Chat with ${name}`} aria-haspopup="dialog" aria-expanded={open}
        onClick={start} onPointerEnter={warm} onFocus={warm} hidden={open}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.6-4.9A8.5 8.5 0 1 1 21 12z" /><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
        </svg>
      </button>
      {loaded && <ChatPanel open={open} onClose={close} />}
    </>
  );
}
