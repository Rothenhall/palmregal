/* Server-safe building blocks for the admin. No hooks, so they work in server and client components alike. */
import Link from 'next/link';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export const btn = (variant: Variant = 'secondary', size: 'sm' | 'md' = 'md', icon = false) =>
  `adm-btn adm-btn--${variant}${size === 'sm' ? ' adm-btn--sm' : ''}${icon ? ' adm-btn--icon' : ''}`;

export function ButtonLink({ href, variant = 'secondary', size = 'md', children, external }: { href: string; variant?: Variant; size?: 'sm' | 'md'; children: ReactNode; external?: boolean }) {
  // The editor is a static page outside the app router, so it gets a plain anchor.
  if (external) return <a className={btn(variant, size)} href={href}>{children}</a>;
  return <Link className={btn(variant, size)} href={href}>{children}</Link>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="adm-pagehead">
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {actions && <div className="adm-pagehead-actions">{actions}</div>}
    </header>
  );
}

export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return <section className={`adm-card ${className}`} {...rest}>{children}</section>;
}

export function Section({ id, title, description, badge, actions, children }: { id?: string; title: string; description?: ReactNode; badge?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="adm-card adm-section" id={id} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="adm-section-head">
        <div><h2 id={id ? `${id}-h` : undefined}>{title}{badge}</h2>{description && <p>{description}</p>}</div>
        {actions}
      </div>
      <div className="adm-section-body">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, sub, href, tone, children }: { label: string; value: ReactNode; sub?: ReactNode; href?: string; tone?: 'amber'; children?: ReactNode }) {
  const inner = (
    <>
      <span className="adm-stat-label">{label}</span>
      <span className="adm-stat-value">{value}</span>
      {children}
      {sub && <span className="adm-stat-sub">{sub}</span>}
    </>
  );
  const cls = `adm-card adm-stat${tone ? ` adm-stat--${tone}` : ''}${href ? ' adm-stat--link' : ''}`;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export function Badge({ tone = 'neutral', children, dot }: { tone?: 'neutral' | 'teal' | 'amber' | 'red'; children: ReactNode; dot?: boolean }) {
  return <span className={`adm-badge adm-badge--${tone}`}>{dot && <i aria-hidden="true" />}{children}</span>;
}

export function Progress({ value, label, tone }: { value: number; label: string; tone?: 'amber' | 'red' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return <div className={`adm-progress${tone ? ` adm-progress--${tone}` : ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}><span style={{ width: `${pct}%` }} /></div>;
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      <span className="adm-empty-icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Avatar({ text }: { text: string }) {
  return <span className="adm-avatar" aria-hidden="true">{text}</span>;
}

/* ---------- form fields: label, help text and inline error in one place ---------- */

export function Field({ label, help, error, htmlFor, children, counter }: { label: string; help?: ReactNode; error?: string | null; htmlFor?: string; children: ReactNode; counter?: string }) {
  return (
    <div className={`adm-field${error ? ' has-error' : ''}`}>
      <div className="adm-field-top"><label htmlFor={htmlFor}>{label}</label>{counter && <span className="adm-counter">{counter}</span>}</div>
      {children}
      {error ? <p className="adm-field-error" role="alert">{error}</p> : help ? <p className="adm-field-help">{help}</p> : null}
    </div>
  );
}
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`adm-input ${p.className ?? ''}`} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={`adm-input adm-textarea ${p.className ?? ''}`} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`adm-input ${p.className ?? ''}`} />;

/** A checkbox styled as a switch. Works inside plain forms (posts "on") and controlled in client forms. */
export function Switch({ label, help, ...rest }: { label: string; help?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className="adm-switchrow">
      <span><b>{label}</b>{help && <small>{help}</small>}</span>
      <input type="checkbox" role="switch" className="adm-switch" {...rest} />
    </label>
  );
}
