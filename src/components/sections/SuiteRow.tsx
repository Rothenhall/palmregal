"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Suite } from "@/content/suites";
import { Arrow } from "../icons";
import { Tbc } from "../Tbc";

export function SuiteRow({ suite, headingLevel = 3, linkToPage = true }: { suite: Suite; headingLevel?: 1 | 2 | 3; linkToPage?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const H = (["h1", "h2", "h3"] as const)[headingLevel - 1];
  const many = suite.photos.length > 1;

  function go(i: number) {
    const t = track.current;
    if (!t) return;
    const n = (i + suite.photos.length) % suite.photos.length;
    t.scrollTo({ left: n * t.clientWidth, behavior: "smooth" });
  }

  return (
    <article className={`suite${suite.detailsToCome ? " suite--tbc" : ""}`}>
      <div className="gal">
        <div className="gal-track" data-gl="gal" ref={track} onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {suite.photos.map((p) => (
            <div key={p.src} className="img">
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 900px) 92vw, 640px" />
              {suite.photoToConfirm && <span className="stand">Photo to confirm</span>}
            </div>
          ))}
        </div>
        {many && (
          <>
            <div className="gal-dots" aria-hidden>{suite.photos.map((p, i) => <i key={p.src} className={i === idx ? "on" : ""} />)}</div>
            <div className="gal-nav">
              <button className="prev" type="button" aria-label="Previous photo" onClick={() => go(idx - 1)}><Arrow /></button>
              <button className="next" type="button" aria-label="Next photo" onClick={() => go(idx + 1)}><Arrow /></button>
            </div>
          </>
        )}
      </div>
      <div>
        <span className="suite-no">{suite.no}</span>
        <H>{suite.name}</H>
        <p>
          {suite.summary} {suite.detailsToCome && <Tbc>Description from the resort</Tbc>}
        </p>
        <div className="specs num">
          <div><small>Guests</small><b>{suite.guests ?? <Tbc>TBC</Tbc>}</b></div>
          <div><small>Size</small><b>{suite.size ?? <Tbc>TBC</Tbc>}</b></div>
          <div><small>{suite.view ? "View" : "Balcony"}</small><b>{suite.view ?? suite.balconies}</b></div>
          <div><small>Kitchen</small><b>Kitchenette</b></div>
        </div>
        <div className="suite-acts">
          <Link className="btn btn--teal" href="/#book">Book this suite</Link>
          {linkToPage && <Link className="tlink" href={`/suites/${suite.slug}`}>View suite</Link>}
        </div>
      </div>
    </article>
  );
}
