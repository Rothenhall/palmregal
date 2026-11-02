import type { Metadata } from "next";
import { PalmShade } from "@/components/PalmShade";
import { Attractions, MapSketch, NearbyList } from "@/components/sections/Location";
import { Tbc } from "@/components/Tbc";
import { site } from "@/content/site";
import { PageMotion } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Location and things to do",
  description: "Palm Regal is five minutes' walk from Gopalpur beach, about 25 minutes from Berhampur, with Chilika Lake and Tara Tarini Temple within an hour.",
};

const travel = [
  { from: "Berhampur", time: "about 25 min" },
  { from: "Bhubaneswar", time: "about 3 hours" },
  { from: "Cuttack", time: "about 3.5 hours" },
  { from: "Visakhapatnam", time: "about 5 hours" },
  { from: "Kolkata", time: "about 11 hours" },
];

export default function LocationPage() {
  return (
    <>
      <section className="sec page-top" aria-labelledby="loc-h">
        <PalmShade />
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Location and nearby</p>
            <h1 id="loc-h" data-split>Gopalpur, and <em>all around it.</em></h1>
            <p className="lede">{site.address}. Berhampur railway station is about 25 minutes by car.</p>
          </div>
          <div className="loc">
            <MapSketch />
            <div>
              <NearbyList />
              <h2 style={{ fontSize: "1.6rem", color: "var(--color-teal)", margin: "8px 0 14px" }}>Getting here by car <Tbc>Times to confirm</Tbc></h2>
              <div className="near">
                {travel.map((t) => <div key={t.from}><span>{t.from}</span><b>{t.time}</b></div>)}
              </div>
            </div>
          </div>
          <div className="head" style={{ marginTop: "clamp(60px, 8vw, 110px)" }}>
            <p className="eyebrow">Things to do</p>
            <h2 data-split>Day trips <em>from the resort.</em></h2>
          </div>
          <Attractions />
        </div>
      </section>
      <PageMotion />
    </>
  );
}
