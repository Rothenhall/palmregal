'use client';
import { useId, useState } from 'react';
import type { Edit, Faq as FaqItem } from '@/content/types';
import { noEdit } from '@/lib/edit';
import { Todo } from './Todo';

export function Faq({ faqs, limit, f = noEdit }: { faqs: FaqItem[]; limit?: number; f?: Edit }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="faq">
      {faqs.slice(0, limit).map((q, i) => (
        <div className="q" key={i}>
          <button id={`${id}-q-${i}`} type="button" aria-expanded={open === i} aria-controls={`${id}-a-${i}`} onClick={() => setOpen(open === i ? null : i)} {...f(q, 'q')}>{q.q}<i aria-hidden="true" /></button>
          <div className="a" id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`} aria-hidden={open !== i} inert={open !== i}><div>{q.answer.map((p, k) => <p key={k} {...f(q, 'answer')}>{p}{k === q.answer.length - 1 && q.pending && <Todo>{q.pending}</Todo>}</p>)}</div></div>
        </div>
      ))}
    </div>
  );
}
