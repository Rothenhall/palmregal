'use client';
/* Our suites as a sideways journey. The structure follows the Spyker heritage page: the section
   holds and the scroll carries a long strip from left to right, chapter by chapter, with a quiet
   chapter bar that shows where you are.

   Each suite is one chapter: a large outline number that rises into place as it arrives, a
   full-height photograph that opens from a sliver while the picture drifts inside its frame, the
   facts arriving in a short cascade, and smaller photographs set at different heights that travel
   at their own speeds. It opens on the heading and closes on what comes in every suite.

   Without motion it is a strip you swipe or scroll sideways, one chapter at a time. */
import './suites.css';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Edit, SiteContent, Suite } from '@/content/types';
import { hasMotion } from '@/lib/env';
import { bookHref } from '@/lib/book';
import { noEdit } from '@/lib/edit';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, '0');

/* A small rolling carousel: every few seconds the next photograph fades in over the last while it settles from a
   slow zoom. It waits while hovered or touched, while it is off screen, and does not roll at all for reduced
   motion (the arrows, dots and swipes still work). Photographs load only as they come up, plus the next one. */
const ROLL_MS = 4500;
type Photo = Suite['photos'][number];

function useRoll(count: number, offset = 0) {
  const ref = useRef<HTMLElement>(null);
  const [at, setAt] = useState({ i: 0, p: -1 });
  const [seen, setSeen] = useState(false);
  const [hold, setHold] = useState(false);
  const [still, setStill] = useState(false);
  const [ready, setReady] = useState<number[]>([0]);
  const first = useRef(true);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const index = count ? at.i % count : 0;
  const to = (k: number) => setAt(a => (k === a.i ? a : { i: k, p: a.i }));
  const step = (d: number) => setAt(a => ({ i: (a.i + d + count) % count, p: a.i }));

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: '0px 160px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setStill(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  /* the photograph on show and the next one are loaded; the rest wait */
  useEffect(() => {
    if (!seen || count < 2) return;
    const next = (index + 1) % count;
    setReady(r => (r.includes(index) && r.includes(next) ? r : Array.from(new Set([...r, index, next]))));
  }, [seen, index, count]);
  /* the roll itself: restarts after every change, so a tap on an arrow gives the new photograph its full time */
  useEffect(() => {
    if (count < 2 || !seen || hold || still) return;
    const t = setTimeout(() => { first.current = false; step(1); }, ROLL_MS + (first.current ? offset : 0));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seen, hold, still, at, offset]);

  const handlers = {
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => { if (e.pointerType === 'mouse') setHold(true); },
    onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => { if (e.pointerType === 'mouse') setHold(false); },
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse') return;
      touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      swiped.current = false;
      setHold(true);
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      const s = touch.current; touch.current = null;
      if (e.pointerType !== 'mouse') setHold(false);
      if (!s || s.id !== e.pointerId || count < 2) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      /* a sideways swipe only; anything more vertical is the page scrolling */
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped.current = true; step(dx < 0 ? 1 : -1); }
    },
    onPointerCancel: () => { touch.current = null; setHold(false); },
    /* a swipe is not a tap: it must not open the walk */
    onClickCapture: (e: ReactMouseEvent<HTMLElement>) => { if (swiped.current) { swiped.current = false; e.stopPropagation(); e.preventDefault(); } },
  };
  return { ref, index, prev: count ? at.p : -1, ready, hold, to, step, handlers };
}

function Frames({ photos, index, prev, ready, f, lazyFirst }: { photos: Photo[]; index: number; prev: number; ready: number[]; f: Edit; lazyFirst?: boolean }) {
  return (
    <span className="sj-roll">
      {photos.map((p, k) => (
        <img key={k} className={k === index ? 'on' : k === prev ? 'was' : undefined} src={ready.includes(k) || k === index ? p.src : undefined}
          alt={p.alt} aria-hidden={k !== index || undefined} decoding="async" loading={k === 0 && lazyFirst ? 'lazy' : undefined} {...f(p, 'src')} />
      ))}
    </span>
  );
}

