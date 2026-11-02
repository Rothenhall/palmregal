'use client';
/* The arched garden window grows into the full screen as you scroll; then the slides and the glass lens take over */
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { heroSlides, site } from '@/content/site';
import { hasMotion } from '@/lib/env';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const root = useRef<HTMLElement>(null); const frame = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0); const [instant, setInstant] = useState(false); const [cycle, setCycle] = useState(0);
  const curRef = useRef(0);

  const go = (n: number) => {
    n = (n + heroSlides.length) % heroSlides.length; if (n === curRef.current) return;
    const handled = !frame.current!.dispatchEvent(new CustomEvent('gl:src', { detail: { src: heroSlides[n].src }, cancelable: true }));
    setInstant(handled); curRef.current = n; setCur(n); setCycle(c => c + 1);
  };

  useEffect(() => {
    if (!hasMotion()) return;
    const id = setInterval(() => { if (!document.hidden) go(curRef.current + 1); }, 7000);
    return () => clearInterval(id);
  }, [cycle]);

  useEffect(() => {
    if (!hasMotion()) { frame.current!.dataset.p = '1'; root.current!.dataset.dark = '1'; return; }
    const f = frame.current!, sec = root.current!;
    const ctx = gsap.context(() => {
      const startR = () => f.offsetWidth / 2;
      gsap.set(f, { borderTopLeftRadius: startR(), borderTopRightRadius: startR() });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true,
          onUpdate: self => {
            f.dataset.p = self.progress.toFixed(3);
            const dark = self.progress > .5 ? '1' : '0';
            if (sec.dataset.dark !== dark) { sec.dataset.dark = dark; window.dispatchEvent(new Event('pr:hero')); }
          },
        },
      });
      tl.to(f, { width: () => innerWidth, height: () => innerHeight, borderTopLeftRadius: 0, borderTopRightRadius: 0, duration: .7 }, 0)
        .to('.hero-title', { yPercent: -40, opacity: 0, duration: .45 }, 0)
        .to('.hero-hint', { opacity: 0, duration: .15 }, 0)
        .to('.hero-veil', { opacity: 1, duration: .3 }, .45)
        .fromTo('.hero-in', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3 }, .62)
        .to({}, { duration: .1 });
      gsap.from('.hero-title h1 .ln', { yPercent: 110, duration: 1.3, stagger: .1, ease: 'expo.out', delay: .15 });
      gsap.from(f, { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out', delay: .3, clearProps: 'opacity,transform' });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root} aria-label="Welcome to Palm Regal" data-dark="0">
      <div className="hero-stick">
        <div className="hero-title">
          <p>Serviced suites · Gopalpur on Sea · Odisha</p>
          <h1><span style={{ display: 'block', overflow: 'hidden' }}><span className="ln" style={{ display: 'block' }}>Beachfront bliss,</span></span><span style={{ display: 'block', overflow: 'hidden', paddingBottom: '.08em' }}><span className="ln" style={{ display: 'block' }}><em>just for you.</em></span></span></h1>
        </div>
        <div className="hero-frame" ref={frame} data-gl="hero" data-src={heroSlides[0].src} data-p="0">
          {heroSlides.map((s, i) => (
            <div key={s.src} className={'slide' + (i === cur ? ' on' : '') + (instant ? ' instant' : '')}>
              <img src={s.src} alt={s.alt} fetchPriority={i === 0 ? 'high' : 'auto'} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
        <div className="hero-veil" />
        <div className="hero-in">
          <div className="wrap hero-grid">
            <div>
              <h2>A home by the sea, <em>wrapped in green.</em></h2>
              <p className="cap" aria-live="polite">{heroSlides[cur].cap}</p>
            </div>
            <div className="counter" aria-label="Photos">
              <span className="num"><b>0{cur + 1}</b> / 0{heroSlides.length}</span>
              <div className="bars">
                {heroSlides.map((s, i) => (
                  <button key={s.src + cycle} type="button" className={(i === cur ? 'on' : '') + (cur !== 0 && i < cur ? ' done' : '')} aria-label={`Show photo ${i + 1}`} aria-current={i === cur} onClick={() => go(i)}><span><i /></span></button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="hero-hint" aria-hidden="true">Scroll<i /></div>
      </div>
      <span className="sr">Check-in {site.checkIn}, check-out {site.checkOut}.</span>
    </section>
  );
}
