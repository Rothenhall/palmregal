"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { day } from "@/content/place";

/** "A day at Palm Regal": scroll steps on the left, a sticky photo that follows them on the right. */
export function DayStory() {
  const [cur, setCur] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCur(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="day">
      <div className="day-steps">
        {day.map((d, i) => (
          <article key={d.time} className={`step${i === cur ? " on" : ""}`} data-i={i} ref={(el) => { steps.current[i] = el; }}>
            <time>{d.time}</time>
            <h3>{d.title} <em>{d.em}</em></h3>
            <p>{d.text}</p>
            <div className="img"><Image src={d.src} alt={d.alt} fill sizes="92vw" /></div>
          </article>
        ))}
      </div>
      <div className="day-visual" aria-hidden data-gl="day" data-active={cur}>
        {day.map((d, i) => (
          <Image key={d.time} src={d.src} alt="" fill sizes="(max-width: 900px) 1px, 55vw" className={i === cur ? "on" : ""} />
        ))}
        <span className="clock">{day[cur].time}</span>
      </div>
    </div>
  );
}
