'use client';
/* Smooth scroll, heading reveals, parallax and the page-colour shifts between sections */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { hasMotion } from '@/lib/env';

gsap.registerPlugin(ScrollTrigger, SplitText);
/* the phone address bar showing and hiding is not a real resize: never recalculate every trigger for it */
ScrollTrigger.config({ ignoreMobileResize: true });
/* lenis.dev glides clicked scrolls with lerp .1 rather than a fixed duration */
const PROGRAMMATIC_LERP = .1;
const COLORS: Record<string, string> = { dusk: '#0C252C', night: '#102E37' };

/* held sections fill the screen from their own top; everything else clears the header */
const offsetFor = (t: Element) =>
  t.matches('.location-map') && document.documentElement.classList.contains('dsun-exit') ? innerHeight
  : t.matches('.location-map, .dsun.held, .aerial-hero') ? 0 : -70;

export function Motion() {
  const path = usePathname();

  /* Lenis tuned to feel like lenis.dev itself. That site runs Lenis 2 (dev) with
       { stopInertiaOnNavigate: true, wheel: { smooth: true, lerp: .125 }, touch: { smooth: true }, autoRaf: false }
     and v2's touch defaults (lerp .1, inertia 2; on iOS lerp .05, inertia 1.7) and programmatic lerp .1.
     These are the same values in Lenis 1.3's options (the damping maths is identical). It is set up
     for GSAP as documented: ScrollTrigger updated on every Lenis scroll, Lenis driven by GSAP's
     ticker with lag smoothing off, and the official stylesheet (imported in layout.tsx). */
  useEffect(() => {
    if (!hasMotion()) return;
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
    const lenis = new Lenis({
      lerp: .125, smoothWheel: true, wheelMultiplier: 1,
      syncTouch: true, syncTouchLerp: ios ? .05 : .1, touchInertiaExponent: ios ? 1.7 : 2, touchMultiplier: 1,
      stopInertiaOnNavigate: true, autoRaf: false,
    });
    (window as any).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);

    /* Links to a part of this page glide there with Lenis. Lenis's own `anchors` option scrolls but
       leaves the browser's (and Next's) instant jump in place, so the click is taken over here:
       Next's <Link> stands down when the click is already handled. */
    const glide = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || a.target || a.classList.contains('skip')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      let target: Element | null = null;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: offsetFor(target), lerp: PROGRAMMATIC_LERP, force: true });
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    };
    addEventListener('click', glide, true);
    return () => { removeEventListener('click', glide, true); gsap.ticker.remove(tick); lenis.destroy(); delete (window as any).__lenis; };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const lenis = (window as any).__lenis;
    if (location.hash) {
      const go = () => {
        const t = document.querySelector(location.hash); if (!t) return;
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(t, { offset: offsetFor(t), immediate: true });
        } else t.scrollIntoView();
      };
      setTimeout(go, 60);
    } else if (lenis) lenis.scrollTo(0, { immediate: true });
    if (!hasMotion()) { html.classList.add('ready'); return; }

    let ctx: gsap.Context | null = null; let started = false; const splits: SplitText[] = [];

    const init = () => {
      if (started) return; started = true; html.classList.add('ready');
      ctx = gsap.context(() => {
        const soft = 'power4.out';
        const lines = (el: Element) => { const s = new SplitText(el, { type: 'lines', mask: 'lines' }); splits.push(s); return s.lines; };
        document.querySelectorAll('[data-split]').forEach(h => {
          gsap.from(lines(h), { yPercent: 105, duration: 1.8, stagger: .12, ease: soft, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
        });
        /* parallax: [data-speed] moves against the scroll; positive is faster than the page, negative slower */
        const mob = innerWidth < 760 ? .5 : 1;
        gsap.utils.toArray<HTMLElement>('[data-speed]').forEach(el => {
          const sp = parseFloat(el.dataset.speed || '0') * mob; if (!sp) return;
          const trig = (el.dataset.ptrigger && el.closest(el.dataset.ptrigger)) || el;
          gsap.fromTo(el, { y: sp * 110 }, { y: -sp * 110, ease: 'none', scrollTrigger: { trigger: trig, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
        });
        /* page colour follows the section in the middle of the screen */
        const secs = gsap.utils.toArray<HTMLElement>('main [data-bg]');
        if (secs.length) {
          html.classList.add('shift');
          const colorOf = (s: HTMLElement) => COLORS[s.dataset.bg!] || COLORS.dusk;
          const setBg = (c: string) => { document.body.style.backgroundColor = c; };
          setBg(colorOf(secs[0]));
          /* whichever section crosses 55% of the screen sets the colour; works after jumps too.
             Section tops are measured on refresh only, so scrolling never forces a layout. */
          let last = '', tops: number[] = [];
          const pick = () => {
            const line = scrollY + innerHeight * .55; let k = colorOf(secs[0]);
            for (let n = 0; n < secs.length; n++) { if (tops[n] <= line) k = colorOf(secs[n]); else break; }
            if (k !== last) { last = k; setBg(k); }
          };
          const measure = () => { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); pick(); };
          ScrollTrigger.create({ start: 0, end: 'max', onUpdate: pick, onRefresh: measure });
        }
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const fonts = (document as any).fonts;
    if (fonts?.ready) { fonts.ready.then(init); } const fallback = setTimeout(init, 1500);
    const onLoad = () => ScrollTrigger.refresh(); addEventListener('load', onLoad);

    return () => {
      clearTimeout(fallback); removeEventListener('load', onLoad);
      ctx?.revert(); splits.forEach(s => s.revert());
      html.classList.remove('shift', 'ready'); document.body.style.backgroundColor = '';
    };
  }, [path]);

  return null;
}
