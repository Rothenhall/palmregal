'use client';
/* The coast around Palm Regal, drawn from real geography (Natural Earth): the Bay of Bengal,
   Chilika Lake, the Odisha and Andhra Pradesh border and NH 16. Places are listed beside the map;
   hovering previews a place, choosing it draws the way from Palm Regal and leans the map toward it. */
import { useRef, useState } from 'react';
import Link from 'next/link';
import geo from '@/content/coastGeo.json';
import { coast } from '@/content/site';
import { Icon } from './Icons';
import { Todo } from './Todo';
import { DRAFT } from '@/lib/book';

type P = [number, number];
const pts = geo.points as unknown as Record<string, P>;
const home = pts.pr;
const W = geo.W, H = geo.H;
const places = coast.filter(c => !c.home && (DRAFT || !c.todo || c.id === 'sonpur'));
const arc = (to: P) => {
  const [x0, y0] = home, [x1, y1] = to, mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const bend = Math.min(90, len * .28);
  return { d: `M${x0} ${y0} Q${mx - dy / len * bend} ${my + dx / len * bend - bend * .2} ${x1} ${y1}`, mid: [mx - dy / len * bend * .5, my + dx / len * bend * .5 - bend * .1] as P };
};
const dist = (s: string) => s.split('·')[0].trim();

export function CoastMap() {
  const [sel, setSel] = useState('pr');
  const [hover, setHover] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lit = hover || sel;
  const cur = coast.find(c => c.id === sel)!;
  const litPlace = coast.find(c => c.id === lit)!;
  const a = lit !== 'pr' && lit !== 'beach' && pts[lit] ? arc(pts[lit]) : null;
  const focus = pts[sel] || home;
  const lean = sel === 'pr' || sel === 'beach' ? 1 : 1.07;

  return (
    <div className="cmap">
      <div className="cmap-stage" ref={stage}
        onPointerMove={e => { const r = stage.current!.getBoundingClientRect(); stage.current!.style.setProperty('--sx', `${e.clientX - r.left}px`); stage.current!.style.setProperty('--sy', `${e.clientY - r.top}px`); stage.current!.dataset.pointer = '1'; }}
        onPointerLeave={() => { delete stage.current!.dataset.pointer; }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img"
          aria-label="Map of the coast around Gopalpur: Palm Regal by the Bay of Bengal, with Berhampur, Tara Tarini Temple, Chilika Lake, Sonapur beach and Jirang Monastery">
          <defs>
            <linearGradient id="cm-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#17485a" /><stop offset="1" stopColor="#0a1e25" /></linearGradient>
            <pattern id="cm-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".9" fill="rgba(238,245,242,.06)" /></pattern>
            <clipPath id="cm-seaclip"><path d={`M-40 -40H${W + 40}V${H + 40}H-40Z${geo.land}`} clipRule="evenodd" /></clipPath>
            <clipPath id="cm-open"><path d={geo.openSea} /></clipPath>
            <filter id="cm-glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5" /></filter>
            <radialGradient id="cm-halo"><stop offset="0" stopColor="#b4e4e4" stopOpacity=".5" /><stop offset="1" stopColor="#b4e4e4" stopOpacity="0" /></radialGradient>
          </defs>
          <g className="cmap-lean" style={{ transform: `scale(${lean})`, transformOrigin: `${focus[0]}px ${focus[1]}px` }}>
            <rect x="-40" y="-40" width={W + 80} height={H + 80} fill="url(#cm-sea)" />
            {/* depth lines in the bay, following the shore */}
            <g clipPath="url(#cm-seaclip)"><g clipPath="url(#cm-open)" className="cm-depth">
              {[1, 2, 3, 4, 5, 6, 7].map(i => <path key={i} d={geo.coast} transform={`translate(${i * 9} ${i * 13})`} style={{ opacity: .5 - i * .055 }} />)}
            </g></g>
            <path d={geo.land} className="cm-land" />
            <path d={geo.land} fill="url(#cm-dots)" />
            <path d={geo.border} className="cm-border" />
            <path d={geo.roads} className="cm-road" /><path d={geo.roads} className="cm-road-flow" />
            <path d={geo.coast} className="cm-coast-glow" filter="url(#cm-glow)" />
            <path d={geo.coast} className="cm-coast" />
            <text className="cm-region" x={geo.labels.odisha[0]} y={geo.labels.odisha[1]}>ODISHA</text>
            <text className="cm-region" x={geo.labels.andhra[0]} y={geo.labels.andhra[1]}>ANDHRA PRADESH</text>
            <text className="cm-sea-label" x={geo.labels.bay[0]} y={geo.labels.bay[1]}>Bay of Bengal</text>
            <text className="cm-lake" x={geo.labels.chilika[0]} y={geo.labels.chilika[1]}>Chilika</text>
            <g className="cm-shield" transform={`translate(${geo.labels.nh[0]} ${geo.labels.nh[1]})`}><rect x="-22" y="-10" width="44" height="20" rx="5" /><text y="4">NH 16</text></g>
            {a && <g key={lit} className="cm-arc"><path d={a.d} /><path d={a.d} className="flow" />
              <g transform={`translate(${a.mid[0]} ${a.mid[1]})`} className="cm-dist"><rect x="-38" y="-13" width="76" height="26" rx="13" /><text y="4.5">{dist(litPlace.detail)}</text></g></g>}
            <circle cx={home[0]} cy={home[1]} r="64" fill="url(#cm-halo)" className="cm-home-halo" />
          </g>
        </svg>
        <div className="cmap-pins" style={{ transform: `scale(${lean})`, transformOrigin: `${focus[0] / W * 100}% ${focus[1] / H * 100}%` }}>
          {coast.filter(c => pts[c.id] && c.id !== 'beach' && (c.home || places.includes(c))).map(c => (
            <button key={c.id} type="button" className={'cpin' + (c.home ? ' home' : '') + (lit === c.id ? ' lit' : '') + (sel === c.id ? ' on' : '')}
              style={{ left: `${pts[c.id][0] / W * 100}%`, top: `${pts[c.id][1] / H * 100}%` }}
              onClick={() => setSel(c.id)} onPointerEnter={() => setHover(c.id)} onPointerLeave={() => setHover(null)}
              aria-pressed={sel === c.id} aria-label={c.name}>
              <span className="cpin-tag">{c.name}</span>
              <i>{c.home && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" fill="currentColor" /></svg>}</i>
            </button>
          ))}
        </div>
        <span className="cmap-spot" aria-hidden="true" />
        <p className="cmap-hint">Choose a place to see the way from Palm Regal</p>
      </div>

      <aside className="cmap-list" aria-label="Places near Palm Regal">
        <div className="cmap-cur" aria-live="polite" key={cur.id}>
          <small>{cur.home ? 'You are here' : 'From Palm Regal'}</small>
          <b>{cur.name}</b>
          <span>{cur.detail}{cur.todo && <Todo>Confirm</Todo>}</span>
        </div>
        <ul>
          {places.map(c => (
            <li key={c.id}>
              <button type="button" aria-pressed={sel === c.id} className={lit === c.id ? 'lit' : ''}
                onClick={() => setSel(sel === c.id ? 'pr' : c.id)} onPointerEnter={() => setHover(c.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(c.id)} onBlur={() => setHover(null)}>
                <span>{c.name}</span><em className="num">{dist(c.detail)}</em>
              </button>
            </li>
          ))}
        </ul>
        <Link className="tlink" href="/location/">Directions and day trips <Icon id="i-arrow" /></Link>
      </aside>
    </div>
  );
}
