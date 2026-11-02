'use client';
import { useState } from 'react';
import { faqs } from '@/content/site';
import { Todo } from './Todo';

export function Faq({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq">
      {faqs.slice(0, limit).map((f, i) => (
        <div className="q" key={f.q}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{f.q}<i aria-hidden="true" /></button>
          <div className="a"><div>{f.a.map((p, k) => <p key={k}>{p}{k === f.a.length - 1 && f.todo && <Todo>{f.todo}</Todo>}</p>)}</div></div>
        </div>
      ))}
    </div>
  );
}
