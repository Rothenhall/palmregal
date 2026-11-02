'use client';
/* A day at Palm Regal as a held journey: one step per scroll, a large outline number, the words
   changing in place beside an arch where each real photo is revealed over the last. A clear start
   and end (four steps); text switches quickly so nobody waits on it. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { day } from '@/content/site';
import { hasMotion } from '@/lib/env';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

export function DayJourney() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => { if (hasMotion()) setHeld(true); }, []);
  useEffect(() => {
    if (!held) return;
    const st = ScrollTrigger.create({
      trigger: root.current!, start: 'top top', end: 'bottom bottom',
      onUpdate: self => { const n = Math.min(day.length - 1, Math.floor(self.progress * day.length * .999)); setI(c => (c === n ? c : n)); },
    });
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [held]);

  const total = String(day.length).padStart(2, '0');
  return (
    <section ref={root} id="gallery" className={'djourney' + (held ? ' held' : '')} data-bg="night" aria-labelledby="day-h">
      <div className="dj-stick wrap">
        <div className="dj-left">
          <p className="eyebrow" id="day-h">A day at Palm Regal</p>
          <div className="dj-num" aria-hidden="true"><span key={i}>{String(i + 1).padStart(2, '0')}</span><b>/{total}</b></div>
          <div className="dj-steps">
            {day.map((d, n) => (
              <article key={d.time} className={'dj-step' + (n === i ? ' on' : '')} aria-hidden={held && n !== i ? true : undefined}>
                <time>{d.time}</time>
                <h3>{d.title}<br /><em>{d.em}</em></h3>
                <p>{d.text}</p>
                <div className="dj-mobile-img"><img src={d.img} alt="" loading="lazy" /></div>
              </article>
            ))}
          </div>
          <div className="dj-foot">
            <div className="dj-dots" aria-hidden="true">{day.map((d, n) => <i key={d.time} className={n === i ? 'on' : ''} />)}</div>
            <Link className="tlink" href="/gallery/">Full gallery <Icon id="i-arrow" /></Link>
          </div>
        </div>
        <div className="dj-right" aria-hidden="true">
          <div className="dj-arch">
            {day.map((d, n) => <img key={d.time} src={d.img} alt="" loading="lazy" className={n <= i ? 'on' : ''} style={{ zIndex: n + 1 }} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
