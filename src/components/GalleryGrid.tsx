'use client';
import { useEffect, useRef, useState } from 'react';
import { gallery } from '@/content/site';
import { Icon } from './Icons';

const GROUPS = ['All', ...Array.from(new Set(gallery.map(g => g.group)))];

export function GalleryGrid() {
  const [group, setGroup] = useState('All'); const [open, setOpen] = useState<number | null>(null);
  const list = gallery.filter(g => group === 'All' || g.group === group);
  const closeRef = useRef<HTMLButtonElement>(null); const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus(); (window as any).__lenis?.stop();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen(o => (o! + 1) % list.length); if (e.key === 'ArrowLeft') setOpen(o => (o! - 1 + list.length) % list.length); };
    addEventListener('keydown', k);
    return () => { removeEventListener('keydown', k); (window as any).__lenis?.start(); opener.current?.focus(); };
  }, [open, list.length]);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter photos">
        {GROUPS.map(g => <button key={g} type="button" aria-pressed={g === group} onClick={() => setGroup(g)}>{g}</button>)}
      </div>
      <div className="masonry">
        {list.map((g, i) => (
          <figure key={g.src + group}>
            <button type="button" onClick={e => { opener.current = e.currentTarget; setOpen(i); }} aria-label={`Open photo: ${g.cap}`}><img src={g.src} alt={g.alt} loading="lazy" /></button>
            <figcaption>{g.cap}</figcaption>
          </figure>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={list[open].cap} onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="top"><span className="num">{open + 1} / {list.length} · {list[open].cap}</span><button ref={closeRef} className="ibtn" type="button" aria-label="Close" onClick={() => setOpen(null)}><Icon id="i-x" /></button></div>
          <div className="stage" onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}><img src={list[open].src} alt={list[open].alt} /></div>
          <div className="ctrl"><button className="ibtn prev" type="button" aria-label="Previous photo" onClick={() => setOpen((open - 1 + list.length) % list.length)}><Icon id="i-arrow" /></button><button className="ibtn" type="button" aria-label="Next photo" onClick={() => setOpen((open + 1) % list.length)}><Icon id="i-arrow" /></button></div>
        </div>
      )}
    </>
  );
}
