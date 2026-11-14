'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Edit, SiteContent } from '@/content/types';
import { Icon } from './Icons';
import { bookHref, telHref, waHref } from '@/lib/book';
import { noEdit } from '@/lib/edit';

const DARK = ['teal', 'canopy', 'night', 'dusk'];

export function Header({ content, f = noEdit }: { content: SiteContent; f?: Edit }) {
  const site = content.general, buttons = content.buttons;
  const nav = [
    { href: '/#suites', key: 'suites' }, { href: '/#facilities', key: 'facilities' }, { href: '/#gallery', key: 'gallery' },
    { href: '/#location', key: 'location' }, { href: '/#contact', key: 'contact' },
  ] as const;
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hdr = ref.current!; let lastY = window.scrollY; let raf = 0;
    /* Section edges are measured only when the layout changes, never while scrolling: reading
       positions mid-scroll forces the browser to lay out the page again in every frame. */
    const PROBE = 38;
    let solidAt = 40, darkSpans: [number, number][] = [];
    const measure = () => {
      const y = window.scrollY, hero = document.querySelector<HTMLElement>('.hero');
      solidAt = hero ? hero.offsetTop + hero.offsetHeight - 80 : 40;
      darkSpans = Array.from(document.querySelectorAll<HTMLElement>('main [data-bg], main [data-dark="1"]'))
        .filter(s => s.dataset.dark === '1' || DARK.includes(s.dataset.bg || ''))
        .map(s => { const r = s.getBoundingClientRect(); return [r.top + y, r.bottom + y] as [number, number]; });
      update();
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY, at = y + PROBE;
      hdr.classList.toggle('solid', y > solidAt);
      if (y > 300 && y > lastY + 4) hdr.classList.add('hide'); else if (y < lastY - 4 || y < 300) hdr.classList.remove('hide');
      lastY = y;
      hdr.classList.toggle('over-dark', darkSpans.some(([top, bottom]) => top <= at && bottom >= at));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const layout = new ResizeObserver(() => measure());
    layout.observe(document.body);
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); layout.disconnect(); cancelAnimationFrame(raf); };
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
            <span><b {...f(site, 'name')}>{site.name}</b><small {...f(site, 'tagline')}>{site.tagline}</small></span>
          </Link>
          <nav className="nav" aria-label="Main">
            {nav.map(n => (
              <Link key={n.href} href={n.href} {...f(content.nav, n.key)}>
                <span className="roll"><span>{content.nav[n.key]}</span><span aria-hidden="true">{content.nav[n.key]}</span></span>
              </Link>
            ))}
          </nav>
          <div className="acts">
            <a className="ibtn opt" href={telHref(site.phone)} aria-label="Call Palm Regal"><Icon id="i-phone" /></a>
            <a className="ibtn opt" href={waHref(site)} aria-label="WhatsApp Palm Regal"><Icon id="i-wa" /></a>
            <a className="btn btn--book" href={bookHref(site)} data-book="" {...f(buttons, 'bookDirect')}>{buttons.bookDirect}</a>
            <button ref={openBtn} className="ibtn menu-btn" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="mnav" onClick={() => setOpen(true)}><Icon id="i-menu" /></button>
          </div>
        </div>
      </header>
      <div className={open ? 'mnav open' : 'mnav'} id="mnav" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="mnav-top">
          <Link className="logo" href="/" onClick={() => setOpen(false)}><img src="/img/emblem.png" alt="" width={40} height={40} /><span><b>{site.name}</b></span></Link>
          <button ref={closeBtn} className="ibtn" type="button" aria-label="Close menu" onClick={() => { setOpen(false); openBtn.current?.focus(); }}><Icon id="i-x" /></button>
        </div>
        <nav aria-label="Mobile">
          <Link href="/" onClick={() => setOpen(false)}><i>00</i>Home</Link>
          {nav.map((n, i) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)}><i>0{i + 1}</i>{content.nav[n.key]}</Link>)}
        </nav>
        <div className="mnav-foot">
          <a className="btn btn--book" href={bookHref(site)} data-book="" onClick={() => setOpen(false)}>{buttons.bookDirect}</a>
          <a className="btn btn--line" href={telHref(site.phone)} onClick={() => setOpen(false)}><Icon id="i-phone" />Call</a>
          <a className="btn btn--line" href={waHref(site)} onClick={() => setOpen(false)}><Icon id="i-wa" />WhatsApp</a>
        </div>
      </div>
    </>
  );
}
