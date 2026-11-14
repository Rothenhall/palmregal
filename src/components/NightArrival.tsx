'use client';
/* Section two: the night arrival. The camera's approach and the lighting follow the scroll
   (restored as it was when it opened the page; the opening screen is now the changing hero). */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Edit, SiteContent } from '@/content/types';
import { bookHref } from '@/lib/book';
import { noEdit } from '@/lib/edit';
import { Icon } from './Icons';

gsap.registerPlugin(ScrollTrigger);
const MEDIA = '/media/palm-regal-night-arrival-v4-';
const FPS = 30;

export function NightArrival({ content, f = noEdit }: { content: SiteContent; f?: Edit }) {
  const site = content.general, buttons = content.buttons, copy = content.arrival;
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = root.current!, video = film.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 760px)');
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let dispose = () => {};

    const configure = () => {
      dispose();
      if (reduced.matches || connection?.saveData) return;
      let frame = 0, disposed = false;
      const cursor = { progress: 0 };
      // Reference-conditioned generated night arrival; the camera and lighting
      // are already in the clip. No image zoom is applied by the website.
      // The clip is encoded with every frame as a keyframe (30 fps), so any seek lands at once.
      // Seeks are serialized, always catch up to the newest position, and only ask for a frame
      // that is not already showing, aiming at its middle so the decoder never has to round.
      let shown = -1;
      const seek = () => {
        frame = 0;
        if (disposed || video.readyState < 2 || video.seeking || document.hidden) return;
        if (!Number.isFinite(video.duration)) return;
        const last = Math.max(0, Math.round(video.duration * FPS) - 1);
        const f = Math.round(cursor.progress * last);
        if (f !== shown) { shown = f; video.currentTime = (f + .5) / FPS; }
      };
      const queue = () => { if (!frame && !disposed) frame = requestAnimationFrame(seek); };
      section.dataset.motion = 'true';
      const bar = section.querySelector<HTMLElement>('.aerial-hero__progress i');
      const tween = gsap.to(cursor, {
        progress: 1, ease: 'none',
        onUpdate: () => { if (bar) bar.style.transform = `scaleX(${cursor.progress})`; queue(); },
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true },
      });
      const metadata = () => { ScrollTrigger.refresh(); queue(); };
      const ready = () => { section.dataset.videoReady = 'true'; queue(); };
      const fail = () => {
        tween.scrollTrigger?.kill(); tween.kill(); cancelAnimationFrame(frame);
        delete section.dataset.motion; delete section.dataset.videoReady;
        if (bar) bar.style.transform = ''; ScrollTrigger.refresh();
      };
      video.addEventListener('loadedmetadata', metadata);
      video.addEventListener('loadeddata', ready);
      video.addEventListener('seeked', queue);
      video.addEventListener('error', fail);
      document.addEventListener('visibilitychange', queue);
      video.preload = 'auto';
      video.src = `${MEDIA}${mobile.matches ? 'mobile' : 'desktop'}.mp4`;
      video.load();
      dispose = () => {
        disposed = true; cancelAnimationFrame(frame);
        tween.scrollTrigger?.kill(); tween.kill();
        video.removeEventListener('loadedmetadata', metadata);
        video.removeEventListener('loadeddata', ready);
        video.removeEventListener('seeked', queue);
        video.removeEventListener('error', fail);
        document.removeEventListener('visibilitychange', queue);
        video.pause(); video.removeAttribute('src'); video.load();
        delete section.dataset.motion; delete section.dataset.videoReady;
        if (bar) bar.style.transform = '';
      };
    };
    configure();
    const reconfigure = () => { configure(); ScrollTrigger.refresh(); };
    reduced.addEventListener('change', reconfigure);
    mobile.addEventListener('change', reconfigure);
    connection?.addEventListener('change', reconfigure);
    return () => {
      reduced.removeEventListener('change', reconfigure);
      mobile.removeEventListener('change', reconfigure);
      connection?.removeEventListener('change', reconfigure);
      dispose();
    };
  }, []);

  return (
    <section className="aerial-hero" id="arrival" ref={root} aria-labelledby="arrival-title" data-dark="1">
      <div className="aerial-hero__screen">
        <picture className="aerial-hero__poster" aria-hidden="true">
          <source media="(max-width: 760px)" srcSet={`${MEDIA}poster-mobile.webp`} />
          <img src={`${MEDIA}poster.webp`} alt="" width={1920} height={1080} fetchPriority="high" />
        </picture>
        <video ref={film} className="aerial-hero__video" width={1920} height={1080}
          muted playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture />
        <div className="aerial-hero__shade" aria-hidden="true" />
        <div className="aerial-hero__copy wrap">
          <p className="eyebrow" {...f(copy, 'eyebrow')}>{copy.eyebrow}</p>
          <h2 id="arrival-title" {...f(copy, 'title')}>{copy.title} <em {...f(copy, 'em')}>{copy.em}</em></h2>
          <p className="aerial-hero__lede" {...f(copy, 'lede')}>{copy.lede} <em {...f(copy, 'ledeEm')}>{copy.ledeEm}</em></p>
          <div className="sh-cta">
            <a className="btn btn--book" href={bookHref(site)} data-book="" {...f(buttons, 'checkAvailability')}>{buttons.checkAvailability}</a>
            <Link className="btn btn--glass" href="/#suites" {...f(buttons, 'seeSuites')}>{buttons.seeSuites} <Icon id="i-arrow" /></Link>
          </div>
        </div>
        <div className="aerial-hero__footer wrap">
          <span className="aerial-hero__location" {...f(copy, 'place')}>{copy.place}</span>
          <span className="aerial-hero__progress" aria-hidden="true"><i /></span>
          <a className="aerial-hero__explore" href="#suites" {...f(buttons, 'explore')}>{buttons.explore} <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <span className="sr">Check-in {site.checkIn}, check-out {site.checkOut}.</span>
    </section>
  );
}
