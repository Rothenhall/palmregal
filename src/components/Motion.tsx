'use client';
/* Smooth scroll, heading reveals, word fill, parallax and the page-colour shifts between sections */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { hasMotion, isFine } from '@/lib/env';

gsap.registerPlugin(ScrollTrigger, SplitText);
const COLORS: Record<string, string> = { dawn: '#F4F8F3', dusk: '#0C252C', mint: '#EEF5F2', sage: '#DCEBE4', teal: '#193F47', canopy: '#2E5E43', night: '#102E37' };

export function Motion() {
  const path = usePathname();

  useEffect(() => {
    if (!hasMotion() || !isFine()) return;
    const lenis = new Lenis({ lerp: .1, smoothWheel: true });
    (window as any).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); delete (window as any).__lenis; };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const lenis = (window as any).__lenis;
    if (location.hash) {
      const go = () => { const t = document.querySelector(location.hash); if (t) lenis ? lenis.scrollTo(t, { offset: -70, immediate: true }) : t.scrollIntoView(); };
      setTimeout(go, 60);
    } else if (lenis) lenis.scrollTo(0, { immediate: true });
    if (!hasMotion()) { html.classList.add('ready'); return; }

    let ctx: gsap.Context | null = null; let started = false; const splits: SplitText[] = [];
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });

    const init = () => {
      if (started) return; started = true; html.classList.add('ready');
      document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
      ctx = gsap.context(() => {
        const ease = 'expo.out';
        const lines = (el: Element) => { const s = new SplitText(el, { type: 'lines', mask: 'lines' }); splits.push(s); return s.lines; };
        document.querySelectorAll('[data-split]').forEach(h => {
          const now = h.hasAttribute('data-now');
          gsap.from(lines(h), { yPercent: 105, duration: 1.15, stagger: .08, ease, delay: now ? .2 : 0, scrollTrigger: now ? undefined : { trigger: h, start: 'top 88%', once: true } });
        });
        /* stacking cards: as each card arrives, the one before it recedes (scale to .93, up 10px,
           a touch darker). The cards themselves stay readable; only the one being covered changes. */
        document.querySelectorAll<HTMLElement>('[data-stack]').forEach(stack => {
          const cards = Array.from(stack.children) as HTMLElement[];
          ScrollTrigger.create({ trigger: stack, start: 'top bottom', end: 'bottom top', onUpdate: () => {
            const vh = innerHeight;
            cards.forEach((c, i) => {
              const next = cards[i + 1]; if (!next) return;
              const t = Math.max(0, Math.min(1, (vh * .9 - next.getBoundingClientRect().top) / (vh * .75)));
              c.style.transform = `scale(${1 - t * .07}) translateY(${-t * 10}px)`; c.style.filter = `brightness(${1 - t * .18})`;
            });
          } });
        });
        /* colour fill: a full-colour copy is revealed over a faded one as you read down, edged by a
           thin line. The words never move; once filled it stays filled (NN/g). */
        document.querySelectorAll<HTMLElement>('[data-fill]').forEach(el => {
          const top = el.querySelector<HTMLElement>('.fill-top')!, line = el.querySelector<HTMLElement>('.fill-line')!;
          let most = 0;
          const set = (p: number) => { top.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`; line.style.top = `${p * 100}%`; line.style.opacity = p > .005 && p < .995 ? '1' : '0'; };
          set(0);
          ScrollTrigger.create({ trigger: el, start: 'top 78%', end: 'bottom 40%', onUpdate: self => { const p = gsap.parseEase('power1.inOut')(self.progress); if (p > most) { most = p; set(p); } } });
        });
        if (!html.classList.contains('gl-on')) gsap.utils.toArray<HTMLElement>('[data-par] img').forEach(img => gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img.parentElement!, start: 'top bottom', end: 'bottom top', scrub: true } }));
        document.querySelectorAll<SVGPathElement>('.map .route').forEach((r, i) => { const len = r.getTotalLength(); gsap.fromTo(r, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, delay: i * .15, ease: 'power2.inOut', scrollTrigger: { trigger: '.map', start: 'top 75%', once: true }, onComplete: () => { if (!r.classList.contains('accent')) r.style.strokeDasharray = '5 7'; } }); });
        const cnt = document.querySelector('.dl-count'); if (cnt) gsap.from(cnt, { textContent: 0, duration: 1.6, ease: 'power2.out', snap: { textContent: 1 }, scrollTrigger: { trigger: cnt, start: 'top 88%', once: true } });
        /* parallax: [data-speed] moves against the scroll; positive is faster than the page, negative slower */
        const mob = innerWidth < 760 ? .5 : 1;
        gsap.utils.toArray<HTMLElement>('[data-speed]').forEach(el => {
          const sp = parseFloat(el.dataset.speed || '0') * mob; if (!sp) return;
          const trig = (el.dataset.ptrigger && el.closest(el.dataset.ptrigger)) || el;
          gsap.fromTo(el, { y: sp * 110 }, { y: -sp * 110, ease: 'none', scrollTrigger: { trigger: trig, start: 'top bottom', end: 'bottom top', scrub: .4 } });
        });
        gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach(g => gsap.from(g.children, { y: 36, opacity: 0, duration: 1, stagger: .07, ease, clearProps: 'transform,opacity', scrollTrigger: { trigger: g, start: 'top 85%', once: true } }));
        /* page colour follows the section in the middle of the screen */
        const secs = gsap.utils.toArray<HTMLElement>('main [data-bg]');
        if (secs.length) {
          html.classList.add('shift');
          const setBg = (k: string) => { document.body.style.backgroundColor = COLORS[k] || COLORS.mint; };
          setBg(secs[0].dataset.bg!);
          /* whichever section crosses 55% of the screen sets the colour; works after jumps too */
          let last = '';
          const pick = () => {
            const line = innerHeight * .55; let k = secs[0].dataset.bg!;
            for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= line) k = s.dataset.bg!; else break; }
            if (k !== last) { last = k; setBg(k); }
          };
          ScrollTrigger.create({ start: 0, end: 'max', onUpdate: pick, onRefresh: pick });
        }
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const fonts = (document as any).fonts;
    if (fonts?.ready) { fonts.ready.then(init); } const fallback = setTimeout(init, 1500);
    const onLoad = () => ScrollTrigger.refresh(); addEventListener('load', onLoad);

    return () => {
      clearTimeout(fallback); removeEventListener('load', onLoad); io.disconnect();
      ctx?.revert(); splits.forEach(s => s.revert());
      html.classList.remove('shift', 'ready'); document.body.style.backgroundColor = '';
    };
  }, [path]);

  return null;
}
