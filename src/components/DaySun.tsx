'use client';
/* A day unfolds through the existing photo accordion. A compact time rail sits
   with the pictures, while a restrained local glow follows the scroll. The
   surrounding page keeps its deep teal, rather than changing colour per photo. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Edit, Moment } from '@/content/types';
import { hasMotion } from '@/lib/env';
import { noEdit } from '@/lib/edit';
import { ImageAccordion } from './ImageAccordion';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, '0');

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

  /* measured once the section has its scrolling height, or start and end would be wrong */
  useEffect(() => {
    if (!held) return;
    const el = root.current!, targets = lit();
    paint(targets, 0, N);
    const st = ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom bottom',
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

  /* choosing a sliver scrolls to the middle of that moment's stretch */
  const pick = (n: number) => {
    const st = trig.current;
    if (!st) { setI(n); return; }
    const y = st.start + ((n + .5) / N) * (st.end - st.start);
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(y, { lerp: .1 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section ref={root} id="gallery" className={'dsun' + (held ? ' held' : '')} data-bg="night" data-moment={i} aria-labelledby="dsun-h">
      <div className="dsun-stick">
        <div className="dsun-sky" ref={sky} aria-hidden="true" />
        <div className="wrap dsun-grid">
          <div className="dsun-copy">
            <p className="eyebrow" id="dsun-h" {...f(copy, 'eyebrow')}>{copy.eyebrow}</p>
            <div className="dsun-num num" aria-hidden="true"><span key={i}>{pad(i + 1)}</span><b>/ {pad(N)}</b></div>
            <div className="dsun-words">
              {day.map((d, n) => (
                <article key={n} className={'dsun-step' + (n === i ? ' on' : '')} aria-hidden={held && n !== i ? true : undefined}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
