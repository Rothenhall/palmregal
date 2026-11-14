'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ToastProvider } from '../_ui/Toast';

/* Mobile: a slim top bar with a menu button opens the sidebar as a drawer. A drawer (not a bottom tab bar) because there
   are groups, an account menu and a badge to carry, and five tabs plus an account would not fit comfortably. */
export function ShellFrame({ sidebar, children, badge, resort }: { sidebar: ReactNode; children: ReactNode; badge: number; resort: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);
  return (
    <ToastProvider>
      <div className="adm-shell" data-nav-open={open}>
        <header className="adm-topbar">
          <button ref={btn} type="button" className="adm-btn adm-btn--ghost adm-btn--icon" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="adm-side" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="adm-wordmark">{resort}</span>
          {badge > 0 && <b className="adm-nav-badge" aria-label={`${badge} waiting for a reply`}>{badge}</b>}
        </header>
        <div className="adm-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
        <aside id="adm-side" className="adm-side">{sidebar}</aside>
        <main className="adm-main" id="main">{children}</main>
      </div>
    </ToastProvider>
  );
}
