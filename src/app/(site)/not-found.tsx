import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { content, navOf } from '@/content/site';
import { bookHref, telHref } from '@/lib/book';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

/* One wave row: a repeating swell 1600 wide (period 400) so it can drift 400 and loop seamlessly. */
const WAVE = 'M-400 0q100-12 200 0t200 0t200 0t200 0t200 0t200 0t200 0t200 0V120H-400Z';

/* Playful but unmistakable 404: a little boat adrift, with land on the horizon. */
export default function NotFound() {
  const site = content.general, nav = navOf(content);
  return (
    <section className="nf" aria-labelledby="nf-h">
      <div className="wrap nf-inner">
        <p className="nf-code" aria-hidden="true">404</p>
        <svg className="nf-scene" viewBox="0 0 800 260" aria-hidden="true" focusable="false">
          <circle className="nf-sun" cx="690" cy="92" r="26" />
          <g className="nf-cloud"><path d="M120 70h90a16 16 0 0 0-6-30 22 22 0 0 0-42-6 20 20 0 0 0-42 14 12 12 0 0 0 0 22Z" /></g>
          <g className="nf-bird"><path d="M300 54q10-12 20 0q10-12 20 0" fill="none" /></g>
          <g className="nf-island">
            <path d="M610 170q40-30 100-30t90 30Z" />
            <path d="M706 148q-4-26 2-44" className="nf-trunk" fill="none" />
            <path className="nf-frond" d="M708 104q-20-14-38-6q18-2 38 6Zm0 0q18-18 38-10q-20-2-38 10Zm0 0q-6-22 8-34q-2 20-8 34Zm0 0q22-6 34 8q-20-4-34-8Z" />
          </g>
          <rect className="nf-horizon" x="0" y="168" width="800" height="1.5" />
          <g className="nf-sea nf-sea--far"><g transform="translate(0 170)"><g className="nf-wave nf-wave--1"><path d={WAVE} /></g></g></g>
          <g className="nf-boat">
            <g className="nf-boat-tilt">
              <path className="nf-mast" d="M392 108V176" />
              <path className="nf-sail" d="M396 112q44 24 50 58H396Z" />
              <path className="nf-sail nf-sail--b" d="M388 124q-26 18-34 46h34Z" />
              <path className="nf-flag" d="M392 108l20 6-20 6Z" />
              <path className="nf-hull" d="M340 176h116q-10 26-34 26h-48q-24 0-34-26Z" />
              <circle className="nf-lantern" cx="352" cy="170" r="4.5" />
            </g>
          </g>
          <g className="nf-sea nf-sea--mid"><g transform="translate(0 196)"><g className="nf-wave nf-wave--2"><path d={WAVE} /></g></g></g>
          <g className="nf-bottle"><rect x="560" y="198" width="22" height="8" rx="4" /><path d="M582 200h6v4h-6Z" /></g>
          <g className="nf-sea nf-sea--near"><g transform="translate(0 216)"><g className="nf-wave nf-wave--3"><path d={WAVE} /></g></g></g>
        </svg>
        <p className="nf-eyebrow">404 · Page not found</p>
        <h1 id="nf-h" className="nf-title">You&apos;ve drifted off course.</h1>
        <p className="nf-text">
          This page sailed away, but you can still find your way to shore. Drop anchor at Palm Regal, five minutes&apos; walk from Gopalpur beach.
        </p>
        <div className="nf-actions">
          <Link className="btn btn--book" href="/">Back to shore</Link>
          <a className="btn btn--line" href={bookHref(site)} data-book="">Check availability <Icon id="i-arrow" /></a>
        </div>
        <nav className="nf-links" aria-label="Popular pages">
          <p>Or sail straight to</p>
          <ul>
            {nav.map(n => <li key={n.href}><Link className="tlink" href={n.href}>{n.label}</Link></li>)}
          </ul>
        </nav>
        {(site.phone || site.email) && (
          <p className="nf-help">
            Still adrift?{' '}
            {site.phone && <>Call <a href={telHref(site.phone)}>{site.phone}</a></>}
            {site.phone && site.email && ' or email '}
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
          </p>
        )}
      </div>
    </section>
  );
}
