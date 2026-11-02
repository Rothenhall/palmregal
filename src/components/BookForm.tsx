'use client';
import { useEffect, useState } from 'react';
import { suites } from '@/content/site';
import { bookingMessage, sendLink, todayISO } from '@/lib/book';

export const GUESTS = ['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6+ guests'];
export const SUITE_OPTS = ['Any suite', ...suites.map(s => s.name)];

export function useDates() {
  const [min, setMin] = useState('');
  const [checkIn, setIn] = useState(''); const [checkOut, setOut] = useState('');
  useEffect(() => setMin(todayISO()), []);
  const onIn = (v: string) => {
    setIn(v);
    if (v) { const d = new Date(v); d.setDate(d.getDate() + 1); const n = d.toISOString().slice(0, 10); if (!checkOut || checkOut <= v) setOut(n); }
  };
  return { min, checkIn, checkOut, onIn, setOut };
}

export function send(message: string) {
  const l = sendLink(message);
  if (l.via === 'WhatsApp') window.open(l.href, '_blank', 'noopener'); else window.location.href = l.href;
  return l.via;
}

export function BookBar() {
  const d = useDates(); const [guests, setGuests] = useState('2 guests'); const [suite, setSuite] = useState('Any suite');
  const [msg, setMsg] = useState('');
  return (
    <>
      <form className="bookbar" noValidate onSubmit={e => {
        e.preventDefault();
        if (!d.checkIn || !d.checkOut) { setMsg('Choose your check-in and check-out dates first.'); (document.getElementById(d.checkIn ? 'b-out' : 'b-in') as HTMLInputElement)?.focus(); return; }
        const via = send(bookingMessage({ checkIn: d.checkIn, checkOut: d.checkOut, guests, suite }));
        setMsg(`Your dates are ready to send to the resort by ${via}.`);
      }}>
        <div className="fld"><label htmlFor="b-in">Check-in</label><input id="b-in" type="date" min={d.min} value={d.checkIn} onChange={e => d.onIn(e.target.value)} /></div>
        <div className="fld"><label htmlFor="b-out">Check-out</label><input id="b-out" type="date" min={d.checkIn || d.min} value={d.checkOut} onChange={e => d.setOut(e.target.value)} /></div>
        <div className="fld"><label htmlFor="b-g">Guests</label><select id="b-g" value={guests} onChange={e => setGuests(e.target.value)}>{GUESTS.map(g => <option key={g}>{g}</option>)}</select></div>
        <div className="fld"><label htmlFor="b-s">Suite</label><select id="b-s" value={suite} onChange={e => setSuite(e.target.value)}>{SUITE_OPTS.map(g => <option key={g}>{g}</option>)}</select></div>
        <button className="btn btn--book" type="submit">Book direct</button>
      </form>
      {msg && <p className="book-out" role="status">{msg}</p>}
    </>
  );
}
