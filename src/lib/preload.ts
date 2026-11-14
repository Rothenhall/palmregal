/* Everything the loading screen gets ready before the page is shown. */
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
