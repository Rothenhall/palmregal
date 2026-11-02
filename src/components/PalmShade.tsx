// Quiet palm-frond shadow for light sections (approved at about 5% opacity). Drawn once at build time.

function frond(cx: number, cy: number, ang: number, len: number, bend: number) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const a = ang + bend * t;
    pts.push([cx + Math.cos(a) * len * t, cy + Math.sin(a) * len * t, a]);
  }
  const f = (n: number) => n.toFixed(1);
  let out = `<path d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L")}" stroke="currentColor" stroke-width="5" fill="none"/>`;
  pts.forEach((p, i) => {
    if (i < 2 || i > 22) return;
    const t = i / 24;
    const l = len * 0.34 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    for (const s of [1, -1]) {
      const a = p[2] + s * 1.05 + 0.25 * t * s;
      const x2 = p[0] + Math.cos(a) * l, y2 = p[1] + Math.sin(a) * l;
      const mx = (p[0] + x2) / 2 + Math.cos(a + s * 1.4) * l * 0.12, my = (p[1] + y2) / 2 + Math.sin(a + s * 1.4) * l * 0.12;
      out += `<path d="M${f(p[0])} ${f(p[1])} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)} Q${f((p[0] + x2) / 2)} ${f((p[1] + y2) / 2)} ${f(p[0])} ${f(p[1])}" fill="currentColor"/>`;
    }
  });
  return out;
}

const fronds = frond(520, 40, 2.2, 520, 0.7) + frond(560, 90, 2.75, 470, 0.55) + frond(470, 10, 1.75, 430, 0.6) + frond(600, 190, 3.05, 380, 0.4);

export function PalmShade({ side = "right" }: { side?: "left" | "right" }) {
  return (
    <div className={`shade${side === "left" ? " left" : ""}`} aria-hidden>
      <svg viewBox="0 0 600 600" dangerouslySetInnerHTML={{ __html: fronds }} />
    </div>
  );
}
