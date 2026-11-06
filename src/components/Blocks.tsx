import Link from 'next/link';
import { Icon } from './Icons';

export function SketchMap() {
  return (
    <div className="map" role="img" aria-label="Sketch map: Palm Regal to Gopalpur beach 5 minutes' walk, Berhampur 14 km, Tara Tarini Temple 35 km, Chilika Lake 46 km">
      <svg viewBox="0 0 520 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="land" d="M0 0h520v330c-60 22-120 14-170 44s-90 62-160 72S40 456 0 476z" />
        <path className="sea" d="M0 476c40-20 120-20 190-30s110-42 160-72 110-22 170-44v190H0z" />
        <text className="big" x="40" y="455">Bay of Bengal</text>
        <path className="route accent" d="M246 356 C 258 384, 272 404, 290 420" />
        <path className="route" d="M246 356 C 205 300, 150 250, 96 194" />
        <path className="route" d="M246 356 C 236 270, 268 180, 310 98" />
        <path className="route" d="M246 356 C 310 302, 380 252, 446 170" />
        <circle cx="290" cy="420" r="5" fill="#EEF5F2" /><circle cx="96" cy="194" r="5" fill="#EEF5F2" /><circle cx="310" cy="98" r="5" fill="#EEF5F2" /><circle cx="446" cy="170" r="5" fill="#EEF5F2" />
        <circle cx="246" cy="356" r="22" fill="#84CCFC" fillOpacity=".25" /><circle cx="246" cy="356" r="10" fill="#B4E4E4" />
        <text x="262" y="350">Palm Regal</text>
        <text x="300" y="426">Gopalpur beach</text><text className="sm" x="300" y="442">5 min walk</text>
        <text x="34" y="182">Berhampur</text><text className="sm" x="34" y="168">14 km · 25 min</text>
        <text x="258" y="86">Tara Tarini Temple</text><text className="sm" x="258" y="72">35 km</text>
        <text x="386" y="158">Chilika Lake</text><text className="sm" x="386" y="144">46 km</text>
      </svg>
      <div className="map-foot"><Link className="btn btn--light" href="/#location"><Icon id="i-map" />Explore the coast</Link></div>
    </div>
  );
}

export function Cta({ bg = 'night' }: { bg?: string }) {
  return (
    <section className="sec" data-bg={bg} aria-labelledby="cta-h">
      <div className="wrap cta">
        <p className="eyebrow">Book direct with the resort</p>
        <h2 id="cta-h" data-split data-drop>Your suite by the sea is <em>waiting.</em></h2>
        <div className="row">
          <Link className="btn btn--book" href="/#book">Check availability</Link>
          <Link className="btn btn--line" href="/#contact">Contact the resort <Icon id="i-arrow" /></Link>
        </div>
      </div>
    </section>
  );
}

/* Inner page hero: a full photo with the title over it; the photo settles as you scroll */
export function PageHero({ eyebrow, title, em, lede, crumb, img, alt = '' }: { eyebrow: string; title: string; em: string; lede: string; crumb: string; img: string; alt?: string }) {
  return (
    <section className="phero2" data-bg="night">
      <div className="ph-media" data-gl="photo" data-depth="-140"><img src={img} alt={alt} fetchPriority="high" /></div>
      <div className="ph-shade" aria-hidden="true" />
      <div className="wrap ph-in">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{crumb}</span></nav>
        <p className="eyebrow">{eyebrow}</p>
        <h1 data-split data-now>{title} <em>{em}</em></h1>
        <p className="lede" data-reveal>{lede}</p>
      </div>
    </section>
  );
}
