'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { facilities } from '@/content/site';
import { Icon } from './Icons';
import { Todo } from './Todo';

export function Delights() {
  const [k, setK] = useState(2);
  const panel = useRef<HTMLDivElement>(null);
  const f = facilities[k];
  const pick = (i: number) => {
    if (i === k) return; setK(i);
    panel.current?.dispatchEvent(new CustomEvent('gl:src', { detail: { src: facilities[i].img || 'placeholder' }, cancelable: true }));
  };
  const imgs = Array.from(new Set(facilities.filter(x => x.img).map(x => x.img!)));
  return (
    <div className="dl">
      <div className="dl-side">
        <div className="dl-panel" ref={panel} data-gl="panel" data-src={facilities[2].img}>
          {imgs.map(src => <img key={src} src={src} alt="" loading="lazy" className={f.img === src ? 'on' : ''} />)}
          {!f.img && <div className="none">Photo to come</div>}
          {f.standIn && <span className="stand">Stand-in photo</span>}
        </div>
        <div className="dl-now" aria-live="polite"><small>{f.name}{f.tag ? `, ${f.tag}` : ''}</small><p>{f.text}</p></div>
        <Link className="tlink" href="/facilities/" style={{ justifySelf: 'start' }}>See all facilities <Icon id="i-arrow" /></Link>
      </div>
      <ul className="dl-list">
        {facilities.map((x, i) => (
          <li key={x.name}>
            <button className="dl-item" type="button" aria-pressed={i === k} onMouseEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => pick(i)}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span><b>{x.name}{x.tag && <>, <i>{x.tag}</i></>}</b><small>{x.text}</small></span>
              <span className="arrow"><Icon id="i-arrow" /></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
