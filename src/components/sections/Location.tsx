import Link from "next/link";
import { attractions, nearby } from "@/content/place";
import { site } from "@/content/site";
import { Arrow, MapPin } from "../icons";
import { PalmShade } from "../PalmShade";
import { Tbc } from "../Tbc";

export function MapSketch() {
  return (
    <div className="map" role="img" aria-label="Sketch map: Palm Regal to Gopalpur beach 5 minutes' walk, Berhampur 14 km, Tara Tarini Temple 35 km, Chilika Lake 46 km">
      <svg viewBox="0 0 520 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <path className="land" d="M0 0h520v330c-60 22-120 14-170 44s-90 62-160 72S40 456 0 476z" />
        <path className="sea" d="M0 476c40-20 120-20 190-30s110-42 160-72 110-22 170-44v190H0z" />
        <text className="big" x="40" y="455">Bay of Bengal</text>
        <path className="route accent" d="M246 356 C 258 384, 272 404, 290 420" />
        <path className="route" d="M246 356 C 205 300, 150 250, 96 194" />
        <path className="route" d="M246 356 C 236 270, 268 180, 310 98" />
        <path className="route" d="M246 356 C 310 302, 380 252, 446 170" />
        <circle cx="290" cy="420" r="5" fill="#EEF5F2" /><circle cx="96" cy="194" r="5" fill="#EEF5F2" />
        <circle cx="310" cy="98" r="5" fill="#EEF5F2" /><circle cx="446" cy="170" r="5" fill="#EEF5F2" />
        <circle cx="246" cy="356" r="22" fill="#84CCFC" fillOpacity=".25" /><circle cx="246" cy="356" r="10" fill="#B4E4E4" />
        <text x="262" y="350">Palm Regal</text>
        <text x="300" y="426">Gopalpur beach</text><text className="sm" x="300" y="442">5 min walk</text>
        <text x="34" y="182">Berhampur</text><text className="sm" x="34" y="168">14 km · 25 min</text>
        <text x="258" y="86">Tara Tarini Temple</text><text className="sm" x="258" y="72">35 km</text>
        <text x="386" y="158">Chilika Lake</text><text className="sm" x="386" y="144">46 km</text>
      </svg>
      <div className="map-foot">
        <Tbc>Sketch, not to scale</Tbc>
        {site.social.googleMaps ? (
          <a className="btn" href={site.social.googleMaps} target="_blank" rel="noopener"><MapPin />Open in Google Maps</a>
        ) : (
          <span className="btn" aria-disabled><MapPin />Google Maps link to come</span>
        )}
      </div>
    </div>
  );
}

export function NearbyList() {
  return (
    <div className="near">
      {nearby.map((n) => <div key={n.name}><span>{n.name}</span><b>{n.distance}</b></div>)}
    </div>
  );
}

export function Attractions() {
  return (
    <div className="attr">
      {attractions.map((a) => (
        <article key={a.name}>
          <span className={`km${a.km ? " num" : ""}`}>{a.km ?? "–"}<small>km</small></span>
          <b>{a.name}</b>
          <span>{a.text} {a.tbc && <Tbc>{a.tbc}</Tbc>}</span>
          <span className="ph">Photo to come</span>
        </article>
      ))}
    </div>
  );
}

export function Location() {
  return (
    <section className="sec" id="location" aria-labelledby="loc-h">
      <PalmShade />
      <div className="wrap">
        <div className="head head-row">
          <div className="head" style={{ margin: 0 }}>
            <p className="eyebrow">Location and nearby</p>
            <h2 id="loc-h" data-split>Gopalpur, and <em>all around it.</em></h2>
            <p className="lede">1 Park Avenue, Gopalpur on Sea, Odisha 761002. Berhampur railway station is about 25 minutes by car.</p>
          </div>
          <Link className="tlink" href="/location">Things to do <Arrow width={16} height={16} /></Link>
        </div>
        <div className="loc">
          <MapSketch />
          <div>
            <NearbyList />
            <Attractions />
          </div>
        </div>
      </div>
    </section>
  );
}
