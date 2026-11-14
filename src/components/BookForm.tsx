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

