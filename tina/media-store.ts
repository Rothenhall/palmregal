/*
 * The editor's photo library: our own media store for TinaCMS (media.loadCustomStore in tina/config.ts).
 * Browser code only. It talks to /api/tina/media (src/app/api/tina/media), which is guarded by the admin sign-in and
 * saves photos to public/img (GitHub commits on the live site, the local disk under `npm run dev`).
 *
 * Before uploading, every photo is shrunk here in the browser: longest edge 2400 px, WebP at quality ~0.82 (JPEG if the
 * browser cannot write WebP), orientation fixed and EXIF (GPS, camera, date) dropped. A 12 MB phone photo becomes ~300 KB to 1 MB,
 * which is also what keeps the request under Vercel's ~4.5 MB body limit and the website fast.
 */
import {
  ACCEPT, CLIENT_TARGET_BYTES, MAX_EDGE, MAX_FILES_PER_BATCH, MAX_UPLOAD_BYTES, MEDIA_API, WEBP_QUALITY,
} from '../src/lib/media/shared';

interface Media {
  type: 'file' | 'dir';
  id: string;
  filename: string;
  directory: string;
  src?: string;
  thumbnails?: { [name: string]: string };
}
interface MediaListOptions { directory?: string; limit?: number; offset?: string | number; search?: string; ext?: string[]; filesOnly?: boolean; thumbnailSizes?: { w: number; h: number }[] }
interface MediaUploadOptions { directory: string; file: File }

const stripSlashes = (s: string | undefined) => (s ?? '').replace(/^\/+|\/+$/g, '');

async function apiError(res: Response, fallback: string): Promise<Error> {
  let message = fallback;
  try {
    const body = await res.json();
    if (body?.error) message = String(body.error);
  } catch { /* keep the fallback */ }
  if (res.status === 401) message = 'You have been signed out. Open the dashboard and sign in again, then retry.';
  if (res.status === 413) message = 'That photo is too large even after shrinking. Try a smaller one.';
  return new Error(message);
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close(): void }> {
  try {
    // 'from-image' applies the camera's rotation, so portrait phone photos are not sideways
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
    } catch {
      throw new Error(`"${file.name}" could not be read as a photo.`);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));

/** Shrinks a photo: <= 2400 px long edge, WebP ~0.82 (JPEG fallback), under ~3.5 MB. Exported for reuse and testing. */
export async function compressImage(file: File): Promise<{ blob: Blob; ext: 'webp' | 'jpg' }> {
  const img = await decode(file);
  try {
    // Try the preferred size/quality first, then step down until it fits the upload budget.
    const steps: [number, number][] = [[MAX_EDGE, WEBP_QUALITY], [MAX_EDGE, 0.72], [1920, 0.72], [1600, 0.68], [1280, 0.62]];
    let last: { blob: Blob; ext: 'webp' | 'jpg' } | null = null;
    for (const [edge, quality] of steps) {
      const scale = Math.min(1, edge / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('This browser cannot shrink photos. Try Chrome, Edge or Safari.');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img.source, 0, 0, canvas.width, canvas.height);
      let blob = await toBlob(canvas, 'image/webp', quality);
      let ext: 'webp' | 'jpg' = 'webp';
      if (!blob || blob.type !== 'image/webp') {
        // no WebP encoder: JPEG on a white background (JPEG has no transparency)
        const flat = document.createElement('canvas');
        flat.width = canvas.width; flat.height = canvas.height;
        const fctx = flat.getContext('2d')!;
        fctx.fillStyle = '#fff';
        fctx.fillRect(0, 0, flat.width, flat.height);
        fctx.drawImage(canvas, 0, 0);
        blob = await toBlob(flat, 'image/jpeg', quality);
        ext = 'jpg';
      }
      if (!blob) throw new Error('This browser could not shrink the photo.');
      last = { blob, ext };
      if (blob.size <= CLIENT_TARGET_BYTES) return last;
    }
    if (last && last.blob.size <= MAX_UPLOAD_BYTES) return last;
    throw new Error(`"${file.name}" is still too large after shrinking. Try a smaller photo.`);
  } finally {
    img.close();
  }
}

export class PalmRegalMediaStore {
  accept = ACCEPT;
  /** Phone photos are big; they are shrunk before upload, so allow a generous original size. */
  maxSize = 40 * 1024 * 1024;
  searchable = true;
  extensionFilterable = true;

  // Tina passes its API client; we do not need it (same-origin cookies authenticate every call).
  constructor(_api?: unknown) {}

  /** The value saved in home.json: the website's own /img/<file> URL. */
  parse(media: Media): string {
    return media.src ?? '';
  }

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    if (files.length > MAX_FILES_PER_BATCH) throw new Error(`Please upload at most ${MAX_FILES_PER_BATCH} photos at a time.`);
    const out: Media[] = [];
    for (const { file, directory } of files) {
      if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error(`"${file.name}" is not a JPEG, PNG, WebP or AVIF photo.`);
      const { blob, ext } = await compressImage(file);
      const base = file.name.replace(/\.[^.]*$/, '') || 'photo';
      const form = new FormData();
      form.append('file', blob, `${base}.${ext}`);
      form.append('filename', `${base}.${ext}`);
      form.append('directory', stripSlashes(directory));
      const res = await fetch(MEDIA_API, { method: 'POST', body: form, credentials: 'same-origin' });
      if (!res.ok) throw await apiError(res, `The photo could not be saved (error ${res.status}).`);
      const saved = (await res.json()) as { filename: string; directory: string; src: string };
      out.push(this.item(saved.directory, saved.filename, saved.src));
    }
    return out;
  }

  async list(options: MediaListOptions = {}) {
    const q = new URLSearchParams();
    q.set('directory', stripSlashes(options.directory));
    if (options.limit) q.set('limit', String(options.limit));
    if (options.offset) q.set('offset', String(options.offset));
    if (options.search) q.set('search', options.search);
    if (options.ext?.length) q.set('ext', options.ext.join(','));
    if (options.filesOnly) q.set('filesOnly', 'true');
    const res = await fetch(`${MEDIA_API}?${q}`, { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) throw await apiError(res, `The photos could not be loaded (error ${res.status}).`);
    const body = (await res.json()) as { items: { type: 'file' | 'dir'; name: string; src?: string }[]; nextOffset?: number };
    const directory = options.directory ?? '';
    return {
      items: body.items.map(i =>
        i.type === 'dir'
          ? ({ type: 'dir', id: i.name, filename: i.name, directory } as Media)
          : this.item(directory, i.name, i.src!, options.thumbnailSizes)),
      nextOffset: body.nextOffset,
    };
  }

  async delete(media: Media): Promise<void> {
    const dir = stripSlashes(media.directory);
    const path = dir ? `${dir}/${media.filename}` : media.filename;
    const res = await fetch(`${MEDIA_API}?path=${encodeURIComponent(path)}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!res.ok) throw await apiError(res, `The photo could not be deleted (error ${res.status}).`);
  }

  // Thumbnails are the photo itself: the site's photos are already web-sized, and /img/<file> works for
  // photos that are not deployed yet too (next.config.mjs routes them to the admin-only preview proxy).
  private item(directory: string, filename: string, src: string, sizes?: { w: number; h: number }[]): Media {
    const thumbs: { [k: string]: string } = { '75x75': src, '400x400': src, '1000x1000': src };
    for (const s of sizes ?? []) thumbs[`${s.w}x${s.h}`] = src;
    return { type: 'file', id: filename, filename, directory, src, thumbnails: thumbs };
  }
}

export default PalmRegalMediaStore;
