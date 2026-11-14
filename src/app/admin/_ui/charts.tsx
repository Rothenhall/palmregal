/* Plain CSS bars for Insights. No chart library. Server-safe and reusable. */
import type { ReactNode } from 'react';

export function BarList({ items, empty }: { items: { label: ReactNode; value: number; hint?: ReactNode }[]; empty?: string }) {
  const max = Math.max(1, ...items.map(i => i.value));
  if (!items.length || items.every(i => !i.value)) return <p className="adm-muted">{empty ?? 'Nothing to show yet.'}</p>;
  return (
    <ul className="adm-bars">
      {items.map((it, i) => (
        <li key={i}>
          <span className="adm-bars-label">{it.label}</span>
          <span className="adm-bars-track" aria-hidden="true"><i style={{ width: `${(it.value / max) * 100}%` }} /></span>
          <span className="adm-bars-value">{it.value.toLocaleString('en-IN')}{it.hint && <small> {it.hint}</small>}</span>
        </li>
      ))}
    </ul>
  );
}

/** Vertical columns, one per value (hours of the day, days of a month). */
export function Columns({ values, labels, summary, tickEvery = 1 }: { values: number[]; labels: string[]; summary: string; tickEvery?: number }) {
  const max = Math.max(1, ...values);
  return (
    <div className="adm-cols-chart" role="img" aria-label={summary}>
      <div className="adm-cols-plot">
        {values.map((v, i) => (
          <span key={i} className="adm-col" title={`${labels[i]}: ${v.toLocaleString('en-IN')}`}>
            <i style={{ height: v ? `${Math.max(4, (v / max) * 100)}%` : '2px' }} data-zero={v ? undefined : ''} />
          </span>
        ))}
      </div>
      <div className="adm-cols-axis" aria-hidden="true">
        {labels.map((l, i) => <span key={i}>{i % tickEvery === 0 ? l : ''}</span>)}
      </div>
    </div>
  );
}