function CardPhotos({ suite, f, offset }: { suite: Suite; f: Edit; offset: number }) {
  const photos = suite.photos, count = photos.length;
  const r = useRoll(count, offset);
  const stop = (e: ReactMouseEvent, fn: () => void) => { e.stopPropagation(); fn(); };
  return (
    <figure ref={r.ref} className="sj-card-ph sj-rolling" aria-roledescription="carousel" aria-label={`${suite.name} photographs`} {...r.handlers}>
      {count > 0 && <Frames photos={photos} index={r.index} prev={r.prev} ready={r.ready} f={f} lazyFirst />}
      {count > 1 && <>
        <button type="button" className="sj-roll-btn prev" aria-label={`Previous photograph of ${suite.name}`} onClick={e => stop(e, () => r.step(-1))}><Icon id="i-arrow" /></button>
        <button type="button" className="sj-roll-btn next" aria-label={`Next photograph of ${suite.name}`} onClick={e => stop(e, () => r.step(1))}><Icon id="i-arrow" /></button>
        <span className="sj-roll-dots">
          {photos.map((_, k) => (
            <button key={k} type="button" aria-label={`Photograph ${k + 1} of ${count}`} aria-current={k === r.index ? 'true' : undefined} onClick={e => stop(e, () => r.to(k))} />
          ))}
        </span>
      </>}
    </figure>
  );
}

function SuitePhotos({ suite, f }: { suite: Suite; f: Edit }) {
  const count = suite.photos.length;
  const r = useRoll(count);
  const index = r.index, photo = suite.photos[index];
  return (
    <figure ref={r.ref} className="sj-hero sj-rolling" aria-label={`${suite.name} photographs`} {...r.handlers}>
      <Frames photos={suite.photos} index={index} prev={r.prev} ready={r.ready} f={f} />
      {suite.pending && <span className="stand">Photo to confirm</span>}
      <figcaption className="sj-photo-caption">
        <span><small>{pad(index + 1)} / {pad(count)}</small><span {...f(photo, 'alt')}>{photo.alt}</span></span>
        {count > 1 && <div className="sj-photo-controls">
          <button type="button" className="sj-photo-prev" aria-label={`Previous photograph of ${suite.name}`} onClick={e => { e.stopPropagation(); r.step(-1); }}><Icon id="i-arrow" /></button>
          <button type="button" aria-label={`Next photograph of ${suite.name}`} onClick={e => { e.stopPropagation(); r.step(1); }}><Icon id="i-arrow" /></button>
        </div>}
      </figcaption>
    </figure>
  );
}
/* "One Bedroom Suite" reads "One Bedroom" + italic "Suite"; other names italicise their last two words */
const title = (name: string) => {
  const w = name.split(' '), k = w[w.length - 1] === 'Suite' ? 1 : 2;
  return <>{w.slice(0, -k).join(' ')} <em>{w.slice(-k).join(' ')}</em></>;
};

