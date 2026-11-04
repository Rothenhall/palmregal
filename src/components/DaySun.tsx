'use client';
/* A day at Palm Regal, told with the image accordion and the sun.
   The section holds while the scroll walks the day, morning to night: the accordion opens one
   moment at a time, a thin arc above it carries the sun across the sky (it becomes the moon at
   night), and the light behind the strip changes with it. The words change in place beside the
   strip, never over a photograph. Choosing a sliver jumps the scroll to that moment; the pointer
   can peek at any picture without losing your place. A clear start and end, five steps. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { day } from '@/content/site';
import { hasMotion } from '@/lib/env';
import { ImageAccordion } from './ImageAccordion';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

const N = day.length;
const pad = (n: number) => String(n).padStart(2, '0');

/* The sun rides a quadratic arc from the left horizon to the right, peaking mid-day.
   Same curve as the SVG path below, in percent of the arc box. */
const ARC = { x0: 2, y0: 92, cx: 50, cy: -38, x1: 98, y1: 92 };
const onArc = (t: number) => {
  const u = 1 - t;
  return {
    x: u * u * ARC.x0 + 2 * u * t * ARC.cx + t * t * ARC.x1,
    y: u * u * ARC.y0 + 2 * u * t * ARC.cy + t * t * ARC.y1,
  };
};

/* The page colour follows the sun: soft aqua-teal in the morning, the brightest sky-teal in the
   afternoon, warm dusk in the evening, the logo's deep navy at night. Every tone stays dark enough
   for the light text (at least 7:1). Motion.tsx reads it from data-page-color. */
const SKY = ['#1B4650', '#1E4C62', '#22576F', '#2C3440', '#121735'];

export function DaySun() {
  const root = useRef<HTMLElement>(null);
  const trig = useRef<ScrollTrigger | null>(null);
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => { if (hasMotion()) setHeld(true); }, []);

  /* measured once the section has its scrolling height, or start and end would be wrong */
  useEffect(() => {
    if (!held) return;
    const el = root.current!;
    const place = (p: number) => {
      /* the sun moves continuously; the moments change in steps */
      const t = Math.min(1, Math.max(0, p * 1.04 - .02));
      const { x, y } = onArc(t);
      el.style.setProperty('--sx', `${x}%`);
      el.style.setProperty('--sy', `${y}%`);
    };
    place(0);
    const st = ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom bottom',
      onUpdate: self => {
        place(self.progress);
        const n = Math.min(N - 1, Math.floor(self.progress * N * .999));
        /* set straight away (not on the next render) so the page colour turns with the moment */
        if (el.dataset.pageColor !== SKY[n]) { el.dataset.pageColor = SKY[n]; dispatchEvent(new Event('pagecolor')); }
        setI(c => (c === n ? c : n));
      },
    });
    trig.current = st;
    ScrollTrigger.refresh();
    return () => { st.kill(); trig.current = null; };
  }, [held]);

  /* choosing a sliver scrolls to the middle of that moment's stretch */
  const pick = (n: number) => {
    const st = trig.current;
    if (!st) { setI(n); return; }
    const y = st.start + ((n + .5) / N) * (st.end - st.start);
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section ref={root} id="gallery" className={'dsun' + (held ? ' held' : '')} data-bg="night" data-page-color={held ? SKY[i] : undefined} data-moment={i} aria-labelledby="dsun-h">
      <div className="dsun-stick">
        <div className="dsun-sky" aria-hidden="true">{day.map((d, n) => <i key={d.time} className={n === i ? 'on' : ''} />)}<b className="dsun-stars" /></div>
        <div className="wrap dsun-grid">
          <div className="dsun-copy">
            <p className="eyebrow" id="dsun-h">A day at Palm Regal</p>
            <div className="dsun-num num" aria-hidden="true"><span key={i}>{pad(i + 1)}</span><b>/ {pad(N)}</b></div>
            <div className="dsun-words">
              {day.map((d, n) => (
                <article key={d.time} className={'dsun-step' + (n === i ? ' on' : '')} aria-hidden={held && n !== i ? true : undefined}>
                  <time>{d.time}</time>
                  <h3>{d.title} <em>{d.em}</em></h3>
                  <p>{d.text}</p>
                </article>
              ))}
            </div>
            <div className="dsun-foot">
              <div className="dsun-dots" aria-hidden="true">{day.map((d, n) => <i key={d.time} className={n === i ? 'on' : n < i ? 'past' : ''} />)}</div>
              <Link className="tlink" href="/gallery/">Full gallery <Icon id="i-arrow" /></Link>
            </div>
          </div>

          <div className="dsun-stage">
            <div className="dsun-arc" aria-hidden="true">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d={`M${ARC.x0} ${ARC.y0} Q${ARC.cx} ${ARC.cy} ${ARC.x1} ${ARC.y1}`} vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="dsun-orb" />
              <span className="dsun-horizon" />
            </div>
            <div className="dsun-strip">
              <ImageAccordion
                width="100%" height="100%" gap={6} open={74} reach={42} bounce={14}
                active={held ? i : undefined}
                onPick={held ? pick : undefined}
                label={(n, isOpen) => <><span className="num">{pad(n + 1)}</span><b aria-hidden={!isOpen}>{day[n].time}</b></>}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
