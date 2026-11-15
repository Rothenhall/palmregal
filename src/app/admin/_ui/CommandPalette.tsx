'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight, BookOpen, BookPlus, ChartColumn, CornerDownLeft, Download, Globe, House, Inbox, MessageSquareWarning,
  KeyRound, MessageSquareQuote, PenLine, Search, SlidersHorizontal, TriangleAlert,
} from 'lucide-react';

/* Quick search: Ctrl+K (or ⌘K, or "/") anywhere in the admin, or the Search button in the sidebar.
   Jumps to any page or action, and searches the guest chats for whatever was typed. */

type Item = { id: string; label: string; hint?: string; group: 'Go to' | 'Actions'; icon: ReactNode; href: string; external?: boolean; words?: string };

const ITEMS: Item[] = [
  { id: 'home', label: 'Home', group: 'Go to', icon: <House size={16} />, href: '/admin/', words: 'dashboard overview start' },
  { id: 'inbox', label: 'Inbox', group: 'Go to', icon: <Inbox size={16} />, href: '/admin/inbox/', words: 'chats conversations messages guests' },
  { id: 'needs', label: 'Chats that need a reply', group: 'Go to', icon: <MessageSquareWarning size={16} />, href: '/admin/inbox/?view=needs', words: 'waiting handoff team urgent' },
  { id: 'unanswered', label: 'Unanswered questions', group: 'Go to', icon: <TriangleAlert size={16} />, href: '/admin/inbox/?view=unanswered', words: 'could not answer gaps' },
  { id: 'insights', label: 'Insights', group: 'Go to', icon: <ChartColumn size={16} />, href: '/admin/insights/', words: 'stats dates searches topics analytics report' },
  { id: 'knowledge', label: 'Knowledge', group: 'Go to', icon: <BookOpen size={16} />, href: '/admin/concierge/knowledge/', words: 'documents pdf notes library' },
  { id: 'settings', label: 'Assistant settings', group: 'Go to', icon: <SlidersHorizontal size={16} />, href: '/admin/concierge/', words: 'chat bot name greeting tone bubble blocked' },
  { id: 'testimonials', label: 'Testimonials', group: 'Go to', icon: <MessageSquareQuote size={16} />, href: '/admin/testimonials/', words: 'reviews guests quotes ratings stars' },
  { id: 'website', label: 'Website status', group: 'Go to', icon: <Globe size={16} />, href: '/admin/website/', words: 'publishing live health undo' },
  { id: 'edit', label: 'Edit website', hint: 'Opens the editor', group: 'Actions', icon: <PenLine size={16} />, href: '/admin/editor/#/~/admin/preview/', external: true, words: 'text photos change content' },
  { id: 'add', label: 'Add knowledge', hint: 'PDF, Word or a note', group: 'Actions', icon: <BookPlus size={16} />, href: '/admin/concierge/knowledge/?add=1', words: 'upload document teach' },
  { id: 'export', label: 'Download chats as a spreadsheet', hint: 'CSV', group: 'Actions', icon: <Download size={16} />, href: '/admin/inbox/export/', external: true, words: 'export csv excel' },
  { id: 'password', label: 'Change password', group: 'Actions', icon: <KeyRound size={16} />, href: '/admin/password/', words: 'security login sign in team' },
  { id: 'live', label: 'View live site', group: 'Actions', icon: <ArrowUpRight size={16} />, href: '/', external: true, words: 'open website public' },
];

const score = (it: Item, q: string) => {
  const label = it.label.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  return q.split(/\s+/).every(w => `${label} ${it.words ?? ''}`.includes(w)) ? 1 : 0;
};

