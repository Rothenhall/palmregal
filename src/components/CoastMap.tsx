'use client';
/* The coast around Palm Regal, as a short guided tour drawn from real geography (Natural Earth):
   the Bay of Bengal, Chilika Lake, the Odisha and Andhra Pradesh border and NH 16.

   The section holds while the scroll travels, nearest first: the whole coast, then Palm Regal and
   its beach up close, then each place in turn. Between stops the camera pulls back a little, glides
   across and settles on the next place, with the way from Palm Regal drawn in. Three layers move at
   different rates (the sea grid behind, the land, a thin haze in front), so the flight has depth.

   Labels and pins are HTML laid over the map, so they stay the same readable size at every zoom.
   The coast reads as a shore (a band of shallow water and a strip of sand), not as a line, so the
   only bright line on the map is the way to the place you are looking at.

   Choosing a pin or a stop in the list jumps the scroll to that stop. Without motion, or before
   the scroll is wired, it is a plain map you click through. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import geo from '@/content/coastGeo.json';
import { coast } from '@/content/site';
import { hasMotion } from '@/lib/env';
import { DRAFT } from '@/lib/book';
import { Todo } from './Todo';

gsap.registerPlugin(ScrollTrigger);

type P = [number, number];
type Cam = { x: number; y: number; w: number };
type Kind = 'home' | 'beach' | 'city' | 'temple' | 'lake' | 'monastery' | 'coast';

const pts = geo.points as unknown as Record<string, P>;
const labels = geo.labels as unknown as Record<string, P>;
const W = geo.W, H = geo.H;
const HOME = pts.pr;

const KIND: Record<string, Kind> = { pr: 'home', beach: 'beach', bam: 'city', tt: 'temple', chilika: 'lake', sonpur: 'beach', jirang: 'monastery' };
const pad = (n: number) => String(n).padStart(2, '0');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* The stops, nearest first. Each frames the points it names; the camera never zooms closer than minW. */
type Stop = { id: string; kind: Kind; name: string; short: string; eyebrow: string; text: string; chip?: string; to?: string; walk?: boolean; frame: string[]; minW: number; todo?: boolean };
const places = coast
  .filter(c => !c.home && c.id !== 'beach' && pts[c.id] && (DRAFT || !c.todo || c.id === 'sonpur'))
  .sort((a, b) => parseFloat(a.detail) - parseFloat(b.detail));
const STOPS: Stop[] = [
  { id: 'all', kind: 'coast', name: 'Gopalpur on Sea', short: 'The coast', eyebrow: 'South Odisha, on the Bay of Bengal', text: '', frame: ['pr', ...places.map(p => p.id)], minW: 620 },
  { id: 'pr', kind: 'home', name: 'Palm Regal', short: 'Palm Regal', eyebrow: 'You are here', text: 'Your suite, among palms and lawns. Gopalpur beach is five minutes away on foot.', to: 'beach', walk: true, frame: ['pr', 'beach'], minW: 85 },
  ...places.map(c => {
    const [km, ...rest] = c.detail.split('·').map(s => s.trim());
    return { id: c.id, kind: KIND[c.id] || 'city', name: c.name, short: c.name.replace(/ (Temple|Monastery|Blue Flag Beach)$/, ''), eyebrow: `${km} from Palm Regal`, text: rest.length ? cap(rest.join(', ')) + '.' : '', chip: km, to: c.id, frame: ['pr', c.id], minW: 300, todo: c.todo };
  }),
];
const N = STOPS.length;

