import { site } from '@/content/site';

export const DRAFT = process.env.NEXT_PUBLIC_DRAFT !== 'false';

function fmt(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function bookingMessage(o: { checkIn: string; checkOut: string; guests: string; suite?: string; name?: string; note?: string }) {
  const lines = [
    'Hello Palm Regal,',
    `I would like to stay from ${fmt(o.checkIn)} to ${fmt(o.checkOut)}, ${o.guests}${o.suite && o.suite !== 'Any suite' ? ', ' + o.suite : ''}. Is it available?`,
  ];
  if (o.note) lines.push(o.note);
  if (o.name) lines.push(`Thank you, ${o.name}`);
  return lines.join('\n');
}

/** WhatsApp when the business number is set, otherwise email. */
export function sendLink(message: string) {
  if (site.whatsapp) return { href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`, via: 'WhatsApp' };
  return { href: `mailto:${site.email}?subject=${encodeURIComponent('Booking enquiry')}&body=${encodeURIComponent(message)}`, via: 'email' };
}

export function waHref() {
  return site.whatsapp ? `https://wa.me/${site.whatsapp}` : '/contact/';
}

export function todayISO(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
