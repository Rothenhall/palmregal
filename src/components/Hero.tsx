'use client';
/* The hero is real photography only: a day at Palm Regal in three photos. Scrolling slowly pushes
   the camera into each photo and dissolves to the next. Nothing drawn or generated on top. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '@/content/site';
import { hasMotion } from '@/lib/env';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

const SHOTS = [
  { src: '/img/exterior-2.webp', alt: 'The palm-lined garden path at Palm Regal', cap: 'Morning in the gardens' },
  { src: '/img/beach-evening.webp', alt: 'Gopalpur beach and the Bay of Bengal at dusk', cap: 'Evening by the Bay of Bengal' },
  { src: '/img/main-banner.webp', alt: 'The lamp-lit garden walkway at Palm Regal at night', cap: 'Night, among the palms' },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    if (!hasMotion()) return;
    const sec = root.current!;
    const ctx = gsap.context(() => {
      const shots = gsap.utils.toArray<HTMLElement>('.rh-shot');
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .8,
        onUpdate: self => { const n = Math.min(SHOTS.length - 1, Math.floor(self.progress * SHOTS.length * .999)); setCur(c => (c === n ? c : n)); } } });
      /* each photo: a slow push-in across its third of the scroll, then a dissolve into the next */
      shots.forEach((s, i) => {
        tl.fromTo(s.querySelector('img'), { scale: 1.14 }, { scale: 1, duration: 1 }, i);
        if (i > 0) tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: .35 }, i - .2);
      });
      tl.to('.rh-title', { opacity: 0, y: -40, duration: .4 }, .35)
        .fromTo('.rh-end', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .4 }, SHOTS.length - .75);
      gsap.from('.rh-title .ln', { yPercent: 110, duration: 1.4, stagger: .12, ease: 'expo.out', delay: .2 });
      gsap.from('.rh-title p, .rh-meta', { opacity: 0, y: 14, duration: 1.2, ease: 'expo.out', delay: .6 });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero realhero" ref={root} aria-label="Welcome to Palm Regal" data-dark="1">
      <div className="rh-stick">
        {SHOTS.map((s, i) => (
          <div className="rh-shot" key={s.src} style={i ? { opacity: 0 } : undefined}>
            <img src={s.src} alt={s.alt} fetchPriority={i === 0 ? 'high' : 'auto'} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="rh-shade" aria-hidden="true" />

        <div className="rh-title">
          <p>Gopalpur on Sea · Odisha</p>
          <h1><span className="mask"><span className="ln">Beachfront bliss,</span></span><span className="mask"><span className="ln"><em>just for you.</em></span></span></h1>
        </div>

        <div className="rh-end">
          <div className="wrap">
            <p className="eyebrow">Serviced suites by the sea</p>
            <h2>A home by the sea, <em>wrapped in green.</em></h2>
            <div className="sh-cta">
              <Link className="btn btn--book" href="/#book">Check availability</Link>
              <Link className="btn btn--glass" href="/suites/">See the suites <Icon id="i-arrow" /></Link>
            </div>
          </div>
        </div>

        <div className="rh-meta wrap" aria-hidden="true">
          <span className="rh-cap" key={cur}>{SHOTS[cur].cap}</span>
          <span className="rh-marks">{SHOTS.map((s, i) => <i key={s.src} className={i <= cur ? 'on' : ''} />)}</span>
        </div>
      </div>
      <span className="sr">Check-in {site.checkIn}, check-out {site.checkOut}.</span>
    </section>
  );
}
