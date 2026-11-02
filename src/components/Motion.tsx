"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Calm motion (docs/motion-direction.md): Lenis smooth scroll on desktop only, line-by-line heading reveals,
 * a brushed-metal sheen across headline italics, and the word-fill statement. Nothing starts hidden without scripts,
 * and all of it is off for reduced motion.
 */
export function Motion() {
  // Smooth scroll once for the whole app, desktop pointers only.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}

/**
 * Per-page reveals. Rendered as the last child of each page, so its effect runs only after that page has
 * hydrated: SplitText rewrites heading DOM, which must not happen while React is still hydrating it.
 */
export function PageMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.__lenis?.scrollTo(0, { immediate: true });
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((h) => {
        const lines = SplitText.create(h, { type: "lines", mask: "lines" }).lines;
        const inHero = !!h.closest(".hero");
        gsap.from(lines, {
          yPercent: 105,
          duration: 1.2,
          stagger: 0.09,
          ease: "expo.out",
          delay: inHero ? 0.2 : 0,
          scrollTrigger: inHero ? undefined : { trigger: h, start: "top 88%", once: true },
        });
      });
      document.querySelectorAll<HTMLElement>("[data-split] em").forEach((em) => {
        em.classList.add("metal-text");
        const inHero = !!em.closest(".hero");
        gsap.fromTo(
          em,
          { backgroundPosition: "100% 0" },
          { backgroundPosition: "0% 0", duration: 1.8, ease: "power2.inOut", delay: inHero ? 1 : 0.35, scrollTrigger: inHero ? undefined : { trigger: em, start: "top 85%", once: true } },
        );
      });
      const statement = document.querySelector<HTMLElement>("[data-statement]");
      if (statement) {
        const words = SplitText.create(statement, { type: "words" }).words;
        gsap.set(words, { opacity: 0.16 });
        gsap.to(words, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 45%", scrub: true } });
      }
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: "expo.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });
      document.querySelectorAll<SVGPathElement>(".map .route").forEach((r, i) => {
        const len = r.getTotalLength();
        const dashed = !r.classList.contains("accent");
        gsap.fromTo(
          r,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.8, delay: i * 0.15, ease: "power2.inOut", scrollTrigger: { trigger: ".map", start: "top 75%", once: true }, onComplete: () => { r.style.strokeDasharray = dashed ? "5 7" : "none"; } },
        );
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
