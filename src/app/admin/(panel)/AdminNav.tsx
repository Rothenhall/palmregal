'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sections } from './sections';

export function AdminNav() {
  const path = (usePathname() || '').replace(/\/+$/, '') || '/';
  return (
    <nav className="adm-nav" aria-label="Admin">
      {sections.map(s => {
        const active = path === s.href.replace(/\/+$/, '');
        return <Link key={s.href} href={s.href} aria-current={active ? 'page' : undefined}>{s.label}</Link>;
      })}
    </nav>
  );
}
