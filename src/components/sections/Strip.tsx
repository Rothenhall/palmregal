"use client";

import Image from "next/image";
import { useRef } from "react";

/** Sideways photo strip. Mouse users can drag it; touch and trackpads scroll natively. */
export function Strip({ items }: { items: { src: string; caption: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  return (
    <div
      className="strip"
      ref={ref}
      tabIndex={0}
      aria-label="Photo gallery, scroll sideways"
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        drag.current = { x: e.clientX, left: ref.current.scrollLeft };
        ref.current.classList.add("drag");
      }}
      onPointerMove={(e) => {
        if (drag.current && ref.current) ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
      }}
      onPointerUp={() => { drag.current = null; ref.current?.classList.remove("drag"); }}
      onPointerLeave={() => { drag.current = null; ref.current?.classList.remove("drag"); }}
    >
      {items.map((g) => (
        <figure key={g.src}>
          <div className="img"><Image src={g.src} alt={g.caption} fill sizes="(max-width: 900px) 70vw, 360px" draggable={false} /></div>
          <figcaption>{g.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
