'use client';
import { useState } from 'react';
import { GUESTS, SUITE_OPTS, send, useDates } from './BookForm';
import { bookingMessage } from '@/lib/book';
import { site } from '@/content/site';
import { Icon } from './Icons';

export function EnquiryForm() {
  const d = useDates();
  const [v, setV] = useState({ name: '', phone: '', guests: '2 guests', suite: 'Any suite', msg: '' });
  const [err, setErr] = useState<Record<string, string>>({}); const [done, setDone] = useState('');
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: e.target.value }); setErr({ ...err, [k]: '' }); };
  return (
    <form className="form" aria-labelledby="enquiry-h" noValidate onSubmit={e => {
      e.preventDefault();
      const er: Record<string, string> = {};
      if (!v.name.trim()) er.name = 'Enter your name';
      if (!v.phone.trim()) er.phone = 'Enter a phone or WhatsApp number';
      else if (!/^\+?[\d\s()-]+$/.test(v.phone.trim()) || v.phone.replace(/\D/g, '').length < 7 || v.phone.replace(/\D/g, '').length > 15) er.phone = 'Enter a valid phone number';
      if (d.checkIn || d.checkOut) {
        if (!d.checkIn) er.dates = 'Choose a check-in date too.';
        else if (d.checkIn < d.min) er.dates = 'Check-in cannot be in the past.';
        else if (!d.checkOut || d.checkOut <= d.checkIn) er.dates = 'Choose a check-out date after check-in.';
      }
      setErr(er);
      if (Object.keys(er).length) {
        if (er.dates) { const options = document.getElementById('enquiry-options') as HTMLDetailsElement; if (options) options.open = true; }
        document.getElementById(er.name ? 'e-name' : er.phone ? 'e-phone' : !d.checkIn || d.checkIn < d.min ? 'e-in' : 'e-out')?.focus();
        return;
      }
      const dates = d.checkIn && d.checkOut;
      const body = dates
        ? bookingMessage({ checkIn: d.checkIn, checkOut: d.checkOut, guests: v.guests, suite: v.suite, name: `${v.name} (${v.phone})`, note: v.msg })
        : `Hello Palm Regal,\n${v.msg || 'I would like to know more about a stay.'}\n${v.guests}${v.suite !== 'Any suite' ? ', ' + v.suite : ''}\nThank you, ${v.name} (${v.phone})`;
      const via = send(body);
      setDone(via === 'email' ? `Your email app will open with your enquiry. Send it to ${site.email}; reception will reply directly.` : 'Your enquiry is ready in WhatsApp. Send the message there and reception will reply directly.');
    }}>
      <div className="form-head"><p className="eyebrow">A note to reception</p><h3 id="enquiry-h">Let&apos;s plan <em>your stay.</em></h3></div>
      <div className="f"><label htmlFor="e-name">Your name</label><input id="e-name" autoComplete="name" required maxLength={120} value={v.name} onChange={set('name')} aria-invalid={!!err.name} aria-describedby="e-name-err" /><span className="err" id="e-name-err">{err.name}</span></div>
      <div className="f"><label htmlFor="e-phone">Phone or WhatsApp</label><input id="e-phone" type="tel" autoComplete="tel" required maxLength={30} value={v.phone} onChange={set('phone')} aria-invalid={!!err.phone} aria-describedby="e-phone-err" /><span className="err" id="e-phone-err">{err.phone}</span></div>
      <div className="f full"><label htmlFor="e-msg">What do you have in mind? (optional)</label><textarea id="e-msg" placeholder="A family holiday, a pet coming along, a special occasion…" maxLength={3000} value={v.msg} onChange={set('msg')} /></div>
      <details className="form-options" id="enquiry-options">
        <summary>Add dates &amp; suite preferences <span>Optional</span></summary>
        <div className="form-options-grid">
          <div className="f"><label htmlFor="e-in">Check-in</label><input id="e-in" type="date" min={d.min} value={d.checkIn} onChange={e => { d.onIn(e.target.value); setErr({ ...err, dates: '' }); }} aria-invalid={!!err.dates} aria-describedby="e-dates-err" /></div>
          <div className="f"><label htmlFor="e-out">Check-out</label><input id="e-out" type="date" min={d.checkIn || d.min} value={d.checkOut} onChange={e => { d.setOut(e.target.value); setErr({ ...err, dates: '' }); }} aria-invalid={!!err.dates} aria-describedby="e-dates-err" /></div>
          <p className="err full" id="e-dates-err" role={err.dates ? 'alert' : undefined}>{err.dates}</p>
          <div className="f"><label htmlFor="e-g">Guests</label><select id="e-g" value={v.guests} onChange={set('guests')}>{GUESTS.map(g => <option key={g}>{g}</option>)}</select></div>
          <div className="f"><label htmlFor="e-suite">Suite</label><select id="e-suite" value={v.suite} onChange={set('suite')}>{SUITE_OPTS.map(g => <option key={g}>{g}</option>)}</select></div>
        </div>
      </details>
      <div className="enquiry-send"><button className="btn btn--teal" type="submit">{site.whatsapp ? 'Continue on WhatsApp' : 'Continue to email'} <Icon id="i-arrow" /></button><p>{site.whatsapp ? 'Send your message in WhatsApp. Reception confirms your stay directly.' : 'Opens your email app with your enquiry. Reception confirms your stay directly.'}</p></div>
      {done && <p className="done" role="status">{done}</p>}
    </form>
  );
}
