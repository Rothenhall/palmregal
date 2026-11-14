'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookPlus, CheckCheck, X } from 'lucide-react';
import { AddKnowledge } from '../concierge/knowledge/AddKnowledge';
import { useToast } from '../../_ui/Toast';
import { Badge, EmptyState, btn } from '../../_ui/ui';
import { markGap } from './actions';

export type GapRow = { key: string; question: string; count: number; lastAsked: string; samples: string[] };

export function GapList({ gaps, limits }: { gaps: GapRow[]; limits: { noteChars: number; fileMb: number } }) {
  const [active, setActive] = useState<GapRow | null>(null);
  const router = useRouter();
  const toast = useToast();
  const defaults = useMemo(() => (active ? { tab: 'note' as const, title: active.question.slice(0, 80), hint: 'Write the answer guests should get. For example: “Yes, small pets are welcome with a refundable deposit.”' } : undefined), [active]);

  if (!gaps.length) return <EmptyState icon={<CheckCheck size={22} />} title="No open gaps">Questions the assistant could not answer will be grouped here, so you can teach it the answer.</EmptyState>;
  return (
    <>
      <ul className="adm-gaps">
        {gaps.map(g => (
          <li key={g.key}>
            <div className="adm-gap-main">
              <b>{g.question}</b>
              <span className="adm-gap-meta"><Badge tone="amber">Asked {g.count} {g.count === 1 ? 'time' : 'times'}</Badge><small>Last {g.lastAsked}</small></span>
              {g.samples.length > 1 && <small className="adm-gap-samples">Also asked as: {g.samples.filter(s => s !== g.question).map(s => `“${s}”`).join(', ')}</small>}
            </div>
            <div className="adm-gap-actions">
              <button type="button" className={btn('primary', 'sm')} onClick={() => setActive(g)}><BookPlus size={14} aria-hidden="true" />Add answer</button>
              <button type="button" className={btn('ghost', 'sm')} onClick={async () => { await markGap(g.key, 'dismissed'); toast('Dismissed'); router.refresh(); }}><X size={14} aria-hidden="true" />Dismiss</button>
            </div>
          </li>
        ))}
      </ul>
      <AddKnowledge
        open={!!active} onClose={() => setActive(null)} limits={limits} defaults={defaults}
        onAdded={async () => { if (active) { await markGap(active.key, 'resolved'); router.refresh(); } }}
      />
    </>
  );
}
