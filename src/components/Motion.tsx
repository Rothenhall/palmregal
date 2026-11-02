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
        document.querySelectorAll('[data-words]').forEach(st => {
          const wrap = (node: Node) => Array.from(node.childNodes).forEach(c => {
            if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent!.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; } const s = document.createElement('span'); s.className = 'w'; s.textContent = w; f.appendChild(s); }); node.replaceChild(f, c); }
            else if (c.nodeType === 1) wrap(c);
          });
          if (!st.querySelector('.w')) wrap(st);
          const ws = st.querySelectorAll('.w'); gsap.set(ws, { opacity: .16 });
          /* fills in as you read down, then stays filled: it never fades again on the way back up (NN/g) */
          let most = 0;
          ScrollTrigger.create({ trigger: st, start: 'top 82%', end: 'bottom 45%', onUpdate: self => {
            if (self.progress <= most) return; most = self.progress;
            const n = Math.round(most * ws.length); ws.forEach((w, i) => gsap.to(w, { opacity: i < n ? 1 : .16, duration: .3, overwrite: true }));
          } });
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
