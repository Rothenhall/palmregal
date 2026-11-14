/* A weak, privacy-light device hash: a few stable browser traits plus a tiny canvas render, hashed with SHA-256.
   Never leaves the browser as raw values, and the server hashes it again. Loaded only with the chat panel. */
export async function fingerprint(): Promise<string> {
  const n = navigator as Navigator & { deviceMemory?: number };
  let canvas = '';
  try {
    const c = document.createElement('canvas'); c.width = 120; c.height = 30;
    const g = c.getContext('2d');
    if (g) { g.textBaseline = 'top'; g.font = '14px Arial'; g.fillStyle = '#f60'; g.fillRect(2, 2, 60, 20); g.fillStyle = '#069'; g.fillText('Palm Regal ⚓', 4, 6); canvas = c.toDataURL().slice(-80); }
  } catch {}
  const parts = [
    n.userAgent, n.language, n.languages?.join(','), n.platform, screen.width, screen.height, screen.colorDepth, devicePixelRatio,
    Intl.DateTimeFormat().resolvedOptions().timeZone, n.hardwareConcurrency, n.deviceMemory, n.maxTouchPoints, canvas,
  ].join('|');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts));
  return Array.from(new Uint8Array(buf)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}
