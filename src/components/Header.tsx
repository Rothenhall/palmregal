'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { nav, site } from '@/content/site';
import { Icon } from './Icons';
import { waHref } from '@/lib/book';

const DARK = ['teal', 'canopy', 'night', 'dusk'];

export function Header() {
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hdr = ref.current!; let lastY = window.scrollY; let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY, hero = document.querySelector<HTMLElement>('.hero');
      const solidAt = hero ? hero.offsetTop + hero.offsetHeight - 80 : 40;
      const solid = y > solidAt;
      hdr.classList.toggle('solid', solid);
      if (y > 300 && y > lastY + 4) hdr.classList.add('hide'); else if (y < lastY - 4 || y < 300) hdr.classList.remove('hide');
      lastY = y;
      let dark = false;
      {
        const probe = 38;
        if (hero && hero.dataset.dark === '1') { const r = hero.getBoundingClientRect(); dark = r.top <= probe && r.bottom >= probe; }
        if (!dark) document.querySelectorAll<HTMLElement>('main [data-bg]').forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom >= probe && DARK.includes(s.dataset.bg || '')) dark = true; });
      }
      hdr.classList.toggle('over-dark', dark);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pr:hero', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('pr:hero', onScroll); cancelAnimationFrame(raf); };
  }, [path]);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (open) { lenis?.stop(); closeBtn.current?.focus(); } else lenis?.start();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); openBtn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="hdr" ref={ref}>
        <div className="wrap">
          <Link className="logo" href="/" aria-label="Palm Regal, home">
            <img src="/img/emblem.png" alt="" width={40} height={40} />
            <span><b>{site.name}</b><small>{site.tagline}</small></span>
          </Link>
          <nav className="nav" aria-label="Main">
            {nav.map(n => (
              <Link key={n.href} href={n.href}>
                <span className="roll"><span>{n.label}</span><span aria-hidden="true">{n.label}</span></span>
              </Link>
            ))}
          </nav>
          <div className="acts">
            <a className="ibtn opt" href={site.phoneHref} aria-label="Call Palm Regal"><Icon id="i-phone" /></a>
            <a className="ibtn opt" href={waHref()} aria-label="WhatsApp Palm Regal"><Icon id="i-wa" /></a>
            <Link className="btn btn--book" href="/#book">Book direct</Link>
            <button ref={openBtn} className="ibtn menu-btn" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(true)}><Icon id="i-menu" /></button>
          </div>
        </div>
      </header>
      <div className={open ? 'mnav open' : 'mnav'} id="mnav" role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="mnav-top">
          <Link className="logo" href="/" onClick={() => setOpen(false)}><img src="/img/emblem.png" alt="" width={40} height={40} /><span><b>{site.name}</b></span></Link>
          <button ref={closeBtn} className="ibtn" type="button" aria-label="Close menu" onClick={() => { setOpen(false); openBtn.current?.focus(); }}><Icon id="i-x" /></button>
        </div>
        <nav aria-label="Mobile">
          <Link href="/" onClick={() => setOpen(false)}><i>00</i>Home</Link>
          {nav.map((n, i) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}><i>0{i + 1}</i>{n.label}</Link>)}
        </nav>
        <div className="mnav-foot">
          <Link className="btn btn--book" href="/#book" onClick={() => setOpen(false)}>Book direct</Link>
          <a className="btn btn--line" href={site.phoneHref} onClick={() => setOpen(false)}><Icon id="i-phone" />Call</a>
          <a className="btn btn--line" href={waHref()} onClick={() => setOpen(false)}><Icon id="i-wa" />WhatsApp</a>
        </div>
      </div>
    </>
  );
}
