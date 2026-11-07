/** Scroll phases for the approved aerial -> balcony push-in -> dark fade -> bedroom edit.
 * This is a cinematic edit, not a reconstructed flight through a real window.
 */
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (start: number, end: number, n: number) => {
  const t = clamp((n - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** Map the courtyard balcony into the video's actual object-fit cover crop. */
export function heroFocus(width: number, height: number, mobile: boolean) {
  if (width <= 0 || height <= 0) return { x: .5, y: .5 };
  const source = mobile ? { w: 720, h: 1280, x: 157, y: 430 } : { w: 1920, h: 1080, x: 840, y: 365 };
  const scale = Math.max(width / source.w, height / source.h);
  return {
    x: clamp((source.x * scale - (source.w * scale - width) * .54) / width),
    y: clamp((source.y * scale - (source.h * scale - height) * .5) / height),
  };
}

export function heroArrival(progress: number, duration: number, mobile = false, focus = { x: .44, y: .34 }) {
  const p = clamp(Number.isFinite(progress) ? progress : 0);
  const end = Math.max(0, (Number.isFinite(duration) ? duration : 0) - 1 / 60);
  const approach = smooth(.34, .76, p);
  const scale = 1 + (mobile ? 1.3 : 2.15) * approach;
  // Keep the enlarged video covering the viewport while centring the balcony.
  const limit = (scale - 1) / 2;
  const shift = (target: number) => Math.max(-limit, Math.min(limit, (.5 - target) * scale * approach)) * 100;
  return {
    videoTime: clamp(p / .86) * end,
    aerialScale: scale,
    shiftX: shift(focus.x),
    shiftY: shift(focus.y),
    copyOpacity: 1 - smooth(.34, .48, p),
    veilOpacity: smooth(.76, .86, p),
    bedroomOpacity: smooth(.86, .97, p),
    shadeOpacity: 1 - .85 * smooth(.76, .86, p),
    room: p >= .97,
  };
}
