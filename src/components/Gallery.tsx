'use client';
import { useEffect, useRef } from 'react';
import { Icon } from './Icons';

export function SuiteGallery({ photos, todo }: { photos: { src: string; alt: string }[]; todo?: boolean }) {
  const track = useRef<HTMLDivElement>(null); const dots = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tr = track.current!; let last = 0;
    const on = () => {
      const i = Math.round(tr.scrollLeft / tr.clientWidth);
      dots.current?.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', k === i));
      if (i !== last) { last = i; tr.dispatchEvent(new CustomEvent('gl:src', { detail: { src: photos[i].src }, cancelable: true })); }
    };
    tr.addEventListener('scroll', on, { passive: true }); return () => tr.removeEventListener('scroll', on);
  }, [photos]);
  const step = (d: number) => { const tr = track.current!; let i = Math.round(tr.scrollLeft / tr.clientWidth) + d; if (i >= photos.length) i = 0; if (i < 0) i = photos.length - 1; tr.scrollTo({ left: i * tr.clientWidth, behavior: 'smooth' }); };
  return (
    <div className="gal">
      <div className="gal-track" ref={track} data-gl="gal" data-src={photos[0].src}>
        {photos.map((p, i) => <div className="img" key={p.src + i}><img src={p.src} alt={p.alt} loading="lazy" />{todo && <span className="stand">Photo to confirm</span>}</div>)}
      </div>
      {photos.length > 1 && <>
        <div className="gal-dots" ref={dots}>{photos.map((p, i) => <i key={i} className={i === 0 ? 'on' : ''} />)}</div>
        <div className="gal-nav"><button className="prev" type="button" aria-label="Previous photo" onClick={() => step(-1)}><Icon id="i-arrow" /></button><button type="button" aria-label="Next photo" onClick={() => step(1)}><Icon id="i-arrow" /></button></div>
      </>}
    </div>
  );
}
