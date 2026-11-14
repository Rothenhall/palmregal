/* Constants shared by the browser-side media store (tina/media-store.ts) and the server routes.
   Pure values only: this file is bundled into the editor, so it must not import anything. */

/** Where photos live in the repo, and the URL form the website (and home.json) uses for them. */
export const MEDIA_ROOT = 'public/img';
export const MEDIA_URL_PREFIX = '/img/';

/** The photo API (all handlers require an admin session). */
export const MEDIA_API = '/api/tina/media/';
export const MEDIA_PREVIEW_API = '/api/tina/media/preview/';

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
/** Largest file the server stores. Vercel functions reject request bodies over about 4.5 MB. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** The browser shrinks photos to fit under this before uploading. */
export const CLIENT_TARGET_BYTES = Math.floor(3.5 * 1024 * 1024);
/** Longest edge, in pixels, after the browser shrinks a photo. */
export const MAX_EDGE = 2400;
export const WEBP_QUALITY = 0.82;
/** Photos accepted in one upload action (each is its own request). */
export const MAX_FILES_PER_BATCH = 10;

/** Used by code (not content), so never deletable from the editor. */
export const PROTECTED_FILES = ['emblem.png'];
