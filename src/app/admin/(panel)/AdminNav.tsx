'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, BookOpen, ChartColumn, Globe, House, Inbox, PenLine, SlidersHorizontal } from 'lucide-react';

const icons = { home: House, inbox: Inbox, knowledge: BookOpen, settings: SlidersHorizontal, edit: PenLine, insights: ChartColumn, website: Globe };
export type NavGroup = { label?: string; items: { href: string; label: string; icon: keyof typeof icons; exact?: boolean; badge?: number; external?: boolean }[] };

export function AdminNav({ groups }: { groups: NavGroup[] }) {
  const path = (usePathname() || '').replace(/\/+$/, '') || '/';
  return (
    <nav className="adm-nav" aria-label="Main">
      {groups.map((g, i) => (
        <div className="adm-nav-group" key={i}>
          {g.label && <p className="adm-nav-label">{g.label}</p>}
          {g.items.map(it => {
            const Icon = icons[it.icon];
            const base = it.href.replace(/\/+$/, '');
            const active = !it.external && (it.exact ? path === base : path === base || path.startsWith(base + '/'));
            const inner = (
              <>
                <Icon size={18} aria-hidden="true" />
                <span>{it.label}</span>
                {it.badge ? <b className="adm-nav-badge" aria-label={`${it.badge} waiting`}>{it.badge}</b> : null}
                {it.external && <ArrowUpRight size={14} className="adm-nav-ext" aria-hidden="true" />}
              </>
            );
            return it.external
              ? <a key={it.href} href={it.href} className="adm-nav-item">{inner}</a>
              : <Link key={it.href} href={it.href} className="adm-nav-item" aria-current={active ? 'page' : undefined}>{inner}</Link>;
          })}
        </div>
      ))}
    </nav>
  );
}
