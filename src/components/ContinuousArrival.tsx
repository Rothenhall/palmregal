'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { suites } from '@/content/site';
import { arrivalDistance, isBaselineArrival } from '@/lib/arrival';
import { Hero } from './Hero';
import { SuiteJourney } from './SuiteJourney';

gsap.registerPlugin(ScrollTrigger);
const MEDIA = '/media/palm-regal-source-arrival-v9-';
const BASELINE_MEDIA = '/media/palm-regal-local-arrival-v7-';
const room = suites[0].photos[0];
const phase = (p: number, a: number, b: number) => gsap.utils.clamp(0, 1, (p - a) / (b - a));
const FILM_END = .82, DOCK_START = .84, DOCK_END = .975;

/** Source-footage aerial, followed by the actual photograph docking into its card.
 * The archived composite remains available through ?arrival=baseline. */
export function ContinuousArrival() {
  const root = useRef<HTMLElement>(null);
  const [eligible, setEligible] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [baseline, setBaseline] = useState<boolean | null>(null);
  const active = eligible && roomReady && !failed && baseline !== null;

  useEffect(() => {
    setBaseline(isBaselineArrival());
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const update = () => setEligible(!reduced.matches && !connection?.saveData);
    const unavailable = () => setFailed(true);
    update(); reduced.addEventListener('change', update); connection?.addEventListener('change', update);
    const section = root.current!;
    const image = section.querySelector<HTMLImageElement>('.arrival-room img');
    if (image?.complete && image.naturalWidth) setRoomReady(true);
    section.addEventListener('pr:video-unavailable', unavailable);
    return () => {
      reduced.removeEventListener('change', update); connection?.removeEventListener('change', update);
      section.removeEventListener('pr:video-unavailable', unavailable);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const section = root.current!, stage = section.querySelector<HTMLElement>('.arrival-stage')!;
    const hero = section.querySelector<HTMLElement>('.aerial-hero')!;
    const video = hero.querySelector<HTMLVideoElement>('video')!;
    const landing = section.querySelector<HTMLElement>('.arrival-room')!, image = landing.querySelector<HTMLImageElement>('img')!;
    const journey = section.querySelector<HTMLElement>('.sj')!, target = journey.querySelector<HTMLElement>('.sj-hero')!;
    const track = journey.querySelector<HTMLElement>('.sj-track')!;
    const copy = hero.querySelector<HTMLElement>('.aerial-hero__copy')!, footer = hero.querySelector<HTMLElement>('.aerial-hero__footer')!;
    const shade = hero.querySelector<HTMLElement>('.aerial-hero__shade')!;
    const cursor = { p: 0 };
    let box = { x: 0, y: 0, w: 1, h: 1, radius: 0, vw: 1, vh: 1 };
    let fit = { x: 0, y: 0, sx: 1, sy: 1 };
    const measure = () => {
      const r = target.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const trackX = Number(gsap.getProperty(track, 'x')) || 0;
      box = { x: r.left - s.left - trackX, y: r.top - s.top, w: r.width, h: r.height,
        radius: parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0, vw: s.width, vh: s.height };
      const mobile = matchMedia('(max-width: 760px)').matches;
      const width = mobile ? 720 : 1920, height = mobile ? 1280 : 1080;
      const cover = Math.max(s.width / width, s.height / height);
      const pos = getComputedStyle(video).objectPosition.split(' ').map(parseFloat);
      if (!baseline) {
        const scale = Math.max(s.width / 1500, s.height / 1000);
        fit = { sx: scale, sy: scale, x: (s.width - 1500 * scale) / 2, y: (s.height - 1000 * scale) / 2 };
        return;
      }
      const sx = 1.28 * (mobile ? 720 / 608 : 1) * cover;
      const sy = 1.28 * (mobile ? 1280 / 1080 : 1) * cover;
      // The final master frame is a centered 1500x843.75 crop of the actual
      // 1500x1000 photo. Preserve the portrait rendition's x=708 master crop.
      fit = { sx, sy, x: (s.width - width * cover) * pos[0] / 100 - (mobile ? 553.125 * sx : 0),
        y: (s.height - height * cover) * pos[1] / 100 - 78.125 * sy };
    };
    const draw = () => {
      const p = cursor.p, film = phase(p, 0, FILM_END);
      video.dispatchEvent(new CustomEvent('pr:hero-seek', { detail: film }));
      hero.style.setProperty('--aerial-progress', String(film));
      const text = 1 - phase(p, .14, .24);
      for (const el of [copy, footer]) { el.style.opacity = String(text); el.style.visibility = text > 0 ? '' : 'hidden'; }
      shade.style.opacity = String(1 - phase(p, .12, .24));
      const dock = gsap.parseEase('power2.inOut')(phase(p, DOCK_START, DOCK_END));
      const lerp = (a: number, b: number) => a + (b - a) * dock;
      const scale = Math.max(box.w / 1500, box.h / 1000);
      const x = lerp(fit.x, box.x + (box.w - 1500 * scale) / 2);
      const y = lerp(fit.y, box.y + (box.h - 1000 * scale) / 2);
      image.style.transform = `translate3d(${x}px,${y}px,0) scale(${lerp(fit.sx, scale)},${lerp(fit.sy, scale)})`;
      landing.style.clipPath = `inset(${box.y * dock}px ${(box.vw - box.x - box.w) * dock}px ${(box.vh - box.y - box.h) * dock}px ${box.x * dock}px round ${box.radius * dock}px)`;
      // The source shot does not document a room entry. Use a deliberate photo
      // transition, preserving the original image and its existing card handoff.
      const roomStart = baseline ? FILM_END : .68;
      const roomOpacity = baseline ? phase(p, FILM_END, .834)
        : gsap.parseEase('power2.inOut')(phase(p, roomStart, FILM_END));
      landing.style.opacity = String(roomOpacity);
      landing.style.visibility = p >= roomStart && p < DOCK_END ? 'visible' : 'hidden';
      const visible = phase(p, FILM_END, .86);
      journey.style.opacity = String(visible); journey.style.visibility = visible > 0 ? 'visible' : 'hidden';
      journey.inert = p < .965;
      section.dataset.docked = String(p >= DOCK_END);
      section.dataset.scene = p >= DOCK_END ? 'suites' : p >= FILM_END ? 'docking'
        : !baseline ? (p < roomStart ? 'aerial' : 'room-reveal')
        : film < .274 ? 'aerial' : film < .682 ? 'approach' : film < .864 ? 'curtains' : 'room';
    };
    const ctx = gsap.context(() => {
      measure();
      gsap.to(cursor, { p: 1, ease: 'none', onUpdate: draw,
        scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${arrivalDistance()}`, scrub: .3,
          invalidateOnRefresh: true, onRefresh: () => { measure(); draw(); } } });
      draw();
    }, section);
    const refresh = () => { measure(); draw(); };
    ScrollTrigger.addEventListener('refresh', refresh); ScrollTrigger.refresh(); window.dispatchEvent(new Event('pr:hero'));
    const go = (immediate: boolean) => {
      const y = section.offsetTop + arrivalDistance();
      const lenis = (window as Window & { __lenis?: { scrollTo: (y: number, options: { immediate: boolean }) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y, { immediate }); else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
    };
    const click = (event: MouseEvent) => {
      if (!(event.target as Element).closest('a[href="#suites"]') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); history.pushState(null, '', '#suites'); go(false);
    };
    const hash = () => { if (location.hash === '#suites') go(true); };
    section.addEventListener('click', click); window.addEventListener('hashchange', hash); hash();
    return () => {
      section.removeEventListener('click', click); window.removeEventListener('hashchange', hash);
      ScrollTrigger.removeEventListener('refresh', refresh); ctx.revert();
      [copy, footer, shade, landing, image, journey].forEach(el => el.removeAttribute('style'));
      journey.inert = false; delete section.dataset.docked; delete section.dataset.scene;
    };
  }, [active, baseline]);

  return (
    <section ref={root} className={'arrival' + (active ? ' hero' : '')} data-active={active ? 'true' : undefined} data-dark="1" aria-label="Arrive at Palm Regal">
      <div className="arrival-stage">
        <Hero controlled={active} mediaReady={baseline !== null && roomReady && !failed} mediaPrefix={baseline ? BASELINE_MEDIA : MEDIA} />
        <div className="arrival-room" aria-hidden="true"><img src={room.src} alt="" width={1500} height={1000} onLoad={() => setRoomReady(true)} onError={() => setFailed(true)} /></div>
        <SuiteJourney connected={active} />
      </div>
    </section>
  );
}
