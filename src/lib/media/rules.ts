import { MEDIA_URL_PREFIX } from './shared';

/* Pure helpers: names, paths and file-type sniffing. No I/O, so they are easy to test. */

export class MediaError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type ImageKind = 'jpg' | 'png' | 'webp' | 'avif';
export const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i + 1).toLowerCase();
}
export const isImageName = (name: string) => IMAGE_EXTS.includes(extOf(name));

/** What the bytes really are (not what the file name claims). SVG, GIF, HEIC and everything else return null. */
export function sniffImage(b: Uint8Array): ImageKind | null {
  if (b.length < 16) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'png';
  const ascii = (from: number, to: number) => String.fromCharCode(...Array.from(b.subarray(from, to)));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'avif';
  return null;
}

export const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

/** "My Holiday Photo (1).JPG" -> "my-holiday-photo-1". Safe for a URL and a git path. */
export function sanitizeBaseName(name: string): string {
  const stem = name.replace(/^.*[\/]/, '').replace(/\.[^.]*$/, '');
  const clean = stem
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return clean || 'photo';
}

/** A folder path inside public/img: no leading slash, no "..", no dot-folders, 3 levels at most. */
export function cleanDir(input: string | null | undefined): string {
  const parts = String(input ?? '').split('/').filter(Boolean);
  if (parts.length > 3) throw new MediaError(400, 'That folder is nested too deeply.');
  for (const p of parts) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,59}$/.test(p) || p.includes('..')) throw new MediaError(400, 'That folder name is not allowed.');
  }
  return parts.join('/');
}

/** "dir/file.webp" with a checked image file name. */
export function cleanFilePath(input: string | null | undefined): { dir: string; name: string; rel: string } {
  const raw = String(input ?? '').replace(/^\/+/, '');
  const i = raw.lastIndexOf('/');
  const dir = cleanDir(i < 0 ? '' : raw.slice(0, i));
  const name = i < 0 ? raw : raw.slice(i + 1);
  if (!/^[A-Za-z0-9][A-Za-z0-9._ -]{0,119}$/.test(name) || name.includes('..') || !isImageName(name)) {
    throw new MediaError(400, 'That is not a photo file name.');
  }
  return { dir, name, rel: dir ? `${dir}/${name}` : name };
}

/** First of base.ext, base-2.ext, base-3.ext ... not in `taken` (compared case-insensitively). */
export function uniqueName(taken: Iterable<string>, base: string, ext: string): string {
  const set = new Set(Array.from(taken, n => n.toLowerCase()));
  let name = `${base}.${ext}`;
  for (let n = 2; set.has(name.toLowerCase()); n++) name = `${base}-${n}.${ext}`;
  return name;
}

/** The URL the website and home.json use. */
export const publicUrl = (rel: string) => MEDIA_URL_PREFIX + rel;