/* frame a set of points for a stage of the given aspect (width / height), kept inside the map */
function frame(s: Stop, aspect: number): Cam {
  const xs = s.frame.map(id => pts[id][0]), ys = s.frame.map(id => pts[id][1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const maxW = Math.min(W, H * aspect);
  const pad = s.minW * .45;
  const w = Math.min(maxW, Math.max(s.minW, (x1 - x0) * 1.5 + pad, ((y1 - y0) * 1.5 + pad) * aspect));
  return clamp({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, w }, aspect);
}
function clamp(c: Cam, aspect: number): Cam {
  const h = c.w / aspect;
  const x = c.w >= W ? W / 2 : Math.min(W - c.w / 2, Math.max(c.w / 2, c.x));
  const y = h >= H ? H / 2 : Math.min(H - h / 2, Math.max(h / 2, c.y));
  return { x, y, w: c.w };
}

/* the way from Palm Regal: a gentle curve, bowed away from the coast */
const way = (to: P, walk?: boolean) => {
  const [x0, y0] = HOME, [x1, y1] = to, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const bend = walk ? len * .35 : Math.min(80, len * .24);
  const cx = (x0 + x1) / 2 - dy / len * bend, cy = (y0 + y1) / 2 + dx / len * bend;
  return { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, mid: [(x0 + 2 * cx + x1) / 4, (y0 + 2 * cy + y1) / 4] as P };
};
const REGIONS: { id: string; text: string; cls: string; at: P }[] = [
  { id: 'bay', text: 'Bay of Bengal', cls: 'sea', at: labels.bay },
  { id: 'odisha', text: 'Odisha', cls: 'region', at: labels.odisha },
  { id: 'andhra', text: 'Andhra Pradesh', cls: 'region', at: labels.andhra },
  { id: 'chilika', text: 'Chilika', cls: 'lake', at: labels.chilika },
  { id: 'nh', text: 'NH 16', cls: 'shield', at: labels.nh },
];
const PINS = ['pr', 'beach', ...places.map(p => p.id)];
const pinName = (id: string) => (id === 'pr' ? 'Palm Regal' : coast.find(c => c.id === id)!.name);
const pinStop = (id: string) => Math.max(1, STOPS.findIndex(s => s.id === id));

export function CoastMap({ immersive = false, headingAs = 'h1', headingId = 'location-title' }: {
  immersive?: boolean; headingAs?: 'h1' | 'h2'; headingId?: string;
}) {
  const MapHeading = headingAs;
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const haze = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const dots = useRef<SVGPathElement>(null);
  const wayLine = useRef<SVGPathElement>(null);
  const wayDot = useRef<SVGPathElement>(null);
  const pinEls = useRef<Record<string, HTMLElement | null>>({});
  const regEls = useRef<Record<string, HTMLElement | null>>({});
  const trig = useRef<ScrollTrigger | null>(null);
  const cam = useRef<Cam | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [moving, setMoving] = useState(true);
  const stop = STOPS[i];
  const route = stop.to ? way(pts[stop.to], stop.walk) : null;

  useEffect(() => { setMoving(hasMotion()); if (hasMotion()) setHeld(true); }, []);

  // Fit destinations into the visible map between the page title and controls.
  // The map itself remains full bleed; only the camera's usable area is inset.
  const destinationFrame = (s: Stop, sw: number, sh: number): Cam => {
    if (!immersive) return frame(s, sw / sh);
    const compact = sw <= 900;
    const left = compact ? 28 : Math.min(sw * .06, 88);
    const right = compact ? 28 : 420;
    const top = compact ? 175 : 195;
    const bottom = compact ? 330 : 100;
    const usableW = Math.max(180, sw - left - right);
    const usableH = Math.max(160, sh - top - bottom);
    const xs = s.frame.map(id => pts[id][0]), ys = s.frame.map(id => pts[id][1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const padding = s.minW * .22;
    const w = Math.max(s.minW, (x1 - x0 + padding) * sw / usableW, (y1 - y0 + padding) * sw / usableH);
    return { x: (x0 + x1) / 2 + (right - left) * w / sw / 2,
      y: (y0 + y1) / 2 + (bottom - top) * w / sw / 2, w };
  };

  /* draw every layer for a camera; `fly` (0 to 1) is how far into a flight we are, for the haze */
  const draw = (c: Cam, fly = 0) => {
    const { w: sw, h: sh } = size.current;
    if (!sw || !sh) return;
    cam.current = c;
    const h = c.w * sh / sw, s = sw / c.w, vx = c.x - c.w / 2, vy = c.y - h / 2;
    svg.current?.setAttribute('viewBox', `${vx} ${vy} ${c.w} ${h}`);
    /* one screen pixel in map units, so the way keeps the same weight at every zoom */
    svg.current?.style.setProperty('--u', (1 / s).toFixed(4));
    const at = (p: P) => `translate3d(${((p[0] - vx) * s).toFixed(1)}px, ${((p[1] - vy) * s).toFixed(1)}px, 0)`;
    /* a label near the right edge sits to the left of its pin, so it is never cut off */
    for (const id of PINS) {
      const el = pinEls.current[id]; if (!el) continue;
      el.style.transform = at(pts[id]);
      const labelEdge = immersive ? (sw <= 900 ? sw - 130 : sw - 520) : sw * .7;
      el.dataset.flip = id !== 'beach' && (pts[id][0] - vx) * s > labelEdge ? '1' : '0';
      if (immersive) {
        const x = (pts[id][0] - vx) * s, y = (pts[id][1] - vy) * s;
        const underHeading = x < (sw <= 900 ? sw : Math.min(sw * .45, 480) + 110) && y < (sw <= 900 ? 215 : 355);
        const obscured = underHeading && !STOPS[iRef.current].frame.includes(id);
        el.style.visibility = obscured ? 'hidden' : '';
        el.inert = obscured || x < 12 || x > sw - 12 || y < 12 || y > sh - 12
          || (id === 'beach' && Math.hypot(pts.beach[0] - HOME[0], pts.beach[1] - HOME[1]) * s <= 36);
      }
    }
    const wide = Math.min(1, Math.max(0, (c.w - 420) / 260));
    for (const r of REGIONS) {
      const el = regEls.current[r.id]; if (!el) continue;
      el.style.transform = at(r.at);
      const x = (r.at[0] - vx) * s, y = (r.at[1] - vy) * s;
      const edge = r.cls === 'sea' ? 130 : 65;
      const obscured = immersive && (x < edge || x > sw - edge || y < 80 || y > sh - 80
        || (sw <= 900 ? y > sh - 335 || y < 215
          : (x > sw - 440 && y > 200) || (x < 600 && y < 355)));
      el.style.opacity = String(obscured ? 0 : r.cls === 'sea' ? .4 + wide * .6 : wide);
    }
    /* the beach shows once it has room to sit apart from the resort */
    stage.current!.dataset.near = Math.hypot(pts.beach[0] - HOME[0], pts.beach[1] - HOME[1]) * s > 36 ? '1' : '0';
    /* the land texture thins as the camera comes close, so it never turns into big spots */
    if (dots.current) dots.current.style.opacity = String(Math.min(1, Math.max(.2, (c.w - 100) / 420)));
    const mid = chip.current?.dataset.mid;
    if (mid && chip.current) { const [mx, my] = mid.split(',').map(Number); chip.current.style.transform = at([mx, my]); }
    /* parallax: the sea grid behind moves at about half the rate of the land, the haze in front faster */
    if (back.current) {
      const bw = W * Math.pow(c.w / W, .55), bs = sw / bw;
      const bx = W / 2 + (c.x - W / 2) * .55, by = H / 2 + (c.y - H / 2) * .55;
      const cell = 60 * bs;
      back.current.style.backgroundSize = `${cell}px ${cell}px`;
      back.current.style.backgroundPosition = `${(-(bx - bw / 2) * bs).toFixed(1)}px ${(-(by - bw * sh / sw / 2) * bs).toFixed(1)}px`;
    }
    if (haze.current) {
      const k = sw / W * 1.7;
      haze.current.style.transform = `translate3d(${(-(c.x - W / 2) * k).toFixed(1)}px, ${(-(c.y - H / 2) * k).toFixed(1)}px, 0) scale(${(1 + (W / c.w - 1) * .08).toFixed(3)})`;
      haze.current.style.opacity = String(.25 + fly * .55);
    }
  };

  /* fly from wherever the camera is to a stop: ease across, easing out of and back into the zoom */
  const flyTo = (n: number, instant = false) => {
    const { w: sw, h: sh } = size.current;
    if (!sw || !sh) return;
    const aspect = sw / sh, to = destinationFrame(STOPS[n], sw, sh), from = cam.current;
    tween.current?.kill();
    if (instant || !from || !hasMotion()) { draw(to); return; }
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const dip = Math.min(.7, dist / Math.max(from.w, to.w) * .55);
    const lw0 = Math.log(from.w), lw1 = Math.log(to.w), maxW = immersive ? Math.max(W * 1.7, from.w, to.w) : Math.min(W, H * aspect);
    const o = { t: 0 };
    tween.current = gsap.to(o, {
      t: 1, duration: 1.8 + dip * 1.3, ease: 'none',
      onUpdate: () => {
        const t = o.t, e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, arc = Math.sin(Math.PI * t);
        const w = Math.min(maxW, Math.exp(lw0 + (lw1 - lw0) * e) * (1 + dip * arc));
        const next = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w };
        draw(immersive ? next : clamp(next, aspect), arc * Math.min(1, dip * 2.2));
      },
    });
  };

  /* keep the camera framed to the stage's size */
  const iRef = useRef(0);
  useLayoutEffect(() => {
    const el = stage.current!;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      size.current = { w: r.width, h: r.height };
      flyTo(iRef.current, true);
    });
    ro.observe(el);
    return () => { ro.disconnect(); tween.current?.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* a new stop: place its distance chip at the current camera, then fly there */
  useEffect(() => {
    if (cam.current) draw(cam.current);
    if (iRef.current !== i) { iRef.current = i; flyTo(i); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  /* draw the way in, measured from the path itself so it always reaches the place
     (a pathLength-based dash is not drawn to the end by every browser) */
  useLayoutEffect(() => {
    const line = wayLine.current, dot = wayDot.current;
    if (!line || stop.walk) return;
    const L = line.getTotalLength();
    line.style.strokeDasharray = `${L}px ${L}px`;
    /* the line rests fully drawn; the animation only covers the draw-in, so it can never stop short */
    line.style.strokeDashoffset = '0px';
    if (!hasMotion()) return;
    const draw = line.animate([{ strokeDashoffset: `${L}px` }, { strokeDashoffset: '0px' }], { duration: 1300, delay: 550, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
    let travel: Animation | undefined;
    if (dot) {
      dot.style.strokeDasharray = `0px ${L * 2}px`;
      travel = dot.animate([
        { strokeDashoffset: '0px', opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .88 }, { strokeDashoffset: `${-L}px`, opacity: 0 },
      ], { duration: 2800, delay: 1900, iterations: Infinity });
    }
    return () => { draw.cancel(); travel?.cancel(); };
  }, [i, stop.walk]);

  /* the scroll walks the stops; measured once the section has its scrolling height */
  useEffect(() => {
    if (!held) return;
    const st = ScrollTrigger.create({
      trigger: root.current!, start: () => (immersive && document.documentElement.classList.contains('dsun-exit') ? `top+=${innerHeight} top` : 'top top'), end: 'bottom bottom',
      onUpdate: self => { const n = Math.min(N - 1, Math.floor(self.progress * N * .999)); setI(c => (c === n ? c : n)); },
    });
    trig.current = st;
    ScrollTrigger.refresh();
    return () => { st.kill(); trig.current = null; };
  }, [held]);

  /* choosing a stop scrolls to the middle of its stretch, so the tour stays in step with the page */
  const pick = (n: number) => {
    const st = trig.current;
    if (!st) { setI(n); return; }
    const y = st.start + ((n + .5) / N) * (st.end - st.start);
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(y, { lerp: .1 }); else window.scrollTo({ top: y, behavior: moving ? 'smooth' : 'auto' });
  };

  const overview = held
    ? `Scroll to travel from the resort to ${places.length} places nearby, nearest first.`
    : `Choose a place to see the way from the resort. ${places.length} places nearby, nearest first.`;

  return (
    <div ref={root} className={'ctour' + (held ? ' held' : '') + (immersive ? ' ctour--immersive' : '')} style={{ '--n': N } as React.CSSProperties} data-stop={stop.id}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="ck-home" viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" fill="currentColor" /></symbol>
          <symbol id="ck-beach" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="16" cy="7.5" r="2.6" /><path d="M3 14.5c2.2 0 2.2-1.6 4.5-1.6s2.3 1.6 4.5 1.6 2.3-1.6 4.5-1.6 2.3 1.6 4.5 1.6M3 19c2.2 0 2.2-1.6 4.5-1.6S9.8 19 12 19s2.3-1.6 4.5-1.6S18.8 19 21 19" /></g></symbol>
          <symbol id="ck-city" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3.5" width="12" height="13" rx="3" /><path d="M6 10h12M9 20l1.5-3.5M15 20l-1.5-3.5" /></g><circle cx="9.3" cy="13.4" r="1.1" fill="currentColor" /><circle cx="14.7" cy="13.4" r="1.1" fill="currentColor" /></symbol>
          <symbol id="ck-temple" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.8v2.4M8.6 10.5C8.6 7.6 10.2 5.2 12 5.2s3.4 2.4 3.4 5.3L17 19H7zM4.5 20.5h15M10.6 19v-3.2h2.8V19" /></g></symbol>
          <symbol id="ck-lake" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9.5c1.6-1.8 3.3-1.8 4.5 0 1.2-1.8 2.9-1.8 4.5 0M12.5 5.8c1-1.1 2-1.1 2.8 0 .8-1.1 1.8-1.1 2.8 0" /><path d="M3 16c2.2 0 2.2-1.6 4.5-1.6S9.8 16 12 16s2.3-1.6 4.5-1.6S18.8 16 21 16M5 20h14" /></g></symbol>
          <symbol id="ck-monastery" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.8v3M9.4 8.6a2.6 2.6 0 0 1 5.2 0M6.5 13c0-2.4 2.5-4.4 5.5-4.4s5.5 2 5.5 4.4zM6 13h12v3.2H6zM4 20.5h16M8 16.2v4.3M16 16.2v4.3" /></g></symbol>
          <symbol id="ck-coast" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M14.8 9.2 13 13l-3.8 1.8L11 11z" /></g></symbol>
        </defs>
      </svg>

      <div className="ctour-stick">
        <div className="ctour-grid">
          {immersive && <header className="ctour-heading">
            <p className="eyebrow">Location · Gopalpur on Sea</p>
            <MapHeading className="ctour-title" id={headingId}>Gopalpur, and<br /><em>all around it.</em></MapHeading>
            <p className="ctour-heading-copy">A short walk to the sea. A little further to discover Odisha.</p>
          </header>}
          <div className="ctour-stage" ref={stage} data-near="0">
            <div className="ctour-back" ref={back} aria-hidden="true" />
            <svg ref={svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img"
              aria-label="Map of the coast around Gopalpur: Palm Regal by the Bay of Bengal, with Berhampur, Tara Tarini Temple, Chilika Lake, Sonpur beach and Jirang Monastery">
              <defs>
                <clipPath id="ct-sea"><path d={`M-400 -400H${W + 400}V${H + 400}H-400Z${geo.land}`} clipRule="evenodd" /></clipPath>
                <clipPath id="ct-land"><path d={geo.land} /></clipPath>
                <clipPath id="ct-open"><path d={geo.openSea} /></clipPath>
                <pattern id="ct-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".8" fill="rgba(238,245,242,.07)" /></pattern>
                <linearGradient id="ct-landfill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#173a42" /><stop offset="1" stopColor="#11303a" /></linearGradient>
                {/* Blend the regional dataset's extent into the page rather than
                    exposing its rectangular crop in the full-screen overview. */}
                {immersive && <>
                  <linearGradient id="ct-extent-x"><stop stopColor="white" stopOpacity="0" /><stop offset=".07" stopColor="white" /><stop offset=".93" stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient>
                  <linearGradient id="ct-extent-y" x1="0" y1="0" x2="0" y2="1"><stop stopColor="white" stopOpacity="0" /><stop offset=".09" stopColor="white" /><stop offset=".9" stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient>
                  <mask id="ct-extent-horizontal" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}><rect width={W} height={H} fill="url(#ct-extent-x)" /></mask>
                  <mask id="ct-extent" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}><rect width={W} height={H} fill="url(#ct-extent-y)" mask="url(#ct-extent-horizontal)" /></mask>
                </>}
              </defs>
              <g mask={immersive ? 'url(#ct-extent)' : undefined}>
              {/* the shore: shallow water fading out from the land, and soundings further out */}
              <g clipPath="url(#ct-sea)">
                <path d={geo.coast} className="ct-shallow-1" vectorEffect="non-scaling-stroke" />
                <path d={geo.coast} className="ct-shallow-2" vectorEffect="non-scaling-stroke" /><path d={geo.coast} className="ct-shallow-3" vectorEffect="non-scaling-stroke" />
                <g clipPath="url(#ct-open)" className="ct-depth">
                  {[1, 2, 3].map(k => <path key={k} d={geo.coast} transform={`translate(${k * 12} ${k * 18})`} vectorEffect="non-scaling-stroke" style={{ opacity: .34 - k * .08 }} />)}
                </g>
              </g>
              <path d={geo.land} fill="url(#ct-landfill)" />
              <path d={geo.land} fill="url(#ct-dots)" ref={dots} />
              {/* a strip of sand along the land's edge */}
              <g clipPath="url(#ct-land)"><path d={geo.coast} className="ct-sand" vectorEffect="non-scaling-stroke" /></g>
              <path d={geo.land} className="ct-edge" vectorEffect="non-scaling-stroke" />
              <path d={geo.border} className="ct-border" vectorEffect="non-scaling-stroke" />
              <path d={geo.roads} className="ct-road-case" vectorEffect="non-scaling-stroke" />
              <path d={geo.roads} className="ct-road" vectorEffect="non-scaling-stroke" />
              {route && (
                <g key={stop.id} className={'ct-way' + (stop.walk ? ' walk' : '')}>
                  <path d={route.d} className="ct-way-line" ref={wayLine} />
                  <path d={route.d} className="ct-way-dot" ref={wayDot} />
                </g>
              )}
              </g>
            </svg>

            <div className="ctour-labels" aria-hidden="true">
              {REGIONS.map(r => <span key={r.id} ref={el => { regEls.current[r.id] = el; }} className={'ct-label ' + r.cls}><span>{r.text}</span></span>)}
            </div>

            {route && stop.chip && <span ref={chip} key={stop.id} className="ctour-chip num" data-mid={route.mid.join(',')} aria-hidden="true"><span>{stop.chip}</span></span>}

            <div className="ctour-pins">
              {PINS.map(id => {
                const n = id === 'beach' ? 1 : pinStop(id), on = stop.id === id || (stop.id === 'pr' && id === 'beach'), kind = KIND[id] || 'city';
                const s = STOPS[n];
                return (
                  <button key={id} ref={el => { pinEls.current[id] = el; }} type="button"
                    className={'cpin k-' + kind + (on ? ' on' : '') + (id === 'pr' ? ' home' : '') + (id === 'beach' ? ' near' : '')}
                    onClick={() => pick(n)} aria-label={`${pinName(id)}${s.chip && id !== 'beach' && id !== 'pr' ? `, ${s.chip} from Palm Regal` : ''}`}
                    aria-current={on ? 'location' : undefined}>
                    <i><svg aria-hidden="true"><use href={`#ck-${kind}`} /></svg></i>
                    <span className="cpin-tag"><b>{pinName(id)}</b>{id !== 'pr' && id !== 'beach' && <small className="num">{s.chip}</small>}{id === 'beach' && <small>5 min walk</small>}</span>
                  </button>
                );
              })}
            </div>

            <div className="ctour-haze" ref={haze} aria-hidden="true"><i /><i /><i /></div>
            <span className="ctour-legend" aria-hidden="true"><i className="l-way" />The way from Palm Regal<i className="l-road" />NH 16<i className="l-border" />State border</span>
          </div>

          <aside className="ctour-panel" aria-label="Places near Palm Regal">
            <div className="ctour-count num" aria-hidden="true"><span key={i}>{pad(i + 1)}</span><b>/ {pad(N)}</b><em><i style={{ transform: `scaleX(${(i + 1) / N})` }} /></em></div>
            <div className="ctour-cards" aria-live={held ? undefined : 'polite'}>
              {STOPS.map((s, n) => (
                <article key={s.id} className={'ctour-card' + (n === i ? ' on' : '')} aria-hidden={n !== i ? true : undefined}>
                  <p className="ctour-eyebrow">{s.eyebrow}</p>
                  <h3>{s.name}</h3>
                  <p>{s.id === 'all' ? overview : s.text}{s.todo && <Todo>Confirm</Todo>}</p>
                </article>
              ))}
            </div>
            <ol className="ctour-rail" data-lenis-prevent>
              {STOPS.map((s, n) => (
                <li key={s.id}>
                  <button type="button" onClick={() => pick(n)} aria-current={n === i ? 'step' : undefined} className={n < i ? 'past' : ''} aria-label={s.name}>
                    <i><svg aria-hidden="true"><use href={`#ck-${s.kind}`} /></svg></i>
                    <span>{s.short}</span>
                    {s.chip && s.id !== 'pr' && <em className="num">{s.chip}</em>}
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </div>
  );
}
