/* Palm silhouettes for the hero scene, generated once at build time */
type Pt = [number, number];
const f = (n: number) => n.toFixed(1);

function frond(cx: number, cy: number, ang: number, len: number, bend: number, width = .4) {
  let out = '';
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 26; i++) { const t = i / 26, a = ang + bend * t * t; pts.push([cx + Math.cos(a) * len * t, cy + Math.sin(a) * len * t, a]); }
  out += `<path d="M${pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')}" stroke="currentColor" stroke-width="${(len / 90).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  pts.forEach((p, i) => {
    if (i < 2 || i > 25) return;
    const t = i / 26, l = len * width * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - t * .35);
    [1, -1].forEach(s => {
      const a = p[2] + s * (1.15 - t * .3) + .45 * t, x2 = p[0] + Math.cos(a) * l, y2 = p[1] + Math.sin(a) * l + l * .35;
      /* a solid, slightly drooping leaflet: two curves either side of its centre line */
      const mx = (p[0] + x2) / 2, my = (p[1] + y2) / 2, dx = x2 - p[0], dy = y2 - p[1], dl = Math.hypot(dx, dy) || 1, px = -dy / dl, py = dx / dl, wv = l * .11;
      out += `<path d="M${f(p[0])} ${f(p[1])} Q${f(mx + px * wv)} ${f(my + py * wv + l * .06)} ${f(x2)} ${f(y2)} Q${f(mx - px * wv * .5)} ${f(my - py * wv * .5 + l * .06)} ${f(p[0])} ${f(p[1])}" fill="currentColor"/>`;
    });
  });
  return out;
}

function trunk(base: Pt, top: Pt, bow: number, w0: number, w1: number) {
  const N = 30, L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = base[0] + (top[0] - base[0]) * t + Math.sin(t * Math.PI) * bow, y = base[1] + (top[1] - base[1]) * t;
    const dx = (top[0] - base[0]) + Math.cos(t * Math.PI) * Math.PI * bow, dy = top[1] - base[1], len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len, w = (w0 + (w1 - w0) * t) / 2 * (1 + .08 * Math.sin(i * 1.7));
    L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]);
  }
  return `<path d="M${L.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} L${R.reverse().map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z" fill="currentColor"/>`;
}

export type Palm = { base: Pt; top: Pt; bow: number; size: number; tilt: number; dur: number };
export const PALMS: Palm[] = [
  { base: [70, 960], top: [190, 330], bow: -36, size: .82, tilt: 0, dur: 7 },
  { base: [-20, 960], top: [24, 470], bow: 26, size: .66, tilt: .3, dur: 8.5 },
  { base: [1400, 960], top: [1300, 360], bow: 30, size: .78, tilt: Math.PI, dur: 7.8 },
  { base: [1480, 960], top: [1440, 540], bow: -18, size: .56, tilt: Math.PI, dur: 9 },
];

export function palmCrown(p: Palm) {
  const [cx, cy] = p.top, L = 260 * p.size;
  const angles = [-2.9, -2.35, -1.75, -1.15, -.55, .05, .55, 2.6, 3.4];
  return angles.map((a, i) => frond(cx, cy, a, L * (.78 + (i % 3) * .12), (a > -1.57 ? .9 : -.9) * (.5 + (i % 2) * .25))).join('') +
    `<circle cx="${cx}" cy="${cy + 6}" r="${14 * p.size}" fill="currentColor"/>`;
}
export const palmTrunk = (p: Palm) => trunk(p.base, p.top, p.bow, 34 * p.size, 16 * p.size);
