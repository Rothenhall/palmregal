import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { nav, site } from '@/content/site';

export const metadata: Metadata = { title: 'Page not found' };

/* A wrong turn still arrives somewhere: the night garden from the hero, and a way back to every part of the stay */
export default function NotFound() {
  return (
    <section className="lost" data-bg="night" data-dark="1" aria-labelledby="lost-h">
      <picture className="lost-photo" aria-hidden="true">
        <source media="(max-width: 760px)" srcSet="/media/palm-regal-night-arrival-v4-poster-mobile.webp" />
        <img src="/media/palm-regal-night-arrival-v4-poster.webp" alt="" width={1920} height={1080} />
      </picture>
      <div className="lost-shade" aria-hidden="true" />
      <div className="wrap lost-copy">
        <p className="eyebrow">Page not found</p>
        <h1 id="lost-h" data-split>This path leads <em>to the sea.</em></h1>
        <p className="lede">The page you were looking for isn&apos;t here. The garden, the suites and the beach are just this way.</p>
        <div className="sh-cta">
          <Link className="btn btn--book" href="/">Back to {site.name}</Link>
          <Link className="btn btn--glass" href="/#book">Check availability <Icon id="i-arrow" /></Link>
        </div>
        <nav className="lost-links" aria-label="Parts of the stay">
          {nav.map(n => <Link key={n.href} className="tlink" href={n.href}>{n.label}</Link>)}
        </nav>
      </div>
    </section>
  );
}
