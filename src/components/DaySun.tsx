'use client';
/* A day unfolds through the existing photo accordion. A compact time rail sits
   with the pictures, while a restrained local glow follows the scroll. The
   surrounding page keeps its deep teal, rather than changing colour per photo. */
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import './daysun.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Edit, Moment } from '@/content/types';
import { hasMotion } from '@/lib/env';
import { noEdit } from '@/lib/edit';
import { grid, order, turned, TILE, type Tile } from '@/lib/tiles';
import { ImageAccordion } from './ImageAccordion';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, '0');

/* Phones: one photo at a time. Between two moments the scroll first holds the picture, then hands over
   in the middle of the stretch (smoothstep over 30%..70%), so a photo is seen whole most of the way. */
const settle = (along: number) => {
  const base = Math.floor(along), f = along - base;
  const t = Math.min(1, Math.max(0, (f - .3) / .4));
  return base + t * t * (3 - 2 * t);
};
const slideStyle = (d: number): CSSProperties => {
  const ad = Math.min(1, Math.abs(d));
  /* incoming photo slides in from the side it comes from and settles from a slight zoom; the outgoing
     one drifts the other way and eases back a touch */
  const scale = d > 0 ? 1 + .07 * ad : 1 - .03 * ad;
  return {
    opacity: 1 - ad,
    transform: `translate3d(${(d * 9).toFixed(2)}%,0,0) scale(${scale.toFixed(4)})`,
    visibility: ad >= 1 ? 'hidden' : undefined,
  };
};

const LIGHT = [[210, 190, 151], [176, 198, 179], [139, 182, 185], [210, 158, 112], [100, 143, 158]];
const paint = (els: HTMLElement[], progress: number, N: number) => {
  // Each selected chapter's midpoint lands exactly on its time-rail marker.
  const p = Math.max(0, Math.min(1, (progress * N - .5) / Math.max(1, N - 1)));
  const tone = p * (LIGHT.length - 1), lo = Math.floor(tone), hi = Math.min(LIGHT.length - 1, lo + 1);
  const glow = LIGHT[lo].map((v, k) => Math.round(v + (LIGHT[hi][k] - v) * (tone - lo))).join(', ');
  const edge = 50 / N, at = `${(edge + (100 - edge * 2) * p).toFixed(3)}%`, pr = p.toFixed(4);
  for (const el of els) {
    if (el.style.getPropertyValue('--day-glow') !== glow) el.style.setProperty('--day-glow', glow);
    el.style.setProperty('--day-progress', pr);
    el.style.setProperty('--day-position', at);
  }
};

