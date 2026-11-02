'use client';
/* The hero is a scene drawn in code: Gopalpur's sky and the Bay of Bengal (WebGL), palm silhouettes,
   birds, beach lamps and fireflies. Scrolling moves the time of day from golden hour to night. */
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { site } from '@/content/site';
import { hasMotion } from '@/lib/env';
import { Glance } from './Sections';
import { Icon } from './Icons';
import { PALMS, palmCrown, palmTrunk } from './Palms';

gsap.registerPlugin(ScrollTrigger);

const LAMPS = [520, 760, 1010];
const FLIES = Array.from({ length: 22 }, (_, i) => ({ l: (i * 47) % 100, t: 58 + ((i * 29) % 34), d: -(i * 1.1) % 9, s: 6 + (i % 5) * 1.4 }));

export function Hero() {
  const root = useRef<HTMLElement>(null); const sceneEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = root.current!, sc = sceneEl.current!;
    if (!hasMotion()) { sec.style.setProperty('--night', '0'); return; }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: self => {
          const p = self.progress;
          sc.dataset.p = p.toFixed(3);
          const night = Math.min(1, Math.max(0, (p - .5) / .4));
          sec.style.setProperty('--p', p.toFixed(3)); sec.style.setProperty('--night', night.toFixed(3));
          /* the camera walks out past the palms */
          const k = p < .9 ? (p / .9) ** 1.4 : 1;
          sec.style.setProperty('--cam', k.toFixed(3));
        },
      });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      tl.to('.sh-title', { yPercent: -30, opacity: 0, duration: .32 }, .05)
        .to('.hero-hint', { opacity: 0, duration: .1 }, 0)
        .fromTo('.sh-in', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .25 }, .42)
        .to({}, { duration: .33 });
      gsap.from('.sh-title .ln', { yPercent: 110, duration: 1.4, stagger: .12, ease: 'expo.out', delay: .3 });
      gsap.from('.sh-title p', { opacity: 0, y: 14, duration: 1.2, ease: 'expo.out', delay: .7 });
      gsap.from('.sh-palm', { yPercent: 8, opacity: 0, duration: 2, stagger: .12, ease: 'expo.out', delay: .1 });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero scenehero" ref={root} aria-label="Welcome to Palm Regal" data-dark="1">
      <div className="sh-stick">
        <div className="sh-scene" ref={sceneEl} data-gl="scene" data-p="0">
          <img src="/img/beach-evening.webp" alt="Waves on Gopalpur beach under an evening sky" fetchPriority="high" />
        </div>
        <svg className="sh-birds" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0, 1, 2, 3].map(i => (
            <g key={i} className="bird" style={{ animationDelay: `${-i * 9}s`, animationDuration: `${34 + i * 6}s` }}>
              <path transform={`translate(0 ${170 + i * 38}) scale(${1 - i * .15})`} d="M0 0 Q 8 -8 16 0 Q 24 -8 32 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ))}
        </svg>
        <svg className="sh-front" viewBox="0 0 1440 960" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <radialGradient id="lampglow"><stop offset="0" stopColor="#ffe2b0" stopOpacity=".9" /><stop offset=".25" stopColor="#f2c793" stopOpacity=".35" /><stop offset="1" stopColor="#f2c793" stopOpacity="0" /></radialGradient>
          </defs>
          <path className="sh-sand" d="M0 860 C 220 836, 420 852, 640 846 S 1080 828, 1440 850 L1440 960 L0 960 Z" />
          <path className="sh-bush" d="M0 870 C 40 820, 90 830, 120 850 C 150 815, 210 820, 230 860 C 260 840, 300 850, 320 875 L320 960 L0 960 Z M1440 868 C 1400 820, 1350 828, 1320 852 C 1290 822, 1230 826, 1210 866 L1210 960 L1440 960 Z" />
          {LAMPS.map(x => (
            <g key={x} className="sh-lamp">
              <circle cx={x} cy="800" r="90" fill="url(#lampglow)" className="glow" />
              <rect x={x - 2} y="802" width="4" height="52" className="post" />
              <circle cx={x} cy="800" r="5" className="bulb" />
            </g>
          ))}
        </svg>
        {[0, 1].map(side => (
          <svg key={side} className={'sh-palms ' + (side ? 'r' : 'l')} viewBox={side ? '980 200 500 760' : '-40 200 520 760'} preserveAspectRatio={side ? 'xMaxYMax meet' : 'xMinYMax meet'} aria-hidden="true">
            {PALMS.map((p, i) => ((p.top[0] > 720) === !!side) && (
              <g key={i} className="sh-palm" style={{ ['--dur' as string]: `${p.dur}s` }}>
                <g dangerouslySetInnerHTML={{ __html: palmTrunk(p) }} />
                <g className="crown" style={{ transformOrigin: `${p.top[0]}px ${p.top[1]}px` }} dangerouslySetInnerHTML={{ __html: palmCrown(p) }} />
              </g>
            ))}
          </svg>
        ))}
        <div className="sh-flies" aria-hidden="true">{FLIES.map((f, i) => <i key={i} style={{ left: `${f.l}%`, top: `${f.t}%`, animationDelay: `${f.d}s`, animationDuration: `${f.s}s` }} />)}</div>
        <div className="sh-shade" aria-hidden="true" />

        <div className="sh-title">
          <p>Gopalpur on Sea · Odisha</p>
          <h1><span className="mask"><span className="ln">Beachfront bliss,</span></span><span className="mask"><span className="ln"><em>just for you.</em></span></span></h1>
        </div>

        <div className="sh-in">
          <div className="wrap sh-grid">
            <div>
              <p className="eyebrow">Serviced suites by the sea</p>
              <h2>A home by the sea, <em>wrapped in green.</em></h2>
              <p className="sh-cap">Suites with their own living room, kitchenette and balcony, five minutes&apos; walk from the beach.</p>
              <div className="sh-cta">
                <Link className="btn btn--book" href="/#book">Check availability</Link>
                <Link className="btn btn--glass" href="/suites/">See the suites <Icon id="i-arrow" /></Link>
              </div>
            </div>
            <Glance />
          </div>
        </div>
        <div className="hero-hint" aria-hidden="true">Scroll<i /></div>
      </div>
      <span className="sr">Check-in {site.checkIn}, check-out {site.checkOut}.</span>
    </section>
  );
}
