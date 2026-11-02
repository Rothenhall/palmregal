import type { Metadata } from "next";
import Image from "next/image";
import { Tour } from "@/components/sections/Tour";
import { gallery } from "@/content/place";
import { PageMotion } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of the suites, gardens, pool and facilities at Palm Regal, Gopalpur on Sea.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="sec page-top" aria-labelledby="gal-h">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Gallery and tour</p>
            <h1 id="gal-h" data-split>Around <em>the resort.</em></h1>
          </div>
          <div className="grid-gallery">
            {gallery.map((g) => (
              <figure key={g.src} data-reveal>
                <div className="img" data-gl="photo"><Image src={g.src} alt={g.caption} fill sizes="(max-width: 600px) 92vw, (max-width: 1100px) 45vw, 30vw" /></div>
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="dark"><Tour /></div>
        </div>
      </section>
      <PageMotion />
    </>
  );
}
