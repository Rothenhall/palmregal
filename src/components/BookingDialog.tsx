'use client';
import { useEffect, useRef, useState } from 'react';
import { bookingLink, todayISO } from '@/lib/book';
import { Icon } from './Icons';

const ADULTS = [1, 2, 3, 4, 5, 6];
const CHILDREN = [0, 1, 2, 3, 4];

function nextDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const n = new Date(y, m - 1, d + 1);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/**
 * The stay picker behind every "Book direct" and "Check availability" button (any link with
 * `data-book`). The guest picks dates and party size here, then goes to the booking engine with
 * those filled in. Without JavaScript the links still lead to the booking engine itself.
 */
export function BookingDialog({ bookingUrl }: { bookingUrl: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [min, setMin] = useState('');
  const [v, setV] = useState({ checkIn: '', checkOut: '', adults: 2, children: 0 });
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!bookingUrl) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[data-book]');
      if (!a) return;
      e.preventDefault();
      const today = todayISO();
      setMin(today);
      setV(s => (s.checkIn && s.checkIn >= today ? s : { ...s, checkIn: today, checkOut: nextDay(today) }));
      setErr('');
      ref.current?.showModal();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [bookingUrl]);

  if (!bookingUrl) return null;

  const onIn = (checkIn: string) => {
    setErr('');
    setV(s => ({ ...s, checkIn, checkOut: checkIn && (!s.checkOut || s.checkOut <= checkIn) ? nextDay(checkIn) : s.checkOut }));
  };

  return (
    <dialog ref={ref} className="bk" aria-labelledby="bk-h" onClick={e => { if (e.target === e.currentTarget) ref.current?.close(); }}>
      <form className="bk-in" method="dialog" noValidate onSubmit={e => {
        e.preventDefault();
        if (!v.checkIn) return setErr('Choose a check-in date.');
        if (v.checkIn < min) return setErr('Check-in cannot be in the past.');
        if (!v.checkOut || v.checkOut <= v.checkIn) return setErr('Choose a check-out date after check-in.');
        window.location.href = bookingLink(v, bookingUrl);
      }}>
        <button type="button" className="bk-x" aria-label="Close" onClick={() => ref.current?.close()}>×</button>
        <p className="eyebrow">Book direct</p>
        <h2 id="bk-h">Choose <em>your stay.</em></h2>
        <div className="bk-grid">
          <div className="f"><label htmlFor="bk-in">Check-in</label><input id="bk-in" type="date" required min={min} value={v.checkIn} onChange={e => onIn(e.target.value)} aria-describedby="bk-err" /></div>
          <div className="f"><label htmlFor="bk-out">Check-out</label><input id="bk-out" type="date" required min={v.checkIn ? nextDay(v.checkIn) : min} value={v.checkOut} onChange={e => { setErr(''); setV({ ...v, checkOut: e.target.value }); }} aria-describedby="bk-err" /></div>
          <div className="f"><label htmlFor="bk-a">Adults</label><select id="bk-a" value={v.adults} onChange={e => setV({ ...v, adults: Number(e.target.value) })}>{ADULTS.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          <div className="f"><label htmlFor="bk-c">Children</label><select id="bk-c" value={v.children} onChange={e => setV({ ...v, children: Number(e.target.value) })}>{CHILDREN.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
        </div>
        <p className="err" id="bk-err" role={err ? 'alert' : undefined}>{err}</p>
        <button className="btn btn--book" type="submit">Check availability <Icon id="i-arrow" /></button>
        <p className="bk-note">You&apos;ll continue to our secure booking page with these details filled in.</p>
      </form>
    </dialog>
  );
}
