'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Segmented } from '../../_ui/Segmented';

type View = 'all' | 'needs' | 'unanswered';

/** Filter and search for the inbox list. State lives in the address, so a refresh or a shared link keeps it. */
export function InboxToolbar({ view, q, counts }: { view: View; q: string; counts: Record<View, number> }) {
  const router = useRouter();
  const [text, setText] = useState(q);
  const [, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setText(q), [q]);

  const go = (v: View, query: string) => {
    const p = new URLSearchParams();
    if (v !== 'all') p.set('view', v);
    if (query.trim()) p.set('q', query.trim());
    start(() => router.replace(`/admin/inbox/${p.size ? `?${p}` : ''}`));
  };
  const label = (t: string, n: number) => <>{t}{n > 0 && <i className="adm-seg-count">{n}</i>}</>;

  return (
    <div className="adm-inbox-tools">
      <form role="search" className="adm-search" onSubmit={e => { e.preventDefault(); clearTimeout(timer.current); go(view, text); }}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search" value={text} placeholder="Search messages" aria-label="Search messages"
          onChange={e => { setText(e.target.value); clearTimeout(timer.current); const v = e.target.value; timer.current = setTimeout(() => go(view, v), 350); }}
        />
        {text && <button type="button" aria-label="Clear search" onClick={() => { setText(''); go(view, ''); }}><X size={14} /></button>}
      </form>
      <Segmented<View>
        label="Show" size="sm" value={view} onChange={v => go(v, text)}
        options={[
          { value: 'all', label: label('All', counts.all) },
          { value: 'needs', label: label('Needs reply', counts.needs) },
          { value: 'unanswered', label: label('Unanswered', counts.unanswered) },
        ]}
      />
    </div>
  );
}
