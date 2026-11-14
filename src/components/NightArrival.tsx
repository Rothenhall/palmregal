'use client';
/* The finale: the night arrival under the closing sections. The page runs from morning (the opening
   slideshow) to night and ends here. The film is pinned behind this section and scrubbed by the
   scroll: "Before you arrive" scrolls straight up over it (the page never pauses) and fades as
   it leaves, and "Stay a little longer" fades in over the film's last frames to end the page. */

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const MEDIA = '/media/palm-regal-night-arrival-v4-';
const FPS = 30;

export function NightArrival({ children }: { children: ReactNode }) {
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
      const tween = gsap.to(cursor, {
        progress: 1, ease: 'none',
        onUpdate: queue,
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
      });
      /* the words over the film: the veil darkens as the questions arrive; the questions fade as
         they leave the top; the contact fades in as it comes up, and stays */
      const veil = section.querySelector('.aerial-hero__veil'), faq = section.querySelector('.stay-faq'), contact = section.querySelector('.stay-contact');
      const words = gsap.context(() => {
        if (veil && faq) gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: faq, start: 'top bottom', end: 'top 45%', scrub: true } });
        if (faq) gsap.fromTo(faq, { opacity: 1 }, { opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: faq, start: 'bottom 70%', end: 'bottom 10%', scrub: true } });
        if (contact) gsap.fromTo(contact, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: contact, start: 'top 95%', end: 'top 40%', scrub: true } });
      }, section);
      const metadata = () => { ScrollTrigger.refresh(); queue(); };
      const ready = () => { section.dataset.videoReady = 'true'; queue(); };
      const fail = () => {
        tween.scrollTrigger?.kill(); tween.kill(); cancelAnimationFrame(frame);
        delete section.dataset.motion; delete section.dataset.videoReady;
        ScrollTrigger.refresh();
      };
      video.addEventListener('loadedmetadata', metadata);
      video.addEventListener('loadeddata', ready);
      video.addEventListener('seeked', queue);
      video.addEventListener('error', fail);
      document.addEventListener('visibilitychange', queue);
      /* the film sits near the end of the page: fetch it only when the visitor is a screen and a
         half away, so it never competes with the sections above it */
      const near = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        video.preload = 'auto';
        video.src = `${MEDIA}${mobile.matches ? 'mobile' : 'desktop'}.mp4`;
        video.load();
      }, { rootMargin: '150% 0px' });
      near.observe(section);
      dispose = () => {
        disposed = true; cancelAnimationFrame(frame); near.disconnect();
        tween.scrollTrigger?.kill(); tween.kill(); words.revert();
        video.removeEventListener('loadedmetadata', metadata);
        video.removeEventListener('loadeddata', ready);
        video.removeEventListener('seeked', queue);
        video.removeEventListener('error', fail);
        document.removeEventListener('visibilitychange', queue);
        video.pause(); video.removeAttribute('src'); video.load();
        delete section.dataset.motion; delete section.dataset.videoReady;
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
    <section className="aerial-hero" id="arrival" ref={root} data-dark="1">
      {/* the film: pinned behind everything in this section, scrubbed by the scroll */}
      <div className="aerial-hero__screen" aria-hidden="true">
        <picture className="aerial-hero__poster">
          <source media="(max-width: 760px)" srcSet={`${MEDIA}poster-mobile.webp`} />
          <img src={`${MEDIA}poster.webp`} alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        </picture>
        <video ref={film} className="aerial-hero__video" width={1920} height={1080}
          muted playsInline preload="none" tabIndex={-1} disablePictureInPicture />
        <div className="aerial-hero__shade" />
        {/* darkens the film once the words arrive over it, so they always read */}
        <div className="aerial-hero__veil" />
      </div>
      {/* the closing sections scroll up over the film straight away */}
      <div className="aerial-hero__over">{children}</div>
    </section>
  );
}
