'use client';
/* The opening screen. The background changes on its own between real drone clips and photographs,
   day into night, each with its own large caption, as the resort asked in the 10 Nov review.

   - Each slide crossfades into the next; photographs drift very slowly, clips play while shown.
   - Clips load only when their turn is near, and play only while the hero is on screen.
   - Dots show where you are and how long is left; any dot jumps to its slide.
   - A pause button stops the changes (anything that moves on its own for more than five seconds
     needs one). Reduced motion: nothing changes on its own and clips show their still frame. */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { heroSlides as SLIDES, site } from '@/content/site';
import { bookHref } from '@/lib/book';
import { Icon } from './Icons';

const N = SLIDES.length;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const clips = useRef<(HTMLVideoElement | null)[]>([]);
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);       // reduced motion
  const [visible, setVisible] = useState(true);    // hero on screen and tab in front
  const [phone, setPhone] = useState(false);
  const running = !paused && !still && visible;

  /* preferences, screen size, and whether the hero can be seen at all */
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)'), narrow = matchMedia('(max-width: 760px)');
    const sync = () => { setStill(reduce.matches); setPhone(narrow.matches); };
    sync(); reduce.addEventListener('change', sync); narrow.addEventListener('change', sync);
    let onScreen = true;
    const update = () => setVisible(onScreen && !document.hidden);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update(); }, { threshold: .15 });
    io.observe(root.current!); document.addEventListener('visibilitychange', update);
    return () => { reduce.removeEventListener('change', sync); narrow.removeEventListener('change', sync); io.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  /* the next slide when this one's time is up */
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setAt(i => (i + 1) % N), SLIDES[at].seconds * 1000);
    return () => clearTimeout(t);
  }, [at, running]);

  /* clips: the right file for the screen, loaded one slide ahead, playing only while shown */
  useEffect(() => {
    clips.current.forEach((v, i) => {
      if (!v) return;
      const s = SLIDES[i], want = phone && s.mobile ? s.mobile : s.src;
      const near = i === at || i === (at + 1) % N;
      if (near && !still && v.getAttribute('src') !== want) { v.src = want; v.load(); }
      if (i === at && running) { v.currentTime = 0; v.play().catch(() => {}); }
      else v.pause();
    });
  }, [at, running, phone, still]);

  const go = useCallback((i: number) => setAt(((i % N) + N) % N), []);

  return (
    <section ref={root} className={'hero hs' + (running ? ' is-running' : '') + (still ? ' is-still' : '')} data-dark="1" aria-roledescription="carousel" aria-label="Palm Regal, day and night">
      <div className="hs-screen">
      <div className="hs-stage">
        {SLIDES.map((s, i) => (
          <div key={s.src} className={'hs-slide' + (i === at ? ' on' : '')} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${N}`} aria-hidden={i !== at}
            style={{ ['--secs' as string]: `${s.seconds}s` }}>
            {s.kind === 'image' ? (
              <img className="hs-media" src={s.src} alt={s.alt} decoding="async" fetchPriority={i === 0 ? 'high' : 'low'} />
            ) : (
              <>
                <picture className="hs-media hs-poster">
                  {s.posterMobile && <source media="(max-width: 760px)" srcSet={s.posterMobile} />}
                  <img src={s.poster} alt={s.alt} decoding="async" fetchPriority={i === 0 ? 'high' : 'low'} />
                </picture>
                <video ref={el => { clips.current[i] = el; }} className="hs-media hs-clip" muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture
                  onPlaying={e => e.currentTarget.classList.add('ready')} />
              </>
            )}
          </div>
        ))}
        <div className="hs-shade" aria-hidden="true" />
      </div>

      <div className="hs-copy wrap">
        <h1 className="eyebrow">{site.name} · Resort homestay, Gopalpur on Sea</h1>
        <div className="hs-captions" aria-live={running ? 'off' : 'polite'}>
          {SLIDES.map((s, i) => (
            <p key={s.src} className={'hs-caption' + (i === at ? ' on' : '')} aria-hidden={i !== at}>{s.title} <em>{s.em}</em></p>
          ))}
        </div>
        <div className="sh-cta">
          <a className="btn btn--book" href={bookHref()} data-book="">Check availability</a>
          <Link className="btn btn--glass" href="/#suites">See the suites <Icon id="i-arrow" /></Link>
        </div>
      </div>

      <div className="hs-foot wrap">
        <span className="hs-place">Gopalpur on Sea, Odisha</span>
        <div className="hs-dots" role="tablist" aria-label="Choose a view">
          {SLIDES.map((s, i) => (
            <button key={s.src} type="button" role="tab" aria-selected={i === at} aria-label={`${s.title} ${s.em}`} className={i === at ? 'on' : ''} onClick={() => go(i)}>
              <i style={{ animationDuration: `${s.seconds}s` }} key={i === at ? `run-${at}` : 'idle'} />
            </button>
          ))}
        </div>
        {!still && (
          <button type="button" className="hs-pause" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play the slideshow' : 'Pause the slideshow'}>
            <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
          </button>
        )}
        <a className="hs-explore" href="#arrival">Explore your stay <span aria-hidden="true">↓</span></a>
      </div>

      </div>
    </section>
  );
}
