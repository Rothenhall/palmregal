import { MAX_EDGE, MAX_UPLOAD_BYTES, PROTECTED_FILES, WEBP_QUALITY, MEDIA_URL_PREFIX } from './shared';
import { MediaError, cleanDir, cleanFilePath, extOf, isImageName, publicUrl, sanitizeBaseName, sniffImage, uniqueName, type ImageKind } from './rules';
import type { MediaStorage } from './storage';
import { githubConfigFromEnv, GitHubStorage } from './github';
import { LocalStorage } from './local';

/* The photo rules, independent of where photos are stored (pass any MediaStorage). */

export const CONTENT_FILE = 'content/site/home.json';

/** Local disk when running `npm run dev` (or MEDIA_BACKEND=local); GitHub otherwise. */
export function getStorage(env: NodeJS.ProcessEnv = process.env): MediaStorage {
  const mode = env.MEDIA_BACKEND || (env.TINA_PUBLIC_IS_LOCAL === 'true' ? 'local' : 'github');
  return mode === 'local' ? new LocalStorage() : new GitHubStorage(githubConfigFromEnv(env));
}

export interface MediaItem {
  type: 'file' | 'dir';
  name: string;
  src?: string;
}

export async function listMedia(
  storage: MediaStorage,
  opts: { dir?: string; limit?: number; offset?: number; search?: string; ext?: string[]; filesOnly?: boolean },
): Promise<{ items: MediaItem[]; nextOffset?: number }> {
  const dir = cleanDir(opts.dir);
  const limit = Math.min(Math.max(opts.limit || 20, 1), 100);
  const offset = Math.max(opts.offset || 0, 0);
  const search = (opts.search ?? '').trim().toLowerCase();
  const exts = (opts.ext ?? []).map(e => e.replace(/^\./, '').toLowerCase()).filter(Boolean);
  const wantExt = (name: string) => !exts.length || exts.includes(extOf(name)) || (extOf(name) === 'jpg' && exts.includes('jpeg'));

  const all = (await storage.list(dir))
    .filter(e => !e.name.startsWith('.'))
    .filter(e => (e.type === 'dir' ? !opts.filesOnly && !search && !exts.length : isImageName(e.name) && wantExt(e.name) && (!search || e.name.toLowerCase().includes(search))))
    .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));

  const page = all.slice(offset, offset + limit);
  return {
    items: page.map(e => ({ type: e.type, name: e.name, src: e.type === 'file' ? publicUrl(dir ? `${dir}/${e.name}` : e.name) : undefined })),
    nextOffset: offset + limit < all.length ? offset + limit : undefined,
  };
}

/* sharp is optional: it ships with Next.js. With it we also verify the file really decodes, cap the pixel size and strip EXIF
   (the browser already did both; this protects against a client that skipped it). Without it we rely on the magic-byte check. */
async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    return null;
  }
}

export async function normalizeImage(bytes: Uint8Array, kind: ImageKind): Promise<{ data: Uint8Array; kind: ImageKind }> {
  const sharp = await loadSharp();
  if (!sharp) return { data: bytes, kind };
  try {
    const img = sharp(bytes, { limitInputPixels: 100_000_000, failOn: 'error' });
    const meta = await img.metadata();
    const formats: Record<ImageKind, string[]> = { jpg: ['jpeg'], png: ['png'], webp: ['webp'], avif: ['heif', 'avif'] };
    if (!meta.format || !formats[kind].includes(meta.format)) throw new Error('format mismatch');
    const long = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (!long) throw new Error('no size');
    if (long > MAX_EDGE + 200 || meta.exif || meta.xmp) {
      const out = await sharp(bytes, { limitInputPixels: 100_000_000 })
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: Math.round(WEBP_QUALITY * 100) })
        .toBuffer();
      return { data: new Uint8Array(out), kind: 'webp' };
    }
    return { data: bytes, kind };
  } catch {
    throw new MediaError(400, 'That file is not a valid photo.');
  }
}

export async function uploadImage(
  storage: MediaStorage,
  input: { bytes: Uint8Array; filename: string; dir?: string },
): Promise<{ filename: string; directory: string; src: string }> {
  if (!input.bytes.length) throw new MediaError(400, 'The file is empty.');
  if (input.bytes.length > MAX_UPLOAD_BYTES) throw new MediaError(413, 'That photo is too large (the limit is 4 MB). Try a smaller one.');
  const kind = sniffImage(input.bytes);
  if (!kind) throw new MediaError(415, 'Only JPEG, PNG, WebP and AVIF photos can be uploaded.');
  const dir = cleanDir(input.dir);
  const { data, kind: finalKind } = await normalizeImage(input.bytes, kind);
  if (data.length > MAX_UPLOAD_BYTES) throw new MediaError(413, 'That photo is too large (the limit is 4 MB). Try a smaller one.');

  const base = sanitizeBaseName(input.filename);
  const taken = (await storage.list(dir)).map(e => e.name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const name = uniqueName(taken, base, finalKind);
    const rel = dir ? `${dir}/${name}` : name;
    try {
      await storage.create(rel, data, `Edit site: upload photo ${rel}`);
      return { filename: name, directory: dir, src: publicUrl(rel) };
    } catch (e) {
      if (e instanceof MediaError && e.status === 409) { taken.push(name); continue; } // someone took the name meanwhile
      throw e;
    }
  }
  throw new MediaError(409, 'Could not find a free name for that photo. Please rename the file and try again.');
}

export async function deleteImage(storage: MediaStorage, path: string): Promise<void> {
  const { rel, name } = cleanFilePath(path);
  if (PROTECTED_FILES.includes(rel)) throw new MediaError(409, 'This picture is part of the website design and cannot be deleted here.');
  const content = (await storage.readRepoText(CONTENT_FILE)) ?? '';
  if (!content) throw new MediaError(502, 'Could not check whether the photo is in use, so it was not deleted. Please try again.');
  // photos are stored in the content as "/img/<path>"; check the exact quoted value (and a URL-encoded spelling)
  const used = [MEDIA_URL_PREFIX + rel, MEDIA_URL_PREFIX + rel.split('/').map(encodeURIComponent).join('/')];
  if (used.some(u => content.includes(`"${u}"`))) {
    throw new MediaError(409, `"${name}" is still used on the website. Choose a different photo where it is used (and save) before deleting it.`);
  }
  await storage.remove(rel, `Edit site: delete photo ${rel}`);
}