export function DaySun({ copy, f = noEdit }: { copy: { eyebrow: string; moreLink: string; moments: Moment[] }; f?: Edit }) {
  const day = copy.moments, N = day.length;
  const pics = day.map(d => ({ name: d.time, src: d.img, alt: d.alt }));
  const root = useRef<HTMLElement>(null);
  const trig = useRef<ScrollTrigger | null>(null);
  const sky = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  /* where the scroll is along the strip of photos, between pictures too, so the photos open and
     close continuously with the scroll instead of switching at a threshold */
  const [along, setAlong] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setHeld(hasMotion());
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  /* the light only touches the two elements that use it (the glow and the time rail), never the
     whole section, so a scroll frame restyles two small boxes instead of every photograph */
  const lit = () => [sky.current, rail.current].filter(Boolean) as HTMLElement[];
  useEffect(() => { if (!held) paint(lit(), (i + .5) / N, N); }, [i, held, N]);

  /* measured once the section has its scrolling height, or start and end would be wrong.
     The last viewport of the section is the way out (below), so the day itself ends one viewport early. */
  useEffect(() => {
    if (!held) return;
    const el = root.current!, targets = lit();
    paint(targets, 0, N);
    const st = ScrollTrigger.create({
      trigger: el, start: 'top top', end: () => `bottom-=${innerHeight} bottom`,
      onUpdate: self => {
        paint(targets, self.progress, N);
        const n = Math.min(N - 1, Math.floor(self.progress * N * .999));
        setI(c => (c === n ? c : n));
        const a = Math.round(Math.min(N - 1, Math.max(0, self.progress * N - .5)) * 100) / 100;
        setAlong(c => (c === a ? c : a));
      },
    });
    trig.current = st;
    ScrollTrigger.refresh();
    return () => { st.kill(); trig.current = null; };
  }, [held, N]);

  /* The way out into the coast map (after lucid's tiles). The map section sits pinned underneath this
     one's last viewport; while that viewport scrolls, the day's screen is cut away square by square in
     a fixed random order, through a mask, so the live map shows through. Scrubbed both ways. */
  useEffect(() => {
    if (!held) return;
    const el = root.current!, screen = stick.current!, html = document.documentElement;
    let tiles: Tile[] = [], rank: number[] = [], sizes = '', places = '';
    const build = () => {
      tiles = grid(innerWidth, innerHeight, innerWidth < 760 ? TILE.phone : TILE.desktop);
      rank = order(tiles.length);
      sizes = tiles.map(t => `${t.w}px ${t.h}px`).join(',');
      places = tiles.map(t => `${t.left}px ${t.top}px`).join(',');
    };
    const setMask = (image: string) => {
      const s = screen.style;
      s.setProperty('mask-image', image); s.setProperty('-webkit-mask-image', image);
      if (image) {
        s.setProperty('mask-size', sizes); s.setProperty('-webkit-mask-size', sizes);
        s.setProperty('mask-position', places); s.setProperty('-webkit-mask-position', places);
        s.setProperty('mask-repeat', 'no-repeat'); s.setProperty('-webkit-mask-repeat', 'no-repeat');
      }
    };
    let state = '';
    const cut = (q: number) => {
      const now = q <= 0 ? 'whole' : q >= 1 ? 'gone' : 'cutting';
      if (now === 'cutting') {
        /* each tile is a mask layer: opaque while the day shows there, clear once it has turned */
        setMask(tiles.map((_, i) => { const a = (1 - turned(q, rank[i], tiles.length)).toFixed(3); return `linear-gradient(rgba(0,0,0,${a}),rgba(0,0,0,${a}))`; }).join(','));
      } else if (now !== state) setMask('');
      if (now !== state) {
        el.classList.toggle('is-through', now === 'gone');
        /* the transient flag: only while the tiles are actually being cut away */
        html.classList.toggle('dsun-exiting', now === 'cutting');
        state = now;
      }
    };
    build();
    /* `dsun-exit` is a LAYOUT mode, not a "transition running" flag: with it, globals.css makes this
       section one viewport taller and tucks the coast map up 200svh beneath it, and CoastMap.tsx /
       Motion.tsx offset their triggers by it. It therefore has to be on from load (whenever the motion
       version is used), or the page would jump by two screens the moment the exit began. Anything that
       should only apply during the dissolve itself keys off `dsun-exiting` (set in cut() above). */
    html.classList.add('dsun-exit');
    const out = ScrollTrigger.create({
      trigger: el, start: () => `bottom-=${innerHeight} bottom`, end: 'bottom bottom',
      onUpdate: self => cut(self.progress), onRefresh: self => { build(); state = ''; cut(self.progress); },
    });
    ScrollTrigger.refresh();
    return () => { out.kill(); setMask(''); el.classList.remove('is-through'); html.classList.remove('dsun-exit', 'dsun-exiting'); };
  }, [held]);

  /* choosing a sliver scrolls to the middle of that moment's stretch */
  const pick = (n: number) => {
    const st = trig.current;
    if (!st) { setI(n); return; }
    const y = st.start + ((n + .5) / N) * (st.end - st.start);
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(y, { lerp: .1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  /* phones: a sideways swipe on the photo steps to the next or previous moment (vertical drags are
     left to the page, which is what scrolls through the day) */
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => { swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipe.current; swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    const n = Math.max(0, Math.min(N - 1, i + (dx < 0 ? 1 : -1)));
    if (n !== i) pick(n);
  };
  const pos = held ? settle(along) : i;

  return (
    <section ref={root} id="gallery" className={'dsun' + (held ? ' held' : '')} data-bg="night" data-moment={i} aria-labelledby="dsun-h">
      <div className="dsun-stick" ref={stick}>
        <div className="dsun-sky" ref={sky} aria-hidden="true" />
        <div className="wrap dsun-grid">
          <div className="dsun-copy">
            <p className="eyebrow" id="dsun-h" {...f(copy, 'eyebrow')}>{copy.eyebrow}</p>
            <div className="dsun-num num" aria-hidden="true"><span key={i}>{pad(i + 1)}</span><b>/ {pad(N)}</b></div>
            <div className="dsun-words">
              {day.map((d, n) => (
                <article key={n} className={'dsun-step' + (n === i ? ' on' : '')} aria-hidden={held && n !== i ? true : undefined}>
                  {/* phones without the held scroll: each moment carries its own full-width photo */}
                  {!held && <figure className="dsun-step-pic"><img src={d.img} alt={d.alt} loading="lazy" decoding="async" draggable={false} /></figure>}
                  <time {...f(d, 'time')}>{d.time}</time>
                  <h3 {...f(d, 'title')}>{d.title} <em {...f(d, 'em')}>{d.em}</em></h3>
                  <p {...f(d, 'text')}>{d.text}</p>
                </article>
              ))}
            </div>
            <div className="dsun-foot">
              <Link className="tlink" href="/#moments" {...f(copy, 'moreLink')}>{copy.moreLink} <Icon id="i-arrow" /></Link>
            </div>
          </div>

          <div className="dsun-stage">
            <nav className="dsun-timeline" ref={rail} aria-label="Choose a moment in the day">
              <span className="dsun-timeline-line" aria-hidden="true" />
              <span className="dsun-timeline-orb" aria-hidden="true" />
              {day.map((d, n) => <button key={n} type="button" onClick={() => pick(n)} aria-current={n === i ? 'step' : undefined}>
                <span className="dsun-timeline-point" aria-hidden="true" />{d.time}
              </button>)}
            </nav>
            <div className="dsun-strip">
              <ImageAccordion
                width="100%" height="100%" gap={6} open={74} reach={42} bounce={5}
                active={held ? along : i}
                pics={pics}
                onPick={pick}
              />
            </div>
            {/* phones: one full-width photo per moment, crossfading with the scroll (see daysun.css) */}
            <div className="dsun-deck" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { swipe.current = null; }}>
              {day.map((d, n) => (
                <figure key={n} className="dsun-slide" data-on={n === i || undefined} style={slideStyle(n - pos)} aria-hidden={n !== i ? true : undefined}>
                  <img src={d.img} alt={d.alt} loading="lazy" decoding="async" draggable={false} />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
