import Link from 'next/link';
import { gallery, site, suites } from '@/content/site';
import { Icon } from './Icons';
import { Todo } from './Todo';
import { DRAFT, waHref } from '@/lib/book';

/* Suites as tall cards: the facts rise in a glass panel on hover */
export function SuiteTall() {
  return (
    <div className="tall">
      {suites.map((s, i) => (
        <div className="tall-par" key={s.slug}><Link className="tall-card" href={`/suites/#${s.slug}`}>
          <div className="img" data-gl="photo" data-depth="-130"><img src={s.photos[0].src} alt={s.photos[0].alt} loading="lazy" />{s.todo && <span className="stand">Photo to confirm</span>}</div>
          <span className="tall-shade" />
          <span className="tall-top"><span className="tall-no">{s.no}</span><span className="tall-go"><Icon id="i-arrow" /></span></span>
          <span className="tall-panel">
            <b>{s.name}</b>
            <span className="tall-reveal"><span>
              <span className="tall-facts">{s.guests && <span><Icon id="i-guests" />{s.guests}</span>}{s.size && <span><Icon id="i-size" />{s.size}</span>}<span><Icon id="i-balcony" />{s.outdoor}</span></span>
              <span className="tall-best"><small>Best for</small>{s.bestFor}</span>
            </span></span>
          </span>
        </Link></div>
      ))}
    </div>
  );
}

/* How booking works: three tiny animated scenes */
export function BookingSteps() {
  return (
    <div className="steps" data-reveal>
      <article className="stp">
        <div className="stp-scene cal" aria-hidden="true">
          <div className="cal-grid">{Array.from({ length: 21 }).map((_, i) => <i key={i} className={i >= 10 && i <= 12 ? 'sel' : ''} />)}</div>
        </div>
        <span className="n">01</span><h3>Pick your <em>dates.</em></h3><p>Choose check-in, check-out, guests and a suite.</p>
      </article>
      <article className="stp">
        <div className="stp-scene msg" aria-hidden="true">
          <span className="bub b1">Hello Palm Regal, I would like to stay…</span>
          <span className="bub b2">Your suite is free on those dates.</span>
        </div>
        <span className="n">02</span><h3>Send them <em>to us.</em></h3><p>Your dates go straight to reception, already written out.</p>
      </article>
      <article className="stp">
        <div className="stp-scene stamp" aria-hidden="true"><span className="ticket"><b>Palm Regal</b><small>Two Bedroom Suite</small></span><span className="seal">Confirmed</span></div>
        <span className="n">03</span><h3>We <em>confirm.</em></h3><p>The resort confirms your stay directly. No booking site in between.</p>
      </article>
    </div>
  );
}

/* A wall of moments drifting by */
export function Moments() {
  const tiles = [...gallery, ...gallery];
  const rows = [tiles.slice(0, 14), tiles.slice(5, 19).reverse(), tiles.slice(10, 24)];
  return (
    <div className="moments" aria-hidden="true">
      {rows.map((r, k) => (
        <div className={'mrow' + (k % 2 ? ' rev' : '')} key={k}>
          <div className="mtrack">{[...r, ...r].map((g, i) => <span className="mtile" key={i}><img src={g.src} alt="" loading="lazy" /></span>)}</div>
        </div>
      ))}
    </div>
  );
}

/* Reviews on a slow belt */
export function ReviewBelt() {
  const items = [5, 5, 4, 5, 5, 4];
  const card = (n: number, i: number, dup = false) => (
    <li className="belt-card" key={(dup ? 'd' : '') + i} aria-hidden={dup || undefined}>
      <div className="stars" aria-label={`${n} out of 5 stars`}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</div>
      <blockquote>A guest&apos;s review appears here, word for word, from Google.</blockquote>
      <footer><i>G</i><span>Guest name · date</span></footer>
    </li>
  );
  return (
    <div className="belt"><ul className="belt-track">{items.map((n, i) => card(n, i))}{items.map((n, i) => card(n, i, true))}</ul></div>
  );
}

/* Ready when you are: three ways to start */
export function ThreeWays() {
  return (
    <div className="ways3" data-stagger>
      <Link className="w3" href="/#book"><Icon id="i-cal" /><b>Check your dates</b><span>Pick dates and send them straight to the resort.</span><em>Check availability <Icon id="i-arrow" /></em></Link>
      <a className="w3" href={site.phoneHref}><Icon id="i-phone" /><b>Call reception</b><span className="num">{site.phone}</span><em>Call now <Icon id="i-arrow" /></em></a>
      <a className="w3" href={waHref()}><Icon id="i-wa" /><b>Message us</b><span>Ask about pets, groups, early check-in or anything else.</span><em>{site.whatsapp ? 'Open WhatsApp' : 'Send a message'} <Icon id="i-arrow" /></em></a>
    </div>
  );
}

/* Night over the footer water: fireflies and garden lamps */
export function Fireflies() {
  const f = Array.from({ length: 16 });
  return (
    <div className="flies" aria-hidden="true">
      {f.map((_, i) => <i key={i} style={{ left: `${(i * 61) % 100}%`, top: `${12 + ((i * 37) % 70)}%`, animationDelay: `${-(i * 1.3) % 9}s`, animationDuration: `${7 + (i % 5) * 1.6}s` }} />)}
      <b className="lamp l1" /><b className="lamp l2" /><b className="lamp l3" />
    </div>
  );
}
