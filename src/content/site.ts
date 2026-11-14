/*
 * The site's words, numbers and photos live in content/site/home.json, which the resort edits through
 * the Edit site editor (Tina, see tina/config.ts and README). This file is the typed, server-side loader.
 *
 * Import it only from server components (the layout, the page, not-found). Client components must not:
 * that would put the whole file into the browser bundle. They receive what they need as props.
 * Anything marked `pending` in the file is waiting on the resort and shows a small "to confirm" tag when
 * NEXT_PUBLIC_DRAFT is "true" (hidden by default).
 */
import home from '../../content/site/home.json';
import type { SiteContent } from './types';

export const content = home as unknown as SiteContent;

export const site = content.general;

/** Header and footer links. The anchors must match the section ids on the page, so only the labels are editable. */
export const navOf = (c: SiteContent) => [
  { href: '/#suites', label: c.nav.suites },
  { href: '/#facilities', label: c.nav.facilities },
  { href: '/#gallery', label: c.nav.gallery },
  { href: '/#location', label: c.nav.location },
  { href: '/#contact', label: c.nav.contact },
];
