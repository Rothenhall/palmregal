/* What the loading screen gets ready before the page is shown, and what loads quietly after. */
import type { SiteContent } from '@/content/types';

const PHOTO = /^\/[^\s?#]+\.(webp|jpe?g|png|avif)$/i;

/** every photo the homepage content uses (also the ones uploaded in the editor), each once */
export function contentPhotos(content: SiteContent): string[] {
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (typeof v === 'string') { if (PHOTO.test(v)) out.add(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(content);
  return [...out];
}

/** the photos the first screen needs: the hero's stills (both the laptop and phone versions; the
    loading screen keeps the ones for this screen) and the first photo of each suite in the overview */
export function firstScreenPhotos(content: SiteContent): string[] {
  const out = new Set<string>();
  const add = (v?: string | null) => { if (v && PHOTO.test(v)) out.add(v); };
  for (const s of content.hero.slides) { add(s.image); add(s.poster); add(s.posterMobile); }
  for (const s of content.suitesSection.suites) add(s.photos[0]?.src);
  return [...out];
}
