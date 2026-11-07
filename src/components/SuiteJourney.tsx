'use client';
/* Our suites as a sideways journey. The structure follows the Spyker heritage page: the section
   holds and the scroll carries a long strip from left to right, chapter by chapter, with a quiet
   chapter bar that shows where you are.

   Each suite is one chapter: a large outline number that rises into place as it arrives, a
   full-height photograph that opens from a sliver while the picture drifts inside its frame, the
   facts arriving in a short cascade, and smaller photographs set at different heights that travel
   at their own speeds. It opens on the heading and closes on what comes in every suite.

   Without motion it is a strip you swipe or scroll sideways, one chapter at a time. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { inEverySuite, suites, type Suite } from '@/content/site';
import { hasMotion } from '@/lib/env';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);

const N = suites.length;
const pad = (n: number) => String(n).padStart(2, '0');
const AMENITY_ICONS: Record<string, string> = {
  'Kitchenette': 'i-kitchen', 'Private balcony': 'i-balcony', 'Living room': 'i-sofa',
  'Home comforts': 'p-home', 'Air conditioning': 'i-ac', 'Wi-Fi': 'i-wifi',
  'Parking': 'i-parking', 'Pets welcome': 'i-pet',
};

function SuitePhotos({ suite }: { suite: Suite }) {
  const [index, setIndex] = useState(0);
  const photo = suite.photos[index];
  const count = suite.photos.length;
  return (
    <figure className="sj-hero" aria-label={`${suite.name} photographs`}>
      <img src={photo.src} alt={photo.alt} loading="lazy" />
      {suite.todo && <span className="stand">Photo to confirm</span>}
      <figcaption className="sj-photo-caption">
        <span aria-live="polite"><small>{pad(index + 1)} / {pad(count)}</small>{photo.alt}</span>
        {count > 1 && <div className="sj-photo-controls">
          <button type="button" className="sj-photo-prev" aria-label={`Previous photograph of ${suite.name}`} onClick={() => setIndex(n => (n + count - 1) % count)}><Icon id="i-arrow" /></button>
          <button type="button" aria-label={`Next photograph of ${suite.name}`} onClick={() => setIndex(n => (n + 1) % count)}><Icon id="i-arrow" /></button>
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

export function SuiteJourney() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const height = matchMedia('(min-height: 520px)');
    const configure = () => setHeld(hasMotion() && height.matches);
    configure();
    motion.addEventListener('change', configure); height.addEventListener('change', configure);
    return () => { motion.removeEventListener('change', configure); height.removeEventListener('change', configure); };
  }, []);

  useEffect(() => {
    if (!held) return;
    const sec = root.current!, tr = track.current!;
    const dist = () => Math.max(0, tr.scrollWidth - innerWidth);
    /* the section is as tall as the strip is wide, so one scroll step moves it one step sideways,
       plus a short rest at each end so the opening and the close are read before it moves */
    const lead = () => innerHeight * .35, tail = () => innerHeight * .25;
    const setH = () => { sec.style.height = `${dist() + innerHeight + lead() + tail()}px`; };
    setH();
    const ctx = gsap.context(() => {
      const tween = gsap.to(tr, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: () => `top+=${lead()} top`, end: () => `bottom-=${tail()} bottom`, scrub: 1, invalidateOnRefresh: true },
      });
      const along = { containerAnimation: tween };

      /* large numbers rise into their mask as they come in */
      tr.querySelectorAll<HTMLElement>('.sj-num').forEach(el =>
        gsap.fromTo(el.firstElementChild, { yPercent: 104 }, { yPercent: 0, ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left 100%', end: 'left 50%', scrub: true } }));
      /* each main photograph opens from a sliver, and the picture drifts inside its frame */
      tr.querySelectorAll<HTMLElement>('.sj-hero').forEach(el => {
        gsap.fromTo(el, { clipPath: 'inset(10% 0% 10% 42%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left 100%', end: 'left 30%', scrub: true } });
        const img = el.querySelector('img');
        if (img) gsap.fromTo(img, { xPercent: -7, scale: 1.16 }, { xPercent: 7, scale: 1.04, ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left right', end: 'right left', scrub: true } });
      });
      /* the smaller photographs travel at their own speeds, for depth */
      tr.querySelectorAll<HTMLElement>('[data-drift]').forEach(el => {
        const s = parseFloat(el.dataset.drift!);
        gsap.fromTo(el, { x: () => s * innerWidth * .1 }, { x: () => -s * innerWidth * .1, ease: 'none', scrollTrigger: { ...along, trigger: el, start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true } });
      });
      /* the words arrive in a short cascade */
      tr.querySelectorAll<HTMLElement>('.sj-copy').forEach(el =>
        gsap.from(el.children, { y: 20, opacity: 0, duration: 1.2, stagger: .09, ease: 'power3.out', scrollTrigger: { ...along, trigger: el, start: 'left 84%', toggleActions: 'play none none reverse' } }));
    }, sec);
    ScrollTrigger.addEventListener('refreshInit', setH);
    ScrollTrigger.refresh();
    return () => { ScrollTrigger.removeEventListener('refreshInit', setH); ctx.revert(); sec.style.height = ''; };
  }, [held]);

  return (
    <section ref={root} className={'sj' + (held ? ' held' : '')} data-bg="night" id="suites" aria-labelledby="suites-h">
      <div className="sj-stick">
        <div className="sj-track" ref={track}>
          <div className="sj-intro" data-chapter="-1">
            <p className="eyebrow">Our suites</p>
            <h2 id="suites-h">Room to live, <em>not just sleep.</em></h2>
            <p className="lede">{N === 3 ? 'Three' : N} suite categories, with room to settle in. Living rooms, kitchenettes and balconies, with the resort around you.</p>
            {held && <span className="sj-cue" aria-hidden="true"><i />Scroll to walk through</span>}
          </div>

          {suites.map((s, i) => (
            <article className="sj-ch" data-chapter={i} key={s.slug} aria-labelledby={`sj-${s.slug}`}>
              <div className="sj-num num" aria-hidden="true"><span>{s.no}</span></div>
              <SuitePhotos suite={s} />
              <div className="sj-copy">
                <p className="sj-kicker">Suite {s.no} <span>/ {pad(N)}</span></p>
                <h3 id={`sj-${s.slug}`}>{title(s.name)}</h3>
                <p className="sj-long">{s.long}</p>
                <ul className="sj-highlights">{s.highlights.map(h => <li key={h}>{h}</li>)}</ul>
                <ul className="sj-facts">
                  {s.guests && <li><Icon id="i-guests" />{s.guests}</li>}
                  {s.size && <li><Icon id="i-size" />{s.size}</li>}
                  <li><Icon id="i-balcony" />{s.outdoor}</li>
                </ul>
                {(!s.guests || !s.size) && <p className="sj-detail-note">Ask reception about guest capacity and suite size.</p>}
                <p className="sj-best"><small>Best for</small>{s.bestFor}</p>
                <Link className="tlink" href="/#book">Check availability <Icon id="i-arrow" /></Link>
              </div>
              {s.photos.length > 1 && (
                <div className="sj-bits">
                  {s.photos.slice(1, 3).map((p, k) => (
                    <figure key={p.src + k} className={'sj-bit b' + k} data-drift={k ? -.45 : .35}>
                      <span className="sj-bit-ph"><img src={p.src} alt={p.alt} loading="lazy" /></span>
                      <figcaption>{p.alt}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </article>
          ))}

          <div className="sj-outro" data-chapter={N}>
            <p className="eyebrow">Why stay with us</p>
            <h3>The comforts<br /><em>of your own place.</em></h3>
            <ul className="sj-amenities">{inEverySuite.map(x => <li key={x}><Icon id={AMENITY_ICONS[x]} /><span>{x}</span></li>)}</ul>
            <div className="sj-outro-links">
              <a className="tlink" href="#book">Check availability <Icon id="i-arrow" /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