export const openPalette = () => window.dispatchEvent(new Event('adm:palette'));

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [at, setAt] = useState(0);
  const dlg = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const router = useRouter();

  useEffect(() => {
    const show = () => setOpen(true);
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest('input, textarea, select, [contenteditable=true]');
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setOpen(o => !o); }
      else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !document.querySelector('dialog[open]')) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('adm:palette', show);
    document.addEventListener('keydown', key);
    return () => { window.removeEventListener('adm:palette', show); document.removeEventListener('keydown', key); };
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) { setQ(''); setAt(0); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    const found = query ? ITEMS.map(it => ({ it, s: score(it, query) })).filter(r => r.s > 0).sort((a, b) => b.s - a.s).map(r => r.it) : ITEMS;
    if (!query) return found;
    const chats: Item = { id: 'search', label: `Search chats for “${q.trim()}”`, group: 'Actions', icon: <Search size={16} />, href: `/admin/inbox/?q=${encodeURIComponent(q.trim())}` };
    return [...found, chats];
  }, [query, q]);

  useEffect(() => { setAt(0); }, [query]);
  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-i="${at}"]`)?.scrollIntoView({ block: 'nearest' }); }, [at]);

  const run = (it: Item | undefined) => {
    if (!it) return;
    setOpen(false);
    if (it.external) window.location.href = it.href;
    else router.push(it.href);
  };

  const groups = (['Go to', 'Actions'] as const).map(g => ({ g, items: results.filter(r => r.group === g) })).filter(x => x.items.length);
  let i = -1;

  return (
    <dialog
      ref={dlg} className="adm-dialog adm-cmd" aria-label="Quick search"
      onClose={() => setOpen(false)} onClick={e => { if (e.target === dlg.current) setOpen(false); }}
    >
      {open && (
        <div className="adm-cmd-inner">
          <div className="adm-cmd-input">
            <Search size={18} aria-hidden="true" />
            <input
              autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages, actions or guest chats…"
              role="combobox" aria-expanded="true" aria-controls="adm-cmd-list" aria-activedescendant={results[at] ? `adm-cmd-${results[at].id}` : undefined}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setAt(a => (a + 1) % Math.max(1, results.length)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setAt(a => (a - 1 + results.length) % Math.max(1, results.length)); }
                else if (e.key === 'Enter') { e.preventDefault(); run(results[at]); }
              }}
            />
            <kbd>Esc</kbd>
          </div>
          <ul className="adm-cmd-list" id="adm-cmd-list" role="listbox" ref={list}>
            {groups.map(({ g, items }) => (
              <li key={g} role="presentation">
                <p className="adm-cmd-group">{g}</p>
                <ul role="presentation">
                  {items.map(it => {
                    i += 1;
                    const n = i;
                    return (
                      <li
                        key={it.id} id={`adm-cmd-${it.id}`} role="option" aria-selected={n === at} data-i={n}
                        className="adm-cmd-item" onMouseMove={() => setAt(n)} onClick={() => run(it)}
                      >
                        <span className="adm-cmd-icon" aria-hidden="true">{it.icon}</span>
                        <span className="adm-cmd-label">{it.label}{it.hint && <small>{it.hint}</small>}</span>
                        {n === at && <CornerDownLeft size={14} className="adm-cmd-enter" aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          <div className="adm-cmd-foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span>
            <span className="adm-cmd-tip">In the inbox: <kbd>J</kbd><kbd>K</kbd> next and previous chat, <kbd>E</kbd> mark as done</span>
          </div>
        </div>
      )}
    </dialog>
  );
}

/** The Search button in the sidebar (and the magnifier in the phone top bar). */
export function PaletteButton({ compact }: { compact?: boolean }) {
  const [mac, setMac] = useState(false);
  useEffect(() => { setMac(/Mac|iPhone|iPad/.test(navigator.platform)); }, []);
  if (compact) {
    return <button type="button" className="adm-btn adm-btn--ghost adm-btn--icon" aria-label="Quick search" onClick={openPalette}><Search size={20} /></button>;
  }
  return (
    <button type="button" className="adm-cmd-btn" onClick={openPalette}>
      <Search size={16} aria-hidden="true" /><span>Search</span><kbd aria-hidden="true">{mac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
  );
}
