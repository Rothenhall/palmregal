'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';
import { GUESTS, send, useDates } from './BookForm';
import { bookingMessage } from '@/lib/book';
import { canLiquid, isFine } from '@/lib/env';

export function BookPill() {
  const path = usePathname();
  const [show, setShow] = useState(false); const [open, setOpen] = useState(false);
  const d = useDates(); const [guests, setGuests] = useState('2 guests'); const [note, setNote] = useState('Your dates go straight to the resort.');
  const cv = useRef<HTMLCanvasElement>(null); const btn = useRef<HTMLButtonElement>(null); const pill = useRef<HTMLDivElement>(null);
  const morph = useRef<((s: boolean) => void) | null>(null);
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const check = () => {
      const book = document.getElementById('book'), foot = document.querySelector('.foot');
      const past = book ? book.getBoundingClientRect().bottom < 60 : window.scrollY > 520;
      const beforeFoot = !foot || foot.getBoundingClientRect().top > innerHeight * .6;
      setShow(past && beforeFoot);
    };
    check(); addEventListener('scroll', check, { passive: true });
    return () => removeEventListener('scroll', check);
  }, [path]);

  useEffect(() => {
    morph.current?.(show);
    if (!show) { setOpen(false); setDelayed(false); return; }
    const t = setTimeout(() => setDelayed(true), document.documentElement.classList.contains('gl-pill') ? 380 : 0);
    return () => clearTimeout(t);
  }, [show]);

  /* the pill as a liquid-glass drop: falls in, then stretches into shape (desktop only) */
  useEffect(() => {
    if (!canLiquid() || !isFine()) return;
    let alive = true, dispose = () => {};
    (async () => {
      const THREE = await import('three'); const { gsap } = await import('gsap'); const S = await import('@/lib/shaders');
      if (!alive || !cv.current || !btn.current) return;
      let pr: any; try { pr = new THREE.WebGLRenderer({ canvas: cv.current, alpha: true, antialias: false }); } catch { return; }
      const html = document.documentElement; html.classList.add('gl-pill');
      pr.setPixelRatio(Math.min(devicePixelRatio, 2));
      const ps = new THREE.Scene(), cam = new THREE.OrthographicCamera(-.5, .5, .5, -.5, -1, 1);
      const pu: any = { uSize: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uBox: { value: new THREE.Vector2(1, 1) }, uM: { value: 0 } };
      ps.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: pu, vertexShader: S.VS, fragmentShader: S.PILL, transparent: true, depthTest: false })));
      const size = () => { const c = cv.current!, b = btn.current!; const w = c.clientWidth, h = c.clientHeight; if (!w) return; pr.setSize(w, h, false); pu.uSize.value.set(w, h); pu.uBox.value.set(b.offsetWidth, b.offsetHeight); };
      size(); addEventListener('resize', size);
      morph.current = (s: boolean) => { gsap.killTweensOf(pu.uM); size(); gsap.to(pu.uM, s ? { value: 1, duration: 1.3, ease: 'elastic.out(1,.75)' } : { value: 0, duration: .45, ease: 'power2.in' }); };
      if (pill.current?.classList.contains('show')) morph.current(true);
      const t0 = performance.now(); let drawn = false;
      const tick = () => { const live = pu.uM.value > .001; if (!live && !drawn) return; pu.uTime.value = (performance.now() - t0) / 1000; pr.render(ps, cam); drawn = live; };
      gsap.ticker.add(tick);
      dispose = () => { gsap.ticker.remove(tick); removeEventListener('resize', size); pr.dispose(); html.classList.remove('gl-pill'); morph.current = null; };
    })();
    return () => { alive = false; dispose(); };
  }, []);

  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);

  return (
    <div className={show && delayed ? 'lpill show' : 'lpill'} ref={pill}>
      {open && (
        <form className="lpanel" noValidate onSubmit={e => {
          e.preventDefault();
          if (!d.checkIn || !d.checkOut) { setNote('Choose your dates first.'); return; }
          const via = send(bookingMessage({ checkIn: d.checkIn, checkOut: d.checkOut, guests }));
          setNote(`Ready to send to the resort by ${via}.`);
        }}>
          <div className="fld"><label htmlFor="p-in">Check-in</label><input id="p-in" type="date" min={d.min} value={d.checkIn} onChange={e => d.onIn(e.target.value)} autoFocus /></div>
          <div className="fld"><label htmlFor="p-out">Check-out</label><input id="p-out" type="date" min={d.checkIn || d.min} value={d.checkOut} onChange={e => d.setOut(e.target.value)} /></div>
          <div className="fld full"><label htmlFor="p-g">Guests</label><select id="p-g" value={guests} onChange={e => setGuests(e.target.value)}>{GUESTS.map(g => <option key={g}>{g}</option>)}</select></div>
          <button className="btn btn--book" type="submit">Send my dates</button>
          <p role="status">{note}</p>
        </form>
      )}
      <button ref={btn} className="lpill-btn" type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} tabIndex={show ? 0 : -1}>
        <span>Check availability<small>Straight to the resort, no middleman</small></span>
        <span className="go"><Icon id="i-cal" />Book direct</span>
        <canvas id="pillGl" ref={cv} aria-hidden="true" />
      </button>
    </div>
  );
}
