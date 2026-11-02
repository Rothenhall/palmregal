'use client';
import { useState } from 'react';
import { GUESTS, SUITE_OPTS, send, useDates } from './BookForm';
import { bookingMessage } from '@/lib/book';
import { Icon } from './Icons';

export function EnquiryForm() {
  const d = useDates();
  const [v, setV] = useState({ name: '', phone: '', guests: '2 guests', suite: 'Any suite', msg: '' });
  const [err, setErr] = useState<Record<string, string>>({}); const [done, setDone] = useState('');
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: e.target.value }); setErr({ ...err, [k]: '' }); };
  return (
    <form className="form" noValidate onSubmit={e => {
      e.preventDefault();
      const er: Record<string, string> = {};
      if (!v.name.trim()) er.name = 'Enter your name';
      if (!v.phone.trim()) er.phone = 'Enter a phone or WhatsApp number';
      setErr(er); if (Object.keys(er).length) { document.getElementById(er.name ? 'e-name' : 'e-phone')?.focus(); return; }
      const dates = d.checkIn && d.checkOut;
      const body = dates
        ? bookingMessage({ checkIn: d.checkIn, checkOut: d.checkOut, guests: v.guests, suite: v.suite, name: `${v.name} (${v.phone})`, note: v.msg })
        : `Hello Palm Regal,\n${v.msg || 'I would like to know more about a stay.'}\n${v.guests}${v.suite !== 'Any suite' ? ', ' + v.suite : ''}\nThank you, ${v.name} (${v.phone})`;
      const via = send(body);
      setDone(`Your enquiry is ready to send by ${via}. The resort replies from ${via === 'email' ? 'palmregalresort@gmail.com' : 'its WhatsApp number'}.`);
    }}>
      <div className="form-head"><p className="eyebrow">Or write to us</p><h2>Send an <em>enquiry.</em></h2></div>
      <div className="f"><label htmlFor="e-name">Name</label><input id="e-name" autoComplete="name" value={v.name} onChange={set('name')} aria-invalid={!!err.name} aria-describedby="e-name-err" /><span className="err" id="e-name-err">{err.name}</span></div>
      <div className="f"><label htmlFor="e-phone">Phone or WhatsApp</label><input id="e-phone" type="tel" autoComplete="tel" value={v.phone} onChange={set('phone')} aria-invalid={!!err.phone} aria-describedby="e-phone-err" /><span className="err" id="e-phone-err">{err.phone}</span></div>
      <div className="f"><label htmlFor="e-in">Check-in</label><input id="e-in" type="date" min={d.min} value={d.checkIn} onChange={e => d.onIn(e.target.value)} /></div>
      <div className="f"><label htmlFor="e-out">Check-out</label><input id="e-out" type="date" min={d.checkIn || d.min} value={d.checkOut} onChange={e => d.setOut(e.target.value)} /></div>
      <div className="f"><label htmlFor="e-g">Guests</label><select id="e-g" value={v.guests} onChange={set('guests')}>{GUESTS.map(g => <option key={g}>{g}</option>)}</select></div>
      <div className="f"><label htmlFor="e-suite">Suite</label><select id="e-suite" value={v.suite} onChange={set('suite')}>{SUITE_OPTS.map(g => <option key={g}>{g}</option>)}</select></div>
      <div className="f full"><label htmlFor="e-msg">Message</label><textarea id="e-msg" placeholder="Pets, special requests, arrival time" value={v.msg} onChange={set('msg')} /></div>
      <button className="btn btn--teal" type="submit">Send enquiry <Icon id="i-arrow" /></button>
      {done && <p className="done" role="status">{done}</p>}
    </form>
  );
}
