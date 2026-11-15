'use client';
import { useEffect, useRef } from 'react';

/* Marks the testimonials section as in view once, so its heading and cards blur into place one after another
   (the timing lives in testimonials.css, each element staggered by its --i). Without motion everything is shown.
   On a desktop pointer, each card also leans a little toward the cursor under a soft spotlight that follows it. */
export function TestimonialsReveal() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const sec = ref.current?.closest('section');
    if (!sec) return;
    sec.classList.add('tm-armed');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) { sec.classList.add('tm-in'); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { sec.classList.add('tm-in'); io.disconnect(); } }, { rootMargin: '0px 0px -18% 0px' });
    io.observe(sec);

    /* tilt and spotlight: pointer devices only, one write per frame */
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return () => io.disconnect();
    let raf = 0, card: HTMLElement | null = null, x = 0, y = 0;
    const paint = () => {
      raf = 0; if (!card) return;
      const r = card.getBoundingClientRect(), px = (x - r.left) / r.width, py = (y - r.top) / r.height;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      card.style.setProperty('--ry', `${((px - .5) * 5).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((.5 - py) * 5).toFixed(2)}deg`);
    };
    /* a card the pointer leaves eases back to flat */
    const rest = (c: HTMLElement | null) => { if (!c) return; c.classList.remove('is-lit'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); };
    const move = (e: PointerEvent) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>('.tm-card');
      if (c !== card) { rest(card); card = c; card?.classList.add('is-lit'); }
      x = e.clientX; y = e.clientY;
      if (card && !raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => { rest(card); card = null; };
    sec.addEventListener('pointermove', move);
    sec.addEventListener('pointerleave', leave);
    return () => { io.disconnect(); cancelAnimationFrame(raf); sec.removeEventListener('pointermove', move); sec.removeEventListener('pointerleave', leave); };
  }, []);
  return <span ref={ref} hidden />;
}
