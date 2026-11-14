/* Tile dissolve (after lucid's field-to-white tiles): a grid over the viewport whose squares change
   one by one in a fixed random order, scrubbed by the scroll. */

export const TILE = { desktop: 180, phone: 104 };
/** tile starts are spread over the first 78% of the scroll; each tile takes 20% (all done by 98%) */
const SPREAD = .78, FADE = .2;

export type Tile = { left: number; top: number; w: number; h: number };

/** squares covering a W × H box from the top left, edges on whole pixels so neighbours meet without seams */
export function grid(W: number, H: number, size: number): Tile[] {
  const out: Tile[] = [];
  for (let r = 0, rows = Math.ceil(H / size); r < rows; r++) for (let c = 0, cols = Math.ceil(W / size); c < cols; c++) {
    const left = Math.round(c * size), top = Math.round(r * size);
    out.push({ left, top, w: Math.round((c + 1) * size) - left, h: Math.round((r + 1) * size) - top });
  }
  return out;
}

/** the same shuffle on every visit (Park–Miller, seed 7): rank[i] is when tile i turns */
export function order(n: number): number[] {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const ranks = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [ranks[i], ranks[j]] = [ranks[j], ranks[i]]; }
  return ranks;
}

/** how far tile i has turned (0 → 1) at scroll progress q */
export function turned(q: number, rank: number, n: number): number {
  return Math.min(1, Math.max(0, (q - SPREAD * rank / Math.max(1, n - 1)) / FADE));
}
