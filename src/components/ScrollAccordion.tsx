'use client';
/* "A day in five pictures": the image accordion held in place briefly while the scroll walks
   the open picture along the strip. A clear start and end (one step per picture) so it never
   feels like the page has stopped; the words sit beside the strip, never over a photograph. */
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ImageAccordion } from './ImageAccordion';
import { hasMotion } from '@/lib/env';
import { day } from '@/content/site';

gsap.registerPlugin(ScrollTrigger);

/* the same five moments as the homepage, from content/site.ts */
const DAY = day.map(d => ({ when: d.time, line: d.text }));

export function ScrollAccordion() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const [driven, setDriven] = useState(false);

  useEffect(() => { if (hasMotion()) setDriven(true); }, []);

  /* measured only once the section has its scrolling height, or start and end would be wrong */
  useEffect(() => {
    if (!driven) return;
    const st = ScrollTrigger.create({
      trigger: root.current!, start: 'top top', end: 'bottom bottom',
      onUpdate: self => { const n = Math.min(DAY.length - 1, Math.floor(self.progress * DAY.length)); setI(c => (c === n ? c : n)); },
    });
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [driven]);

  return (
    <section ref={root} className={'dayacc' + (driven ? ' driven' : '')} data-bg="dusk" aria-labelledby="dayacc-h">
      <div className="dayacc-stick">
        <div className="wrap dayacc-grid">
          <div className="dayacc-copy">
            <p className="eyebrow">A day at Palm Regal</p>
            <h2 id="dayacc-h">In five <em>pictures.</em></h2>
            <ol className="dayacc-list">
              {DAY.map((d, k) => (
                <li key={d.when} aria-current={k === i ? 'step' : undefined}>
                  <span className="num">0{k + 1}</span>
                  <span><b>{d.when}</b><small>{d.line}</small></span>
                </li>
              ))}
            </ol>
          </div>
          <div className="dayacc-strip">
            <ImageAccordion width="100%" height="100%" gap={6} open={62} reach={40} bounce={12} active={driven ? i : undefined} />
          </div>
        </div>
      </div>
    </section>
  );
}
