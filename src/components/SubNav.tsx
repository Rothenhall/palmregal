'use client';
/* In-page menu for long pages: sticks below the header and marks the section you're reading */
import { useEffect, useState } from 'react';

export function SubNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [on, setOn] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setOn(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    items.forEach(i => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault(); const el = document.getElementById(id); if (!el) return;
    const lenis = (window as any).__lenis; lenis ? lenis.scrollTo(el, { offset: -130 }) : el.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  };
  return (
    <nav className="subnav" aria-label={label}>
      <div className="subnav-in">
        {items.map((i, k) => (
          <a key={i.id} href={'#' + i.id} onClick={go(i.id)} aria-current={on === i.id ? 'true' : undefined}><span>{String(k + 1).padStart(2, '0')}</span>{i.label}</a>
        ))}
      </div>
    </nav>
  );
}
