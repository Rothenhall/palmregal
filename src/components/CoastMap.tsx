'use client';
/* The Odisha coast at night. Hover lights the way, choosing a place lights its road from Palm Regal,
   dims the rest and leans the map toward it. A sketch, not to scale. */
import { useRef, useState } from 'react';
import Link from 'next/link';
import { coast } from '@/content/site';
import { Icon } from './Icons';
import { Todo } from './Todo';

const COAST = 'M150 640 C 260 600, 380 540, 470 488 S 620 420, 700 372 S 860 290, 1000 214';
const home = coast.find(c => c.home)!;
const road = (x: number, y: number) => `M${home.x} ${home.y} Q ${(home.x + x) / 2 + (y < home.y ? -40 : 30)} ${(home.y + y) / 2 - 20} ${x} ${y}`;

export function CoastMap() {
  const [sel, setSel] = useState('pr');
  const [hover, setHover] = useState<string | null>(null);
  const [dive, setDive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const cur = coast.find(c => c.id === sel)!;
  const lit = hover || sel;
  const choose = (id: string) => { if (id === sel) return; setSel(id); setDive(d => d + 1); };
  /* lean toward the chosen place: small zoom with the place as origin */
  const z = cur.home ? 1 : 1.08;

  return (
    <div className={'coast' + (lit !== 'pr' ? ' has-sel' : '')} ref={stage}
      onPointerMove={e => { const r = stage.current!.getBoundingClientRect(); stage.current!.style.setProperty('--sx', `${e.clientX - r.left}px`); stage.current!.style.setProperty('--sy', `${e.clientY - r.top}px`); stage.current!.dataset.pointer = '1'; }}
      onPointerLeave={() => { delete stage.current!.dataset.pointer; setHover(null); }}>
      <div className="coast-zoom" data-dive={dive % 2 ? 'a' : dive ? 'b' : undefined} style={{ transform: `scale(${z})`, transformOrigin: `${cur.x / 10}% ${cur.y / 6.4}%` }}>
        <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Sketch map of the coast around Gopalpur: Palm Regal by the sea, Gopalpur beach 5 minutes' walk, Berhampur 14 km, Tara Tarini 35 km, Chilika Lake 46 km, Sonpur 41 km, Jirang 113 km">
          <defs>
            <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#15404d" /><stop offset="1" stopColor="#0a1f26" /></linearGradient>
            <radialGradient id="halo"><stop offset="0" stopColor="#b4e4e4" stopOpacity=".55" /><stop offset="1" stopColor="#b4e4e4" stopOpacity="0" /></radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
            <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(238,245,242,.07)" /></pattern>
          </defs>
          <rect width="1000" height="640" fill="#0c252c" />
          <rect width="1000" height="640" fill="url(#dots)" />
          <path d={`${COAST} L1000 640 Z`} fill="url(#sea)" />
          <g className="coast-ripples">{[0, 1, 2, 3].map(i => <path key={i} d={COAST} transform={`translate(${12 + i * 16} ${18 + i * 22})`} />)}</g>
          <ellipse cx="830" cy="232" rx="70" ry="30" className="lagoon" transform="rotate(-24 830 232)" />
          <path d={COAST} className="shore-glow" filter="url(#glow)" />
          <path d={COAST} className="shore" />
          <g className="roads">
            {coast.filter(c => !c.home && c.id !== 'beach').map(c => (
              <g key={c.id} className={lit === c.id ? 'on' : ''}><path d={road(c.x, c.y)} className="road" /><path d={road(c.x, c.y)} className="flow" /></g>
            ))}
          </g>
          <text className="bay" x="400" y="618">Bay of Bengal</text>
          <circle cx={home.x} cy={home.y} r="70" fill="url(#halo)" className="home-halo" />
        </svg>
        <div className="pins">
          {coast.map(c => (
            <button key={c.id} type="button" className={'pin' + (c.home ? ' home' : '') + (sel === c.id ? ' on' : '') + (lit === c.id ? ' lit' : '')}
              style={{ left: `${c.x / 10}%`, top: `${c.y / 6.4}%` }}
              onClick={() => choose(c.id)} onPointerEnter={() => setHover(c.id)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(c.id)} onBlur={() => setHover(null)}
              aria-pressed={sel === c.id}>
              <i /><span>{c.far ? '← ' : ''}{c.name}</span>
            </button>
          ))}
        </div>
      </div>
      <span className="coast-spot" aria-hidden="true" />
      <div className="coast-card" aria-live="polite">
        <div key={cur.id} className="coast-card-in">
          <small>{cur.home ? 'You are here' : 'From Palm Regal'}</small>
          <b>{cur.name}</b>
          <span>{cur.detail}{cur.todo && <Todo>Confirm</Todo>}</span>
        </div>
        <Link className="tlink" href="/location/">Directions and day trips <Icon id="i-arrow" /></Link>
      </div>
      <p className="coast-hint">Sketch, not to scale · choose a place</p>
    </div>
  );
}
