"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroSlides } from "@/content/place";
import { site } from "@/content/site";

declare global {
  interface Window {
    /** Set by the WebGL layer: carries a slide change with the liquid metal wipe. Returns false if it can't. */
    __heroWipe?: (index: number) => boolean;
  }
}

export function Hero() {
  const [cur, setCur] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const curRef = useRef(0);

  const go = useCallback((i: number) => {
    const n = (i + heroSlides.length) % heroSlides.length;
    window.__heroWipe?.(n);
    curRef.current = n;
    setCur(n);
    setDone(n === 0 ? [] : Array.from({ length: n }, (_, k) => k));
  }, []);

  const play = useCallback(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => go(curRef.current + 1), 7000);
  }, [go]);

  useEffect(() => {
    play();
    const vis = () => (document.hidden ? timer.current && clearInterval(timer.current) : play());
    document.addEventListener("visibilitychange", vis);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [play]);

  return (
    <section className="hero" data-gl="hero" aria-label="Welcome to Palm Regal">
      {heroSlides.map((s, i) => (
        <div key={s.src} className={`slide${i === cur ? " on" : ""}`}>
          <Image src={s.src} alt={s.alt} fill sizes="100vw" preload={i === 0} fetchPriority={i === 0 ? "high" : "auto"} quality={80} />
        </div>
      ))}
      <div className="hero-in wrap">
        <div className="hero-grid">
          <div>
            <span className="pill-s"><i />Check-in {site.checkIn} · Check-out {site.checkOut}</span>
            <h1 data-split>
              Beachfront bliss, <em>just for you.</em>
            </h1>
            <p className="cap" aria-live="polite">{heroSlides[cur].caption}</p>
          </div>
          <div className="counter" aria-label="Photos">
            <span className="num"><b>{String(cur + 1).padStart(2, "0")}</b> / {String(heroSlides.length).padStart(2, "0")}</span>
            <div className="bars">
              {heroSlides.map((s, i) => (
                <button key={s.src} type="button" className={`${i === cur ? "on" : ""}${done.includes(i) ? " done" : ""}`} aria-label={`Show photo ${i + 1}`} aria-current={i === cur} onClick={() => { if (i !== cur) { go(i); play(); } }}>
                  <span><i key={i === cur ? `on-${cur}` : "off"} /></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
