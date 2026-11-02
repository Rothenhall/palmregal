'use client';
/* Gallery as chapters: each an editorial grid with a feature photo and aligned supporting photos.
   Captions show on hover; any photo opens the full-screen viewer, which walks through every chapter. */
import { useEffect, useRef, useState } from 'react';
import { CHAPTERS, gallery } from '@/content/site';
import { Icon } from './Icons';


/* spans [columns, rows] on a 12-column grid, chosen so every chapter fills its rows exactly */
const LAYOUT: Record<number, [number, number][]> = {
  1: [[12, 2]],
  2: [[7, 2], [5, 2]],
  3: [[8, 2], [4, 1], [4, 1]],
  4: [[8, 2], [4, 1], [4, 1], [12, 2]],
  5: [[8, 2], [4, 1], [4, 1], [6, 2], [6, 2]],
  6: [[8, 2], [4, 1], [4, 1], [4, 1], [4, 1], [4, 1]],
  7: [[8, 2], [4, 1], [4, 1], [4, 1], [4, 1], [4, 1], [12, 2]],
};

const all = CHAPTERS.flatMap(c => gallery.filter(g => g.group === c.group));

export function GalleryChapters() {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null); const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus(); (window as any).__lenis?.stop();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen(o => (o! + 1) % all.length); if (e.key === 'ArrowLeft') setOpen(o => (o! - 1 + all.length) % all.length); };
    addEventListener('keydown', k);
    return () => { removeEventListener('keydown', k); (window as any).__lenis?.start(); opener.current?.focus(); };
  }, [open]);

  return (
    <>
      {CHAPTERS.map((c, ci) => {
        const list = gallery.filter(g => g.group === c.group);
        const spans = LAYOUT[list.length] || list.map(() => [4, 1] as [number, number]);
        return (
          <section key={c.id} id={c.id} className="sec gchap" data-bg={ci % 2 ? 'night' : 'dusk'} aria-labelledby={`${c.id}-h`}>
            <div className="wrap">
              <header className="gchap-head">
                <span className="gchap-n num">0{ci + 1}</span>
                <h2 id={`${c.id}-h`} data-split>{c.title} <em>{c.em}</em></h2>
                <p>{c.text}</p>
                <span className="gchap-count num">{list.length} photos</span>
              </header>
              <div className="ggrid">
                {list.map((g, i) => {
                  const idx = all.indexOf(g); const [cs, rs] = spans[i];
                  return (
                    <figure key={g.src + i} className="gtile" style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}` }}>
                      <button type="button" onClick={e => { opener.current = e.currentTarget; setOpen(idx); }} aria-label={`Open photo: ${g.cap}`}>
                        <span className="img" data-gl="photo" data-depth="-90"><img src={g.src} alt={g.alt} loading="lazy" /></span>
                        <figcaption><span>{g.cap}</span><Icon id="i-arrow" /></figcaption>
                      </button>
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={all[open].cap} onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="top"><span className="num">{String(open + 1).padStart(2, '0')} / {all.length} · {all[open].cap}</span><button ref={closeRef} className="ibtn" type="button" aria-label="Close" onClick={() => setOpen(null)}><Icon id="i-x" /></button></div>
          <div className="stage" onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}><img key={all[open].src} src={all[open].src} alt={all[open].alt} /></div>
          <div className="ctrl"><button className="ibtn prev" type="button" aria-label="Previous photo" onClick={() => setOpen((open - 1 + all.length) % all.length)}><Icon id="i-arrow" /></button><button className="ibtn" type="button" aria-label="Next photo" onClick={() => setOpen((open + 1) % all.length)}><Icon id="i-arrow" /></button></div>
        </div>
      )}
    </>
  );
}
