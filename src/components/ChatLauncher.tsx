'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

/* The only chat code in the page's first load: a button and the greeting bubble. The panel, its styles and the
   fingerprint are separate chunks fetched on first click (or hover/focus, so it opens instantly).
   Whether to show at all comes from a tiny cached endpoint fetched after the page is idle. */
const ChatPanel = dynamic(() => import('./chat/ChatPanel'), { ssr: false });
const warm = () => { void import('./chat/ChatPanel'); };

/* the concierge's mark: a hotel service bell, the sign of a front desk that is there to help */
export function BellIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5a7.5 7.5 0 0 1 15 0" /><path d="M3 16.5h18" /><path d="M5 19.5h14" />
      <path d="M12 9V7.4" /><circle cx="12" cy="6.2" r="1.2" /><path d="M8.6 12.6a4.2 4.2 0 0 1 2.2-1.6" />
    </svg>
  );
}

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
    /* halfway down the page. The page height is kept up to date by an observer, never measured while
       scrolling (that forces a full layout on every scroll event), and the check runs once a frame. */
    let half = Infinity, frame = 0;
    const measure = () => { half = (document.documentElement.scrollHeight - innerHeight) * 0.5; };
    const size = new ResizeObserver(measure);
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (scrollY > half) show(); }); };
    const timer = setTimeout(show, t.delay * 1000);
    if (t.scroll) { size.observe(document.body); measure(); addEventListener('scroll', onScroll, { passive: true }); }
    function cleanup() { clearTimeout(timer); cancelAnimationFrame(frame); size.disconnect(); removeEventListener('scroll', onScroll); }
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
  const name = cfg.name || 'Aria';
  return (
    <>
      {tease && t && !open && (
        <div className="chat-tease">
          <img className="chat-tease-av" src="/img/emblem.png" alt="" width={34} height={34} />
          <button type="button" className="chat-tease-text" onClick={start}><small>{name}</small>{t.text}</button>
          <button type="button" className="chat-tease-x" aria-label="Dismiss" onClick={() => setTease(false)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      )}
      <button
        ref={btn} type="button" className="chat-fab" aria-label={`Chat with ${name}`} aria-haspopup="dialog" aria-expanded={open}
        onClick={start} onPointerEnter={warm} onFocus={warm} hidden={open}
      >
        <BellIcon size={24} />
        <i className="chat-fab-dot" aria-hidden="true" />
        <span className="chat-fab-tip" aria-hidden="true">Chat with {name}</span>
      </button>
      {loaded && <ChatPanel open={open} onClose={close} />}
    </>
  );
}
