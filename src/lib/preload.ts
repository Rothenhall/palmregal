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

/** the photos split by when the visitor needs them: the opening screen, the coast map, everything else */
export function contentPhotoGroups(content: SiteContent): { hero: string[]; map: string[]; rest: string[] } {
  const all = contentPhotos(content);
  const hero = new Set<string>(), map = new Set<string>();
  for (const s of content.hero?.slides ?? []) for (const v of [s.image, s.poster, s.posterMobile]) if (v && all.includes(v)) hero.add(v);
  for (const v of Object.values(content.locationSection?.photos ?? {})) if (v && all.includes(v)) map.add(v);
  return { hero: [...hero], map: [...map].filter(s => !hero.has(s)), rest: all.filter(s => !hero.has(s) && !map.has(s)) };
}
