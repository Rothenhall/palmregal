'use client';
/* The loading screen. While it shows, the page gets everything ready behind it: the fonts, every
   homepage photo (fetched and decoded, so none decodes mid-scroll later), the hero's first film, and
   the scroll effects' measurements. Then it lifts like a curtain and the hero settles into place, so
   the very first scroll is already smooth.

   - Progress is real: each task counts when it is done; the number eases toward it, never backwards.
   - At least MIN_MS on screen (no flash), at most MAX_MS (a slow phone never waits behind it).
   - While it shows, scrolling is held (html.pl-on; Motion pauses Lenis) and the page starts at the top (or at its #section, for a link that names one).
   - When it lifts it sends `pr:ready`: Motion re-measures once and lets the scroll go, LiquidLayer may
     start the footer water.
   - No JavaScript, or something fails: CSS hides it anyway after a few seconds (see .pl in globals.css).
   - Reduced motion: no curtain, a short fade. */
import { useEffect, useRef, useState } from 'react';

const MIN_MS = 900, MAX_MS = 8000;

/* one task per photo, plus the fonts and the hero's first film */
function photo(src: string) {
  return new Promise<void>(done => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => done()); };
    img.onerror = () => done();
    img.src = src;
  });
}
function heroFilm() {
  return new Promise<void>(done => {
    const v = document.querySelector<HTMLVideoElement>('.hs-slide.on video');
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!v || saveData || matchMedia('(prefers-reduced-motion: reduce)').matches || v.readyState >= 2) return done();
    v.addEventListener('loadeddata', () => done(), { once: true });
    v.addEventListener('error', () => done(), { once: true });
  });
}

export function Preloader({ photos, name, tagline }: { photos: string[]; name: string; tagline: string }) {
  const [state, setState] = useState<'loading' | 'leaving' | 'gone'>('loading');
  const count = useRef<HTMLSpanElement>(null), line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('pl-on');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) scrollTo(0, 0);

    /* phones skip the laptop-only versions and the other way round */
    const phone = matchMedia('(max-width: 760px)').matches;
    const list = photos.filter(src => (phone ? !/-poster\.webp$/.test(src) : !/-mobile\./.test(src)));
    const tasks: Promise<void>[] = [document.fonts?.ready.then(() => {}) ?? Promise.resolve(), heroFilm(), ...list.map(photo)];
    let done = 0, shown = 0, frame = 0, alive = true, finished = false;
    const total = tasks.length, start = performance.now();
    tasks.forEach(t => t.then(() => { done++; }));

    const finish = () => {
      if (finished) return; finished = true;
      setState('leaving');
      html.classList.add('pl-arrive');
      /* let the page go: Motion re-measures once and starts the smooth scroll */
      html.classList.remove('pl-on');
      dispatchEvent(new Event('pr:ready'));
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => { if (alive) setState('gone'); html.classList.remove('pl-arrive'); }, still ? 450 : 1500);
    };
    const tick = () => {
      if (!alive) return;
      const elapsed = performance.now() - start;
      const target = elapsed >= MAX_MS ? 1 : done / total;
      shown += (target - shown) * .12;
      if (target === 1 && shown > .995) shown = 1;
      if (count.current) count.current.textContent = String(Math.round(shown * 100)).padStart(2, '0');
      if (line.current) line.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      if (shown === 1 && elapsed >= MIN_MS) { finish(); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(frame); html.classList.remove('pl-on', 'pl-arrive'); };
    // the photo list is fixed for the page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'gone') return null;
  const words = name.split(' '), last = words.pop();
  return (
    <div className={'pl' + (state === 'leaving' ? ' pl--leaving' : '')} role="status" aria-live="polite" aria-label={`Loading ${name}`}>
      <div className="pl-inner">
        <span className="pl-glow" aria-hidden="true" />
        <img className="pl-emblem" src="/img/emblem.png" alt="" width={72} height={72} />
        <p className="pl-name" aria-hidden="true">{words.join(' ')} <em>{last}</em></p>
        <p className="pl-tagline" aria-hidden="true">{tagline}</p>
        <div className="pl-progress" aria-hidden="true">
          <span className="pl-line"><i ref={line} /></span>
          <span className="pl-count"><span ref={count}>00</span>%</span>
        </div>
      </div>
    </div>
  );
}
