'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/* Keeps a page current without a manual reload: refreshes the server data every `every` seconds while the tab is
   visible, and straight away when the tab comes back into view. It waits while someone is typing or a dialog is open,
   so nothing jumps under their hands. Shows a small "Live" pill that can also refresh on demand. */
export function LiveRefresh({ every = 30 }: { every?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [at, setAt] = useState(() => Date.now());
  const [, tick] = useState(0);

  useEffect(() => {
    const busy = () => !!document.querySelector('dialog[open]') || !!document.activeElement?.closest('input, textarea, select, [contenteditable=true]');
    const refresh = () => { if (document.visibilityState !== 'visible' || busy()) return; start(() => router.refresh()); setAt(Date.now()); };
    const id = window.setInterval(refresh, every * 1000);
    const clock = window.setInterval(() => tick(t => t + 1), 15_000);
    const vis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', vis);
    return () => { clearInterval(id); clearInterval(clock); document.removeEventListener('visibilitychange', vis); };
  }, [every, router]);

  const s = Math.round((Date.now() - at) / 1000);
  const ago = s < 20 ? 'just now' : s < 60 ? `${s}s ago` : `${Math.round(s / 60)} min ago`;
  return (
    <button
      type="button" className="adm-live" data-pending={pending || undefined}
      title={`Updates by itself every ${every} seconds. Last updated ${ago}. Click to update now.`}
      onClick={() => { start(() => router.refresh()); setAt(Date.now()); }}
    >
      <i aria-hidden="true" /><span>Live</span><small>· {ago}</small><RefreshCw size={12} aria-hidden="true" />
    </button>
  );
}
