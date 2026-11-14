'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* Keyboard for the inbox: J / ↓ next chat, K / ↑ previous, E mark as done (or reopen), Esc back to the list.
   Works from the rows on the page, so it always follows the current filter and search. */
export function InboxKeys({ back }: { back: string }) {
  const router = useRouter();
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open], [role=menu]')) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable=true]')) return;
      const rows = [...document.querySelectorAll<HTMLAnchorElement>('.adm-inbox-list a[data-conv]')];
      const cur = rows.findIndex(r => r.getAttribute('aria-current') === 'true');
      const go = (i: number) => { const r = rows[i]; if (!r) return; e.preventDefault(); router.push(r.getAttribute('href')!, { scroll: false }); r.scrollIntoView({ block: 'nearest' }); };
      const k = e.key.toLowerCase();
      if (k === 'j' || e.key === 'ArrowDown') go(cur < 0 ? 0 : Math.min(rows.length - 1, cur + 1));
      else if (k === 'k' || e.key === 'ArrowUp') go(cur < 0 ? 0 : Math.max(0, cur - 1));
      else if (k === 'e' && cur >= 0) { const b = document.querySelector<HTMLButtonElement>('.adm-inbox-detail [data-key=done]'); if (b) { e.preventDefault(); b.click(); } }
      else if (e.key === 'Escape' && cur >= 0) { e.preventDefault(); router.push(back, { scroll: false }); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [router, back]);
  return null;
}
