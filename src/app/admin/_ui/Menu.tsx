'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';

export type MenuItem =
  | { label: string; icon?: ReactNode; onSelect: () => void; danger?: boolean; disabled?: boolean }
  | { label: string; icon?: ReactNode; href: string; external?: boolean; danger?: boolean }
  | { separator: true };

/** Dropdown menu: arrow keys, Home/End, Esc, click outside. */
export function Menu({ trigger, label, items, align = 'right', placement = 'bottom', triggerClass = 'adm-btn adm-btn--ghost adm-btn--icon adm-btn--sm', header }: {
  trigger: ReactNode; label: string; items: MenuItem[]; align?: 'left' | 'right'; placement?: 'top' | 'bottom'; triggerClass?: string; header?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', down);
    root.current?.querySelector<HTMLElement>('[role=menuitem]:not([disabled])')?.focus();
    return () => document.removeEventListener('pointerdown', down);
  }, [open]);

  const close = (refocus = true) => { setOpen(false); if (refocus) btnRef.current?.focus(); };
  const onKey = (e: React.KeyboardEvent) => {
    const els = [...(root.current?.querySelectorAll<HTMLElement>('[role=menuitem]:not([disabled])') ?? [])];
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); els[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); els[els.length - 1]?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div className="adm-menu" ref={root} onKeyDown={open ? onKey : undefined}>
      <button
        ref={btnRef} type="button" className={triggerClass} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={label}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); } }}
      >{trigger}</button>
      {open && (
        <div id={id} role="menu" aria-label={label} className={`adm-menu-panel adm-menu-panel--${align} adm-menu-panel--${placement}`}>
          {header && <div className="adm-menu-header">{header}</div>}
          {items.map((it, i) => {
            if ('separator' in it) return <hr key={i} role="separator" />;
            const cls = `adm-menu-item${it.danger ? ' is-danger' : ''}`;
            if ('href' in it) {
              return it.external
                ? <a key={i} role="menuitem" className={cls} href={it.href} target="_blank" rel="noopener" onClick={() => close(false)}>{it.icon}{it.label}</a>
                : <Link key={i} role="menuitem" className={cls} href={it.href} onClick={() => close(false)}>{it.icon}{it.label}</Link>;
            }
            return <button key={i} role="menuitem" type="button" className={cls} disabled={it.disabled} onClick={() => { close(false); it.onSelect(); }}>{it.icon}{it.label}</button>;
          })}
        </div>
      )}
    </div>
  );
}
