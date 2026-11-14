'use client';
/* A wall of moments: tiles drift with the cursor, and a click opens one large with its caption */
import { useEffect, useRef, useState } from 'react';
import type { GalleryPhoto } from '@/content/types';
import { Icon } from './Icons';

const COLS = 9, ROWS = 6;

export function MomentsWall({ gallery }: { gallery: GalleryPhoto[] }) {
  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => gallery[(i * 7) % gallery.length]);
  const wall = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const w = wall.current!; const sec = w.parentElement!;
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => { const r = sec.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * -40; ty = ((e.clientY - r.top) / r.height - .5) * -30; if (!raf) raf = requestAnimationFrame(step); };
    const step = () => { x += (tx - x) * .06; y += (ty - y) * .06; w.style.setProperty('--mx', x.toFixed(2) + 'px'); w.style.setProperty('--my', y.toFixed(2) + 'px'); raf = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(step) : 0; };
    sec.addEventListener('pointermove', move);
    return () => { sec.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open]);

  return (
    <>
      <div className="mwall-par" data-speed="-0.35" data-ptrigger=".moments-sec"><div className={'mwall' + (open !== null ? ' dim' : '')} ref={wall}>
        {tiles.map((t, i) => (
          <button key={i} type="button" className="mtile2" style={{ ['--d' as string]: `${((i * 37) % 11) / 10}`, animationDelay: `${(i % COLS) * .04 + Math.floor(i / COLS) * .08}s` }} onClick={() => setOpen(i)} aria-label={`Open moment: ${t.cap}`} tabIndex={i < 12 ? 0 : -1}>
            <img src={t.src} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div></div>
      <p className="mhint" aria-hidden="true">Click a moment</p>
      {open !== null && (
        <div className="mfocus" data-lenis-prevent role="dialog" aria-modal="true" aria-label={tiles[open].cap} onClick={() => setOpen(null)}>
          <figure onClick={e => e.stopPropagation()}>
            <img src={tiles[open].src} alt={tiles[open].alt} />
            <figcaption><small>{tiles[open].group}</small><b>{tiles[open].cap}</b></figcaption>
            <button ref={closeRef} className="ibtn" type="button" aria-label="Close" onClick={() => setOpen(null)}><Icon id="i-x" /></button>
          </figure>
        </div>
      )}
    </>
  );
}
