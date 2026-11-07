'use client';
/* Liquid Regal: the moving water under the footer, rippling where the pointer passes on desktop.
   The canvas lives inside the water strip and is sized to it, and it only draws while the strip is
   on screen, so the rest of the page never pays for it. Weak devices and reduced motion keep the
   CSS gradient underneath. */
import { useEffect, useRef } from 'react';
import { canLiquid, isFine } from '@/lib/env';

export function LiquidLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canLiquid()) return;
    const canvas = ref.current!, el = canvas.parentElement!;
    let alive = true, cleanup = () => {};
    (async () => {
      const THREE = await import('three');
      const { gsap } = await import('gsap');
      const S = await import('@/lib/shaders');
      if (!alive) return;
      const fine = isFine();
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' }); } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-.5, .5, .5, -.5, -1, 1);
      const u = {
        uSize: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(-999, -999) }, uRip: { value: 0 },
      };
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
        uniforms: u, vertexShader: S.VS, fragmentShader: S.WATER, depthWrite: false, depthTest: false,
      })));

      /* the pointer stirs the water; the ripple eases in and out rather than switching */
      let ripple = 0;
      const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); u.uMouse.value.set(e.clientX - r.left, r.bottom - e.clientY); ripple = 1; };
      const leave = () => { ripple = 0; };
      if (fine) { el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave); }

      const size = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height, false); u.uSize.value.set(width, height);
      });
      size.observe(el);

      const t0 = performance.now();
      const frame = () => {
        u.uTime.value = (performance.now() - t0) / 1000;
        u.uRip.value += (ripple - u.uRip.value) * .05;
        renderer.render(scene, camera);
      };
      let running = false;
      const seen = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !running) { running = true; gsap.ticker.add(frame); canvas.classList.add('on'); }
        else if (!entry.isIntersecting && running) { running = false; gsap.ticker.remove(frame); }
      });
      seen.observe(el);

      cleanup = () => {
        gsap.ticker.remove(frame); seen.disconnect(); size.disconnect();
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
        renderer.dispose(); canvas.classList.remove('on');
      };
    })();
    return () => { alive = false; cleanup(); };
  }, []);

  return <canvas ref={ref} className="water-gl" aria-hidden="true" />;
}
