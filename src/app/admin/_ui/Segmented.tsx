'use client';
import { useId, type ReactNode } from 'react';

/** Segmented control built on radio inputs, so arrow keys, focus and form posting work natively. */
export function Segmented<T extends string>({ label, value, onChange, options, name, size }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; name?: string; size?: 'sm';
}) {
  const g = useId();
  return (
    <div className={`adm-seg${size ? ' adm-seg--sm' : ''}`} role="radiogroup" aria-label={label}>
      {options.map(o => (
        <label key={o.value} className={o.value === value ? 'is-on' : ''}>
          <input type="radio" name={name ?? g} value={o.value} checked={o.value === value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