export function SuiteJourney({ content, f = noEdit }: { content: SiteContent; f?: Edit }) {
  const site = content.general, sc = content.suitesSection, suites = sc.suites, N = suites.length;
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  /* The section is a short overview of the three suites, and by default the page simply scrolls on past it.
     The sideways walk is opt-in: the button (or a suite card) opens it. The overview stays exactly where it is as
     the first panel of the strip, and from then on scrolling down carries the strip sideways through each suite
     to the close, then the page continues. */
  const [walk, setWalk] = useState(false);
  const holding = held && walk;
  const walkST = useRef<ScrollTrigger | null>(null);
  const pending = useRef<number | null>(null);
  const glide = (chapter = -1) => {
    const sec = root.current, tr = track.current; if (!sec || !tr) return;
    let y = sec.getBoundingClientRect().top + scrollY;
    const st = walkST.current, ch = chapter >= 0 ? tr.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`) : null;
    if (st && !ch) y = st.start;
    else if (st && ch) {
      const dist = Math.max(1, tr.scrollWidth - innerWidth);
      const x = Math.min(dist, Math.max(0, ch.offsetLeft - innerWidth * .06));
      y = st.start + (st.end - st.start) * (x / dist);
    } else if (ch) {
      tr.scrollTo({ left: ch.offsetLeft, behavior: 'smooth' });
    }
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(y, { lerp: .09 }); else scrollTo({ top: y, behavior: 'smooth' });
  };
  /* the button and the cards: open the walk first if needed (it measures itself on the next frames), then glide */
  const go = (chapter: number) => {
    if (walk) { glide(chapter); return; }
    pending.current = chapter;
    setWalk(true);
  };
  /* without the held strip the walk is a swipe strip below the overview; glide to it once it has rendered */
  useEffect(() => {
    if (!walk || held || pending.current === null) return;
    const ch = pending.current; pending.current = null;
    requestAnimationFrame(() => {
      const tr = track.current; if (!tr) return;
      const y = tr.getBoundingClientRect().top + scrollY - innerHeight * .1;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.scrollTo(y, { lerp: .09 }); else scrollTo({ top: y, behavior: 'smooth' });
      const el = tr.querySelector<HTMLElement>(`[data-chapter="${Math.max(0, ch)}"]`);
      if (el && ch > 0) tr.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
    });
  }, [walk, held]);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const height = matchMedia('(min-height: 520px)');
    const configure = () => setHeld(hasMotion() && height.matches);
    configure();
    motion.addEventListener('change', configure); height.addEventListener('change', configure);
    return () => { motion.removeEventListener('change', configure); height.removeEventListener('change', configure); };
  }, []);

  useEffect(() => {
    if (!holding) return;
    const sec = root.current!, tr = track.current!;
    const dist = () => Math.max(0, tr.scrollWidth - innerWidth);
    /* the section is as tall as the strip is wide, so one scroll step moves it one step sideways,
       plus only a breath at each end: the strip starts moving almost as soon as it pins, so the scroll
       never feels stopped */
    const lead = () => innerHeight * .06, tail = () => innerHeight * .06;
    const setH = () => { sec.style.height = `${dist() + innerHeight + lead() + tail()}px`; };
    setH();
    const ctx = gsap.context(() => {
      const tween = gsap.to(tr, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: () => `top+=${lead()} top`, end: () => `bottom-=${tail()} bottom`, scrub: true, invalidateOnRefresh: true },
      });
      walkST.current = tween.scrollTrigger ?? null;
      /* the fade on the right edge says "more this way" until the strip starts moving */
      ScrollTrigger.create({ trigger: sec, start: () => `top+=${lead()} top`, end: () => `bottom-=${tail()} bottom`, onUpdate: self => sec.classList.toggle('sj-moved', self.progress > .015) });
      const along = { containerAnimation: tween };

      /* large numbers rise into their mask as they come in */
      tr.querySelectorAll<HTMLElement>('.sj-num').forEach(el =>
        gsap.fromTo(el.firstElementChild, { yPercent: 104 }, { yPercent: 0, ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left 100%', end: 'left 50%', scrub: true } }));
      /* each main photograph opens from a sliver, and the picture drifts inside its frame */
      tr.querySelectorAll<HTMLElement>('.sj-hero').forEach(el => {
        gsap.fromTo(el, { clipPath: 'inset(10% 0% 10% 42%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left 100%', end: 'left 30%', scrub: true } });
        /* the drift moves the whole roll, so the carousel's own fade and zoom stay on the photographs inside */
        const img = el.querySelector('.sj-roll');
        if (img) gsap.fromTo(img, { xPercent: -7, scale: 1.16 }, { xPercent: 7, scale: 1.04, ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left right', end: 'right left', scrub: true } });
      });
      /* the smaller photographs travel at their own speeds, for depth */
      tr.querySelectorAll<HTMLElement>('[data-drift]').forEach(el => {
        const s = parseFloat(el.dataset.drift!);
        gsap.fromTo(el, { x: () => s * innerWidth * .1 }, { x: () => -s * innerWidth * .1, ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true } });
      });
      /* the words arrive in a short cascade */
      tr.querySelectorAll<HTMLElement>('.sj-copy').forEach(el =>
        gsap.from(el.children, { y: 20, opacity: 0, duration: 1.5, stagger: .11, ease: 'power3.out', scrollTrigger: { ...along, trigger: el, start: 'left 84%', toggleActions: 'play none none reverse' } }));
    }, sec);
    ScrollTrigger.addEventListener('refreshInit', setH);
    ScrollTrigger.refresh();
    /* opened by the button: settle the overview at the top, where the strip starts (or glide to the chosen suite) */
    if (pending.current !== null) { const ch = pending.current; pending.current = null; requestAnimationFrame(() => glide(ch)); }
    return () => { ScrollTrigger.removeEventListener('refreshInit', setH); ctx.revert(); sec.style.height = ''; walkST.current = null; };
  }, [holding]);

  const overview = (
    <>
        <div className="sj-ov-head">
          <div>
            <p className="eyebrow" {...f(sc, 'eyebrow')}>{sc.eyebrow}</p>
            <h2 id="suites-h" data-split {...f(sc, 'title')}>{sc.title} <em {...f(sc, 'em')}>{sc.em}</em></h2>
          </div>
          <p className="lede" {...f(sc, 'lede')}>{sc.lede}</p>
        </div>
        <ul className="sj-ov-grid">
          {suites.map((s, i) => (
            <li className="sj-card" key={i} onClick={e => { if (!(e.target as HTMLElement).closest('a, button')) go(i); }}>
              <CardPhotos suite={s} f={f} offset={i * 1500} />
              <p className="sj-kicker">Suite {pad(i + 1)} <span>/ {pad(N)}</span></p>
              <h3 {...f(s, 'name')}>{title(s.name)}</h3>
              <ul className="sj-facts">
                {s.guests && <li {...f(s, 'guests')}><Icon id="i-guests" />{s.guests}</li>}
                {s.size && <li {...f(s, 'size')}><Icon id="i-size" />{s.size}</li>}
                <li {...f(s, 'outdoor')}><Icon id="i-balcony" />{s.outdoor}</li>
              </ul>
              <p className="sj-best" {...f(s, 'bestFor')}><small>Best for</small>{s.bestFor}</p>
            </li>
          ))}
        </ul>
        <div className="sj-ov-cta">
          {walk
            /* once open: a scroll hint (still a button: it glides to the first suite) */
            ? <button key="hint" type="button" className="sj-down" onClick={() => go(0)} aria-controls="suites"><span className="sj-down-ring" aria-hidden="true"><Icon id="i-arrow" /></span><span className="sj-down-hint" aria-live="polite" {...f(sc, 'walkHint')}>{sc.walkHint || 'Scroll to walk through each suite'}</span></button>
            /* before: the call to action that opens the walk */
            : <button key="cta" type="button" className="btn sj-explore" onClick={() => go(-1)} aria-controls="suites" aria-expanded={false}><span {...f(sc, 'exploreButton')}>{sc.exploreButton}</span><Icon id="i-arrow" /></button>}
          <a className="tlink" href={bookHref(site)} data-book="" {...f(content.buttons, 'checkAvailability')}>{content.buttons.checkAvailability} <Icon id="i-arrow" /></a>
        </div>
    </>
  );

  return (
    <section ref={root} className={'sj' + (held ? ' held' : '') + (walk ? ' walking' : '')} data-bg="night" id="suites" aria-labelledby="suites-h">
      {/* without the held strip (no motion, very short screens) the overview sits above a strip you swipe */}
      {!held && <div className="sj-ov-static wrap">{overview}</div>}
      {(held || walk) && <div className="sj-stick">
        <div className="sj-track" ref={track} data-lenis-prevent-horizontal>
          {held && <div className="sj-ov-panel" data-chapter="-1">{overview}</div>}
          {walk && suites.map((s, i) => (
            <article className="sj-ch" data-chapter={i} key={i} aria-labelledby={`sj-${i}`}>
              <div className="sj-num num" aria-hidden="true"><span>{pad(i + 1)}</span></div>
              <SuitePhotos suite={s} f={f} />
              <div className="sj-copy">
                <p className="sj-kicker">Suite {pad(i + 1)} <span>/ {pad(N)}</span></p>
                <h3 id={`sj-${i}`} {...f(s, 'name')}>{title(s.name)}</h3>
                <p className="sj-long" {...f(s, 'long')}>{s.long}</p>
                <ul className="sj-highlights" {...f(s, 'highlights')}>{s.highlights.map((h, k) => <li key={k}>{h}</li>)}</ul>
                <ul className="sj-facts">
                  {s.guests && <li {...f(s, 'guests')}><Icon id="i-guests" />{s.guests}</li>}
                  {s.size && <li {...f(s, 'size')}><Icon id="i-size" />{s.size}</li>}
                  <li {...f(s, 'outdoor')}><Icon id="i-balcony" />{s.outdoor}</li>
                </ul>
                {(!s.guests || !s.size) && <p className="sj-detail-note">Ask reception about guest capacity and suite size.</p>}
                <p className="sj-best" {...f(s, 'bestFor')}><small>Best for</small>{s.bestFor}</p>
                <a className="tlink" href={bookHref(site)} data-book="" {...f(content.buttons, 'checkAvailability')}>{content.buttons.checkAvailability} <Icon id="i-arrow" /></a>
              </div>
              {s.photos.length > 1 && (
                <div className="sj-bits">
                  {s.photos.slice(1, 3).map((p, k) => (
                    <figure key={k} className={'sj-bit b' + k} data-drift={k ? -.45 : .35}>
                      <span className="sj-bit-ph"><img src={p.src} alt={p.alt} decoding="async" {...f(p, 'src')} /></span>
                      <figcaption {...f(p, 'alt')}>{p.alt}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </article>
          ))}

          {walk && <div className="sj-outro" data-chapter={N}>
            <p className="eyebrow" {...f(sc, 'outroEyebrow')}>{sc.outroEyebrow}</p>
            <h3 {...f(sc, 'outroTitle')}>{sc.outroTitle}<br /><em {...f(sc, 'outroEm')}>{sc.outroEm}</em></h3>
            <ul className="sj-amenities">{sc.inEverySuite.map((x, k) => <li key={k} {...f(x, 'label')}><Icon id={x.icon || 'p-home'} /><span>{x.label}</span></li>)}</ul>
            <div className="sj-outro-links">
              <a className="tlink" href={bookHref(site)} data-book="" {...f(content.buttons, 'checkAvailability')}>{content.buttons.checkAvailability} <Icon id="i-arrow" /></a>
            </div>
          </div>}
        </div>
        {holding && <span className="sj-edge" aria-hidden="true" />}
      </div>}
    </section>
  );
}
