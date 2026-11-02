'use client';
/* Liquid Regal: one fixed canvas draws the photos (liquid reveals and changes, glass lenses),
   the heading companion drops and the footer water. Desktop gets everything; touch devices get
   the hero and the water; weak devices and reduced motion get none of it. */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { canLiquid, isFine } from '@/lib/env';

type Any = any;

export function LiquidLayer() {
  const path = usePathname();

  useEffect(() => {
    if (!canLiquid()) return;
    let alive = true; let cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      const { gsap } = await import('gsap');
      const S = await import('@/lib/shaders');
      if (!alive) return;
      const html = document.documentElement, fine = isFine();
      const canvas = document.getElementById('gl') as HTMLCanvasElement;
      let renderer: Any;
      try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' }); } catch { return; }
      html.classList.add('gl-on');
      renderer.setPixelRatio(Math.min(devicePixelRatio, fine ? 1.75 : 1.25));
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
      const geo = new THREE.PlaneGeometry(1, 1);
      const t0 = performance.now();
      const base = () => ({ uSize: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 } });
      const loader = new THREE.TextureLoader(); const cache: Record<string, Promise<Any>> = {};
      const prep = (t: Any) => { t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; };
      const pc = document.createElement('canvas'); pc.width = 1000; pc.height = 1100; const pg = pc.getContext('2d')!;
      const placeholder = prep(new THREE.CanvasTexture(pc));
      const drawPh = () => { const g = pg.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#21465E'); g.addColorStop(1, '#193F47'); pg.fillStyle = g; pg.fillRect(0, 0, 1000, 1100); pg.fillStyle = 'rgba(180,228,228,.8)'; pg.font = '300 64px Fraunces, Georgia, serif'; pg.textAlign = 'center'; pg.fillText('Photo to come', 500, 570); placeholder.needsUpdate = true; };
      drawPh(); document.fonts?.ready.then(drawPh);
      const tex = (src: string): Promise<Any> => {
        if (src === 'placeholder') return Promise.resolve(placeholder);
        if (!cache[src]) cache[src] = new Promise(res => loader.load(src, t => res(prep(t)), undefined, () => res(null)));
        return cache[src];
      };
      const addMesh = (fs: string, u: Any, order: number) => { const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: S.VS, fragmentShader: fs, transparent: true, depthWrite: false, depthTest: false })); m.renderOrder = order; scene.add(m); return m; };
      const place = (m: Any, x: number, y: number, w: number, h: number, W: number, H: number) => { m.position.set(x + w / 2 - W / 2, H / 2 - (y + h / 2), 0); m.scale.set(w, h, 1); };
      const radii = (el: Element) => { const cs = getComputedStyle(el); return [parseFloat(cs.borderTopLeftRadius) || 0, parseFloat(cs.borderBottomLeftRadius) || 0]; };

      type Item = Any;
      const items: Item[] = [];
      const offs: (() => void)[] = [];
      const on = (el: EventTarget, ev: string, fn: Any, opt?: Any) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };

      function setOrigin(it: Item) { const r = it.el.getBoundingClientRect(); if (it.lens && it.u.uDropAmt.value > .3) it.u.uOrigin.value.copy(it.pos); else it.u.uOrigin.value.set(r.width * .5, r.height * .5); }
      function wipe(it: Item, src: string) {
        it.want = src; if (it.busy || src === it.cur) return; it.busy = true;
        tex(src).then(t => {
          if (!t) { it.busy = false; return; } const u = it.u;
          u.uA.value = u.uB.value; u.uAspA.value = u.uAspB.value; u.uHasA.value = u.uA.value ? 1 : 0; u.uZoomA.value = u.uZoomB.value;
          u.uB.value = t; u.uAspB.value = t.image.width / t.image.height; u.uHasB.value = 1; u.uP.value = 0; setOrigin(it);
          if (it.kind === 'hero') { gsap.killTweensOf(u.uZoomB); u.uZoomB.value = 1.08; gsap.to(u.uZoomB, { value: 1, duration: 8, ease: 'none' }); } else u.uZoomB.value = it.zoom;
          gsap.to(u.uP, { value: 1, duration: 1.5, ease: 'power2.inOut', onComplete: () => { it.cur = src; it.busy = false; if (it.want !== it.cur) wipe(it, it.want); } });
        });
      }
      function reveal(it: Item) { if (!it.ready) { it.pending = true; return; } it.pending = false; it.revealed = true; it.u.uHasA.value = 0; setOrigin(it); gsap.fromTo(it.u.uP, { value: 0 }, { value: 1, duration: 1.6, ease: 'power2.out' }); }
      function srcOf(el: HTMLElement) {
        if (el.dataset.src) return el.dataset.src;
        const im = (el.querySelector('img.on') || el.querySelector('img')) as HTMLImageElement | null;
        return im ? im.getAttribute('src')! : 'placeholder';
      }
      function makePhoto(el: HTMLElement) {
        const kind = el.dataset.gl!; if (kind === 'water') return; if (!fine && kind !== 'hero') return;
        const isHero = kind === 'hero', depth = +(el.dataset.depth || 0), zoom = depth ? 1 + Math.abs(depth) / 1200 + .02 : 1, rr = radii(el);
        const u = Object.assign(base(), { uA: { value: null }, uB: { value: null }, uHasA: { value: 0 }, uHasB: { value: 1 }, uP: { value: isHero ? 1 : 0 }, uZoomA: { value: zoom }, uZoomB: { value: zoom }, uAspA: { value: 1.5 }, uAspB: { value: 1.5 }, uShift: { value: 0 }, uRadT: { value: rr[0] }, uRadB: { value: rr[1] }, uDropAmt: { value: 0 }, uLife: { value: isHero ? 1 : 0 }, uOrigin: { value: new THREE.Vector2() }, uDrop: { value: new THREE.Vector3() } });
        const it: Item = { el, kind, u, mesh: addMesh(S.PHOTO, u, 1), depth, zoom, lens: isHero || el.hasAttribute('data-lens'), over: false, ptr: new THREE.Vector2(), pos: new THREE.Vector2(-1, -1), revealed: isHero, ready: false, pending: false, busy: false, cur: null, want: null };
        const src = srcOf(el); it.cur = it.want = src;
        tex(src).then(t => { if (!t || !alive) return; u.uB.value = t; u.uAspB.value = t.image.width / t.image.height; it.ready = true; el.classList.add('gl-ready'); if (isHero) gsap.fromTo(u.uZoomB, { value: 1.1 }, { value: 1, duration: 8, ease: 'none' }); if (it.pending) reveal(it); });
        el.querySelectorAll('img').forEach(im => tex(im.getAttribute('src')!));
        if (fine && it.lens) {
          on(el, 'pointermove', (e: PointerEvent) => { const r = el.getBoundingClientRect(); it.ptr.set(e.clientX - r.left, r.bottom - e.clientY); if (!isHero && u.uDropAmt.value < .05) it.pos.copy(it.ptr); it.over = true; });
          on(el, 'pointerleave', () => { it.over = false; });
        }
        /* components ask for a new photo with a cancelable "gl:src" event; cancelling means "the liquid layer has it" */
        on(el, 'gl:src', (e: CustomEvent) => { if (!it.ready) return; e.preventDefault(); wipe(it, e.detail.src); });
        items.push(it);
      }
      let beads: Any[] = [], water: Any = null;
      const range = document.createRange();
      const BG: Record<string, number[]> = { dawn: [.957, .973, .953], dusk: [.047, .145, .173], mint: [.933, .961, .949], sage: [.863, .922, .894], teal: [.098, .247, .278], canopy: [.18, .369, .263], night: [.063, .18, .216] };
      const bgOf = (el: Element) => { const s = el.closest('[data-bg]') as HTMLElement | null; return new THREE.Vector3(...(BG[s?.dataset.bg || 'mint'] || BG.mint)); };
      const lastText = (el: Element) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let last: Text | null = null, n: Node | null; while ((n = w.nextNode())) if (n.textContent!.trim()) last = n as Text; return last; };
      let io: IntersectionObserver, bio: IntersectionObserver;

      function scan() {
        items.splice(0).forEach(i => scene.remove(i.mesh)); beads.splice(0).forEach(b => scene.remove(b.mesh)); if (water) { scene.remove(water.mesh); water = null; }
        offs.splice(0).forEach(f => f()); io?.disconnect(); bio?.disconnect();
        document.querySelectorAll<HTMLElement>('[data-gl]').forEach(makePhoto);
        io = new IntersectionObserver(es => es.forEach(en => { const it = items.find(i => i.el === en.target); if (it && en.isIntersecting && !it.revealed) { reveal(it); io.unobserve(it.el); } }), { threshold: .08, rootMargin: '0px 0px -6% 0px' });
        items.filter(i => !i.revealed).forEach(i => io.observe(i.el));
        if (fine) document.querySelectorAll<HTMLElement>('h2[data-drop], h1[data-drop]').forEach((h, i) => { const u = Object.assign(base(), { uBg: { value: bgOf(h) }, uR: { value: 8 }, uAmt: { value: 0 }, uSeed: { value: i * 1.7 } }); beads.push({ h, u, mesh: addMesh(S.BEAD, u, 2), i, fs: parseFloat(getComputedStyle(h).fontSize) }); });
        bio = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const b = beads.find(x => x.h === en.target); if (!b) return; bio.unobserve(b.h); gsap.to(b.u.uAmt, { value: 1, duration: 1.6, delay: .85, ease: 'elastic.out(1,.55)' }); }), { rootMargin: '0px 0px -12% 0px' });
        beads.forEach(b => bio.observe(b.h));
        const wEl = document.querySelector<HTMLElement>('[data-gl="water"]');
        if (wEl) {
          const u = Object.assign(base(), { uMouse: { value: new THREE.Vector2(-999, -999) }, uRip: { value: 0 } }); water = { el: wEl, u, mesh: addMesh(S.WATER, u, 0), ripT: 0 };
          if (fine) { on(wEl, 'pointermove', (e: PointerEvent) => { const r = wEl.getBoundingClientRect(); u.uMouse.value.set(e.clientX - r.left, r.bottom - e.clientY); water.ripT = 1; }); on(wEl, 'pointerleave', () => { water.ripT = 0; }); }
        }
      }
      (window as Any).__glScan = scan;

      const resize = () => { const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2; camera.updateProjectionMatrix(); beads.forEach(b => b.fs = parseFloat(getComputedStyle(b.h).fontSize)); items.forEach(it => { if (it.kind !== 'hero') { const r = radii(it.el); it.u.uRadT.value = r[0]; it.u.uRadB.value = r[1]; } }); };
      scan(); resize(); addEventListener('resize', resize);
      const drift = new THREE.Vector2();
      const frame = () => {
        const t = (performance.now() - t0) / 1000, W = innerWidth, H = innerHeight;
        for (const it of items) {
          const r = it.el.getBoundingClientRect(), u = it.u; const vis = r.bottom > -50 && r.top < H + 50 && r.width > 0; it.mesh.visible = vis; if (!vis) continue;
          place(it.mesh, r.left, r.top, r.width, r.height, W, H); u.uSize.value.set(r.width, r.height); u.uTime.value = t;
          if (it.kind === 'hero') { const rr = radii(it.el); u.uRadT.value = rr[0]; u.uRadB.value = rr[1]; }
          if (it.depth) { const c = (r.top + r.height / 2 - H / 2) / H; u.uShift.value = Math.max(-1, Math.min(1, c)) * Math.sign(it.depth) * (it.zoom - 1) * .45; }
          if (it.lens) {
            let R: number, target: number;
            if (it.kind === 'hero') {
              const p = parseFloat(it.el.dataset.p ?? '1'); R = Math.max(80, Math.min(170, r.width * .085));
              if (!it.over) it.ptr.copy(drift.set(r.width * (.74 + .07 * Math.sin(t * .19)), r.height * (.5 + .09 * Math.sin(t * .13 + 1.3))));
              target = Math.max(0, Math.min(1, (p - .6) / .35));
            } else { R = Math.max(48, Math.min(84, Math.min(r.width, r.height) * .16)); target = it.over ? 1 : 0; }
            if (it.pos.x < 0) it.pos.copy(it.ptr);
            it.pos.lerp(it.ptr, it.kind === 'hero' ? .045 : .16);
            u.uDropAmt.value += (target - u.uDropAmt.value) * .09;
            u.uDrop.value.set(it.pos.x, it.pos.y, R);
          }
        }
        for (const b of beads) {
          const hr = b.h.getBoundingClientRect(); const vis = b.u.uAmt.value > .001 && hr.bottom > -60 && hr.top < H + 60; b.mesh.visible = vis; if (!vis) continue;
          const tn = lastText(b.h); if (!tn) { b.mesh.visible = false; continue; }
          let end = tn.textContent!.length; while (end > 1 && /\s/.test(tn.textContent![end - 1])) end--;
          range.setStart(tn, end - 1); range.setEnd(tn, end); const rr = range.getBoundingClientRect();
          const R = Math.max(7, b.fs * .16), Sz = R * 4.4;
          const cx = rr.right + R * 1.3, cy = rr.top + rr.height * .42 + Math.sin(t * 1.2 + b.i) * 1.6;
          place(b.mesh, cx - Sz / 2, cy - Sz / 2, Sz, Sz, W, H); b.u.uSize.value.set(Sz, Sz); b.u.uR.value = R; b.u.uTime.value = t;
        }
        if (water) { const r = water.el.getBoundingClientRect(), u = water.u; const vis = r.bottom > 0 && r.top < H; water.mesh.visible = vis; if (vis) { place(water.mesh, r.left, r.top, r.width, r.height, W, H); u.uSize.value.set(r.width, r.height); u.uTime.value = t; u.uRip.value += (water.ripT - u.uRip.value) * .05; } }
        renderer.render(scene, camera);
      };
      gsap.ticker.add(frame);
      cleanup = () => { gsap.ticker.remove(frame); removeEventListener('resize', resize); offs.forEach(f => f()); io?.disconnect(); bio?.disconnect(); renderer.dispose(); html.classList.remove('gl-on'); delete (window as Any).__glScan; };
    })();
    return () => { alive = false; cleanup(); };
  }, []);

  /* rescan after each client-side navigation */
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => (window as Any).__glScan?.()));
    return () => cancelAnimationFrame(id);
  }, [path]);

  return <canvas id="gl" aria-hidden="true" />;
}
