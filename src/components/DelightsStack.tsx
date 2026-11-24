'use client';
/* Four facility chapters that stack: each card stays while the next slides over it, and the one
   beneath recedes. Cards taller than the screen stick by their bottom edge (see measure). Measures
   use untransformed flow sizes so the animation cannot feed back on itself. On phones (and with
   reduced motion) the cards simply flow one after another, so every card can be read in full.
   Inside a card, every listed facility with a photograph owns exactly one image on the stage:
   hovering or tapping the item brings its photograph in, and the card steps through them on its
   own while it is the one on screen. */
import './delights.css';
import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Edit, Facility, FacilityGroup } from '@/content/types';
import { noEdit } from '@/lib/edit';

gsap.registerPlugin(ScrollTrigger);

const TONES = ['teal', 'dusk', 'paper', 'canopy'];
const NUM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
/* below this width the cards do not stack */
const PHONE = '(max-width: 759px)';
const STEP_MS = 3500;
const TOUCH_HOLD_MS = 8000;

const hasPic = (x: Facility) => Boolean(x.img && !x.standIn);

export function DelightsStack({ groups, f = noEdit }: { groups: FacilityGroup[]; f?: Edit }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const stack = el.querySelector<HTMLElement>('.dstack')!;
    const cards = Array.from(stack.querySelectorAll<HTMLElement>('.dcard'));
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia(PHONE);
    let context: gsap.Context | null = null;
    let frame = 0, alive = true, signature = '';
    const measure = () => {
      frame = 0;
      if (!alive) return;
      const heights = cards.map(card => card.offsetHeight);
      const nextSignature = [innerWidth, innerHeight, preference.matches, phone.matches, ...heights].join(':');
      if (signature === nextSignature) return;
      signature = nextSignature;
      context?.revert();
      /* Every card stacks, whatever its height, except on phones. A card that fits the screen sticks
         at the top; a taller one scrolls until its bottom reaches the bottom of the screen and sticks
         there, so all of its content has been read before the next card slides over it. */
      const stacks = !preference.matches && !phone.matches;
      el.dataset.stacking = String(stacks);
      cards.forEach((card, index) => { card.style.top = stacks ? `${Math.min(0, Math.round(innerHeight - heights[index]))}px` : ''; });
      if (preference.matches) { ScrollTrigger.refresh(); return; }

      context = gsap.context(() => {
        if (stacks) {
          const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
          let offset = 0;
          cards.slice(0, -1).forEach((card, index) => {
            offset += heights[index] + gap;
            const nextOffset = offset;
            const top = () => stack.getBoundingClientRect().top + scrollY + nextOffset;
            /* transform and an overlay's opacity only: both stay on the compositor, so the card's
               photos and text are never repainted while it recedes */
            const veil = card.querySelector<HTMLElement>('.dcard-veil');
            gsap.timeline({ scrollTrigger: { trigger: stack, start: () => top() - innerHeight * .92, end: top, scrub: true, invalidateOnRefresh: true } })
              .fromTo(card, { scale: 1, y: 0 }, { scale: .96, y: -8, ease: 'none', force3D: true }, 0)
              .fromTo(veil, { opacity: 0 }, { opacity: .16, ease: 'none' }, 0);
          });
        }
        cards.forEach(card => {
          const photo = card.querySelector<HTMLElement>('.dcard-stage');
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
    phone.addEventListener('change', schedule);
    addEventListener('resize', schedule);
    document.fonts?.ready.then(fontsReady);
    document.fonts?.addEventListener('loadingdone', fontsReady);
    schedule();
    return () => {
      alive = false; cancelAnimationFrame(frame); observer.disconnect();
      preference.removeEventListener('change', schedule); phone.removeEventListener('change', schedule);
      removeEventListener('resize', schedule);
      document.fonts?.removeEventListener('loadingdone', fontsReady);
      context?.revert(); delete el.dataset.stacking; cards.forEach(card => { card.style.top = ''; });
    };
  }, [groups.length]);

  return (
    <div className="dstack-wrap" ref={root}>
      <div className="dstack">
        {groups.map((g, gi) => <DelightCard key={gi} g={g} gi={gi} f={f} />)}
      </div>
    </div>
  );
}

type Shown = { active: number; prev: number; dir: 1 | -1; moved: boolean };

function DelightCard({ g, gi, f }: { g: FacilityGroup; gi: number; f: Edit }) {
  const list = g.items;
  const picIdx = list.map((x, i) => (hasPic(x) ? i : -1)).filter(i => i >= 0);
  const stageId = useId();
  const card = useRef<HTMLElement>(null);
  const [shown, setShown] = useState<Shown>({ active: picIdx[0] ?? -1, prev: -1, dir: 1, moved: false });
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [touchHold, setTouchHold] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchTimer = useRef(0);

  /* the list can change in the editor: keep the active item pointing at a photograph */
  const picKey = picIdx.join(',');
  const active = hasPic(list[shown.active] ?? { name: '', text: '' }) ? shown.active : (picIdx[0] ?? -1);

  const show = (i: number, dir?: 1 | -1) => setShown(s => {
    const from = hasPic(list[s.active] ?? { name: '', text: '' }) ? s.active : (picIdx[0] ?? -1);
    if (i === from || !hasPic(list[i])) return s;
    return { active: i, prev: from, dir: dir ?? (i > from ? 1 : -1), moved: true };
  });

  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(q.matches);
    sync(); q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);

  /* "on screen" = at least half of the card (or half the screen, for a tall card) is visible */
  useEffect(() => {
    const el = card.current!;
    const io = new IntersectionObserver(([entry]) => {
      const need = Math.min(entry.boundingClientRect.height, innerHeight) * .5;
      setInView(entry.isIntersecting && entry.intersectionRect.height >= need);
    }, { threshold: [0, .25, .5, .75, 1] });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(touchTimer.current); };
  }, []);

  const playing = inView && !hover && !focus && !touchHold && !reduced && picIdx.length > 1;

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      const at = picIdx.indexOf(active);
      show(picIdx[(at + 1) % picIdx.length], 1);
    }, STEP_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active, picKey]);

  const holdForTouch = () => {
    setTouchHold(true);
    clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => setTouchHold(false), TOUCH_HOLD_MS);
  };

  const activeItem = active >= 0 ? list[active] : null;

  return (
    <article
      ref={card}
      className={'dcard dcard--' + TONES[gi % TONES.length]}
      data-playing={playing ? 'true' : undefined}
      onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') setHover(false); }}
      onPointerDown={e => { if (e.pointerType !== 'mouse') holdForTouch(); }}
      onFocus={() => setFocus(true)}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false); }}
    >
      <span className="dcard-veil" aria-hidden="true" />
      <div className="dcard-body">
        <span className="dcard-no">{NUM[gi % NUM.length]}</span>
        <h3 {...f(g, 'title')}>{g.title} <em {...f(g, 'em')}>{g.em}</em></h3>
        <p className="dcard-lede" {...f(g, 'text')}>{g.text}</p>
        <ul>
          {list.map((x, xi) => {
            const label = <><b>{x.name}{x.tag && <i> {x.tag}</i>}</b><span {...f(x, 'text')}>{x.text}</span></>;
            if (!hasPic(x)) return <li key={xi} {...f(x, 'name')}><div className="dcard-item dcard-item--plain">{label}</div></li>;
            const on = xi === active;
            return (
              <li key={xi} {...f(x, 'name')}>
                <button
                  type="button"
                  className={'dcard-item' + (on ? ' is-on' : '')}
                  aria-pressed={on}
                  aria-controls={stageId}
                  onPointerEnter={e => { if (e.pointerType === 'mouse') show(xi); }}
                  onClick={() => show(xi)}
                >{label}</button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="dcard-media">
        <div className="dcard-stage" id={stageId} data-moved={shown.moved ? 'true' : undefined} data-dir={shown.dir === 1 ? 'next' : 'back'}>
          {picIdx.map(i => {
            const x = list[i];
            const state = i === active ? ' is-on' : i === shown.prev ? ' is-prev' : '';
            return (
              <div className={'dcard-shot' + state} key={i} aria-hidden={i !== active}>
                <img src={x.img!} alt={x.name} loading="lazy" decoding="async" {...f(x, 'img')} />
              </div>
            );
          })}
          {activeItem && <span className="dcard-chip" key={active} aria-hidden="true">{activeItem.name}</span>}
        </div>
      </div>
    </article>
  );
}
