import Link from "next/link";
import { gallery } from "@/content/place";
import { Arrow } from "../icons";
import { DayStory } from "./DayStory";
import { Strip } from "./Strip";
import { Tour } from "./Tour";

export function Gallery() {
  return (
    <section className="sec gallery dark" id="gallery" aria-labelledby="gal-h">
      <div className="wrap">
        <div className="head head-row">
          <div className="head" style={{ margin: 0 }}>
            <p className="eyebrow">Gallery and tour</p>
            <h2 id="gal-h" data-split>A day at <em>Palm Regal.</em></h2>
          </div>
          <Link className="tlink" href="/gallery">Full gallery <Arrow width={16} height={16} /></Link>
        </div>
        <DayStory />
        <Tour />
        <div className="strip-head">
          <h3>Around the <em>resort.</em></h3>
          <span className="tlink" aria-hidden>Drag to explore</span>
        </div>
        <Strip items={gallery.slice(0, 8)} />
      </div>
    </section>
  );
}
