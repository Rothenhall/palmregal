'use client';
/* The hero is real photography only. It opens as "Palm [arch] Regal": scrolling grows the arch to
   the full screen while the photo inside settles from a close crop (counter-zoom), the two words
   part, and the headline arrives. Then the day carries on: dusk on the beach, the paths at night. */
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
    const mob = innerWidth < 760;
    const ctx = gsap.context(() => {
      const arch = sec.querySelector<HTMLElement>('.rh-shot.first')!;
      const r0 = () => arch.offsetWidth / 2;
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true,
        onUpdate: self => {
          const p = self.progress, n = p < .42 ? 0 : p < .72 ? 1 : 2; setCur(c => (c === n ? c : n));
        } } });
      /* 1 · the arch opens to the screen; the photo inside settles from 1.35 to 1.02 as it does */
      tl.fromTo(arch, { width: () => arch.offsetWidth, height: () => arch.offsetHeight, borderTopLeftRadius: r0, borderTopRightRadius: r0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
        { width: () => innerWidth, height: () => innerHeight, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, duration: 1, ease: 'power2.inOut' }, 0)
        .fromTo(arch.querySelector('img'), { scale: 1.35 }, { scale: 1.02, duration: 1, ease: 'power2.inOut' }, 0)
        /* the two words part and fade */
        .to('.rh-word.l', { x: mob ? 0 : '-62vw', y: mob ? '-30svh' : 0, opacity: 0, duration: .7 }, 0)
        .to('.rh-word.r', { x: mob ? 0 : '62vw', y: mob ? '30svh' : 0, opacity: 0, duration: .7 }, 0)
        .to('.rh-kicker', { opacity: 0, duration: .3 }, 0)
        .to('.rh-shade', { opacity: 1, duration: .6 }, .35)
        /* 2 · the headline once the photo fills the screen */
        .fromTo('.rh-head', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .35 }, .85)
        .to('.rh-head', { opacity: 0, y: -30, duration: .3 }, 1.55)
        /* 3 · the day carries on: dusk, then night, each with a slow push-in */
        .fromTo('.rh-shot.s1', { opacity: 0 }, { opacity: 1, duration: .35 }, 1.6)
        .fromTo('.rh-shot.s1 img', { scale: 1.12 }, { scale: 1, duration: 1.2 }, 1.6)
        .fromTo('.rh-shot.s2', { opacity: 0 }, { opacity: 1, duration: .35 }, 2.55)
        .fromTo('.rh-shot.s2 img', { scale: 1.12 }, { scale: 1, duration: 1.2 }, 2.55)
        .fromTo('.rh-end', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .35 }, 3.1)
        .fromTo('.rh-meta', { opacity: 0 }, { opacity: 1, duration: .3 }, .9)
        .to({}, { duration: .35 });
      gsap.from('.rh-word', { yPercent: 40, opacity: 0, duration: 1.4, stagger: .1, ease: 'expo.out', delay: .15 });
      gsap.from(arch, { yPercent: 6, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .25, clearProps: 'opacity' });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero realhero" ref={root} aria-label="Welcome to Palm Regal" data-dark="1">
      <div className="rh-stick">
        {SHOTS.map((s, i) => (
          <div className={'rh-shot ' + (i === 0 ? 'first' : 's' + i)} key={s.src}>
            <img src={s.src} alt={s.alt} fetchPriority={i === 0 ? 'high' : 'auto'} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        <div className="rh-shade" aria-hidden="true" />

        <p className="rh-kicker">Resort homestay · Gopalpur on Sea</p>
        <h1 className="rh-brand"><span className="rh-word l">Palm</span><span className="sr"> </span><span className="rh-word r"><em>Regal</em></span></h1>

        <div className="rh-head">
          <h2>Beachfront bliss, <em>just for you.</em></h2>
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
