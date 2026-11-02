'use client';
import { useEffect, useRef, useState } from 'react';
import { day } from '@/content/site';

export function DayStory() {
  const [i, setI] = useState(0);
  const vis = useRef<HTMLDivElement>(null);
  const steps = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; const n = +(en.target as HTMLElement).dataset.i!;
      setI(n); vis.current?.dispatchEvent(new CustomEvent('gl:src', { detail: { src: day[n].img }, cancelable: true }));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.current.forEach(s => s && io.observe(s));
    return () => io.disconnect();
  }, []);
  return (
    <div className="day">
      <div>
        {day.map((d, n) => (
          <article key={d.time} className={'step' + (n === i ? ' on' : '')} data-i={n} ref={el => { steps.current[n] = el; }}>
            <time>{d.time}</time><h3>{d.title} <em>{d.em}</em></h3><p>{d.text}</p>
            <div className="img"><img src={d.img} alt="" loading="lazy" /></div>
          </article>
        ))}
      </div>
      <div className="day-visual" aria-hidden="true" ref={vis} data-gl="day" data-src={day[0].img}>
        {day.map((d, n) => <img key={d.time} src={d.img} alt="" loading="lazy" className={n === i ? 'on' : ''} />)}
        <span className="clock">{day[i].time}</span>
      </div>
    </div>
  );
}
