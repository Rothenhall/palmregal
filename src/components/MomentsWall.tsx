'use client';
/* A wall of moments: tiles drift with the cursor, and a click opens one large with its caption.
   On phones the wall is replaced by a clean two-column photo grid under the copy (see moments.css). */
import './moments.css';
import { useEffect, useRef, useState } from 'react';
import type { GalleryPhoto } from '@/content/types';
import { Icon } from './Icons';

const COLS = 9, ROWS = 6;
const FIRST = 12; /* photos shown in the phone grid before "Show all photos" */

export function MomentsWall({ gallery }: { gallery: GalleryPhoto[] }) {
  const n = gallery.length;
  const tileIdx = (i: number) => (i * 7) % n;
  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => gallery[tileIdx(i)]);
  const wall = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  /* open holds an index into gallery, so the viewer can step through every photo */
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(n <= FIRST);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  const show = (i: number, el: HTMLElement) => { opener.current = el; setOpen(i); };
  const close = () => { setOpen(null); opener.current?.focus(); };
  const step = (d: number) => setOpen(o => (o === null ? o : (o + d + n) % n));

  /* the wall drifts only while its section is on screen (data-live), so it costs nothing elsewhere */
  useEffect(() => {
    const host = wall.current!.closest<HTMLElement>('.moments-sec');
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) host.dataset.live = ''; else delete host.dataset.live; });
    io.observe(host);
    return () => { io.disconnect(); delete host.dataset.live; };
  }, []);

  useEffect(() => {
    const w = wall.current!; const sec = w.parentElement!;
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => { const r = sec.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * -40; ty = ((e.clientY - r.top) / r.height - .5) * -30; if (!raf) raf = requestAnimationFrame(step); };
    const step = () => { x += (tx - x) * .06; y += (ty - y) * .06; w.style.setProperty('--mx', x.toFixed(2) + 'px'); w.style.setProperty('--my', y.toFixed(2) + 'px'); raf = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(step) : 0; };
    sec.addEventListener('pointermove', move);
    return () => { sec.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  /* phone grid: each photo fades up once as it scrolls into view */
  useEffect(() => {
    const g = grid.current;
    if (!g || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    g.classList.add('reveal');
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = ''; io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    g.querySelectorAll<HTMLElement>('li:not([data-in])').forEach(li => io.observe(li));
    return () => io.disconnect();
  }, [all]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open !== null]);

  const shown = all ? gallery : gallery.slice(0, FIRST);
  const cur = open !== null ? gallery[open] : null;

  return (
    <>
      <div className="mwall-par" data-speed="-0.35" data-ptrigger=".moments-sec"><div className={'mwall' + (open !== null ? ' dim' : '')} ref={wall}>
        {tiles.map((t, i) => (
          <button key={i} type="button" className="mtile2" style={{ ['--d' as string]: `${((i * 37) % 11) / 10}`, animationDelay: `${(i % COLS) * .04 + Math.floor(i / COLS) * .08}s` }} onClick={e => show(tileIdx(i), e.currentTarget)} aria-label={`Open moment: ${t.cap}`} tabIndex={i < 12 ? 0 : -1}>
            <img src={t.src} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div></div>
      <p className="mhint" aria-hidden="true">Click a moment</p>

      <ul className="mgrid" ref={grid} aria-label="Photo gallery">
        {shown.map((p, i) => (
          <li key={p.src + i} className={i % 6 === 0 ? 'wide' : i % 6 === 3 ? 'tall' : undefined}>
            <button type="button" onClick={e => show(i, e.currentTarget)} aria-label={`Open photo: ${p.cap}`}>
              <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>
      {!all && <button type="button" className="mgrid-more" onClick={() => setAll(true)}>Show all {n} photos</button>}
      <div className="mgrid-end" aria-hidden="true" />

      {cur && open !== null && (
        <div className="mfocus" data-lenis-prevent role="dialog" aria-modal="true" aria-label={cur.cap} onClick={close}>
          <figure
            onClick={e => e.stopPropagation()}
            onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const x0 = touchX.current; touchX.current = null;
              if (x0 === null || n < 2) return;
              const dx = e.changedTouches[0].clientX - x0;
              if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
            }}
          >
            <img src={cur.src} alt={cur.alt} />
            <figcaption aria-live="polite"><small>{cur.group}</small><b>{cur.cap}</b>{n > 1 && <span className="mcount">{open + 1} / {n}</span>}</figcaption>
            {n > 1 && <>
              <button className="mnav prev" type="button" aria-label="Previous photo" onClick={() => step(-1)}><Icon id="i-arrow" /></button>
              <button className="mnav next" type="button" aria-label="Next photo" onClick={() => step(1)}><Icon id="i-arrow" /></button>
            </>}
            <button ref={closeRef} className="ibtn" type="button" aria-label="Close" onClick={close}><Icon id="i-x" /></button>
          </figure>
        </div>
      )}
    </>
  );
}
