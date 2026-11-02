"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { delights } from "@/content/delights";
import { Arrow } from "../icons";

const photos = delights.flatMap((d) => (d.photo ? [d.photo] : []));

/** Resort Delights: a list that swaps the photo panel. Defaults to the pool, which has a real photo. */
export function Delights({ id = "facilities", showLink = true, headingLevel = 2 }: { id?: string; showLink?: boolean; headingLevel?: 1 | 2 }) {
  const [active, setActive] = useState(Math.max(0, delights.findIndex((d) => d.name === "Swimming Pool")));
  const cur = delights[active];
  const H = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className={`sec delights dark${headingLevel === 1 ? " page-top" : ""}`} id={id} aria-labelledby="dl-h">
      <div className="wrap">
        <div className="dl-head">
          <div className="head" style={{ margin: 0 }}>
            <p className="eyebrow">Resort Delights</p>
            <H id="dl-h" data-split>Reasons to <em>stay in.</em></H>
          </div>
          <span className="dl-count num" aria-hidden>{delights.length}</span>
        </div>
        <div className="dl">
          <div className="dl-side">
            <div className="dl-panel" data-gl="panel" data-active={cur.photo ?? ""}>
              {photos.map((src) => (
                <Image key={src} src={src} alt="" fill sizes="(max-width: 900px) 92vw, 520px" className={src === cur.photo ? "on" : ""} />
              ))}
              {!cur.photo && <div className="none on">Photo to come</div>}
              {(cur.standIn || !cur.photo) && <span className="stand">{cur.standIn ?? `${cur.name.split(",")[0]} photo to come`}</span>}
            </div>
            <div className="dl-now" aria-live="polite">
              <small>{cur.name}</small>
              <p>{cur.text}</p>
            </div>
            {showLink && <Link className="tlink" href="/facilities" style={{ justifySelf: "start" }}>See all facilities <Arrow width={16} height={16} /></Link>}
          </div>
          <ul className="dl-list">
            {delights.map((d, i) => (
              <li key={d.name}>
                <button className="dl-item" type="button" aria-pressed={i === active} onClick={() => setActive(i)} onMouseEnter={() => matchMedia("(hover: hover)").matches && setActive(i)}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span><b>{d.name}</b><small>{d.text}</small></span>
                  <span className="arrow"><Arrow /></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
