'use client';
/* Four facility chapters. Stack only when the actual content fits the viewport;
   use untransformed flow measurements so the animation cannot feed back on itself. */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { facilities, facilityGroups } from '@/content/site';

gsap.registerPlugin(ScrollTrigger);

const TONES = ['teal', 'dusk', 'paper', 'canopy'];
const NUM = ['I', 'II', 'III', 'IV'];

export function DelightsStack() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const stack = el.querySelector<HTMLElement>('.dstack')!;
    const cards = Array.from(stack.querySelectorAll<HTMLElement>('.dcard'));
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let context: gsap.Context | null = null;
    let frame = 0, alive = true, signature = '';
    const measure = () => {
      frame = 0;
      if (!alive) return;
      const heights = cards.map(card => card.offsetHeight);
      const nextSignature = [innerWidth, innerHeight, preference.matches, ...heights].join(':');
      if (signature === nextSignature) return;
      signature = nextSignature;
      context?.revert();
      const fits = !preference.matches && innerWidth > 900 && heights.every(height => height <= innerHeight + 1);
      el.dataset.stacking = String(fits);
      if (preference.matches) { ScrollTrigger.refresh(); return; }

      context = gsap.context(() => {
        if (fits) {
          const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
          let offset = 0;
          cards.slice(0, -1).forEach((card, index) => {
            offset += heights[index] + gap;
            const nextOffset = offset;
            const top = () => stack.getBoundingClientRect().top + scrollY + nextOffset;
            /* transform and an overlay's opacity only: both stay on the compositor, so the card's
               photos and text are never repainted while it recedes */
            const veil = card.querySelector<HTMLElement>('.dcard-veil');
            gsap.timeline({ scrollTrigger: { trigger: stack, start: () => top() - innerHeight * .92, end: top, scrub: .9, invalidateOnRefresh: true } })
              .fromTo(card, { scale: 1, y: 0 }, { scale: .96, y: -8, ease: 'none', force3D: true }, 0)
              .fromTo(veil, { opacity: 0 }, { opacity: .16, ease: 'none' }, 0);
          });
        }
        cards.forEach(card => {
          const photo = card.querySelector<HTMLElement>('.dcard-main');
          if (!photo || photo.dataset.revealed === 'true') return;
          gsap.fromTo(photo, { clipPath: 'inset(6% 4% 6% 4%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power3.out',
            onStart: () => { photo.dataset.revealed = 'true'; },
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          });
        });
      }, el);
      ScrollTrigger.refresh();
    };
    const schedule = () => { if (alive && !frame) frame = requestAnimationFrame(measure); };
    const fontsReady = () => { signature = ''; schedule(); };
    const observer = new ResizeObserver(schedule);
    observer.observe(stack);
    cards.forEach(card => observer.observe(card));
    preference.addEventListener('change', schedule);
    addEventListener('resize', schedule);
    document.fonts?.ready.then(fontsReady);
    document.fonts?.addEventListener('loadingdone', fontsReady);
    schedule();
    return () => {
      alive = false; cancelAnimationFrame(frame); observer.disconnect();
      preference.removeEventListener('change', schedule); removeEventListener('resize', schedule);
      document.fonts?.removeEventListener('loadingdone', fontsReady);
      context?.revert(); delete el.dataset.stacking;
    };
  }, []);

  return (
    <div className="dstack-wrap" ref={root}>
      <div className="dstack">
        {facilityGroups.map((g, gi) => {
          const list = facilities.filter(f => f.group === g.id);
          const pics = list.filter(f => f.img && !f.standIn).slice(0, 2);
          return (
            <article className={'dcard dcard--' + TONES[gi]} key={g.id}>
              <span className="dcard-veil" aria-hidden="true" />
              <div className="dcard-body">
                <span className="dcard-no">{NUM[gi]}</span>
                <h3>{g.title} <em>{g.em}</em></h3>
                <p className="dcard-lede">{g.text}</p>
                <ul>
                  {list.map(f => <li key={f.name}><b>{f.name}{f.tag && <i> {f.tag}</i>}</b><span>{f.text}</span></li>)}
                </ul>
              </div>
              <div className="dcard-media">
                {pics[0] && <div className="dcard-main"><img src={pics[0].img} alt={pics[0].name} loading="lazy" decoding="async" /></div>}
                {pics[1] && <div className="dcard-small"><img src={pics[1].img} alt={pics[1].name} loading="lazy" decoding="async" /></div>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
