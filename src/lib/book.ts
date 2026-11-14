import type { General } from '@/content/types';

type Contact = Pick<General, 'whatsapp' | 'email' | 'bookingUrl'>;

/** Draft mode shows the orange "to confirm" tags and placeholder sections. Off unless NEXT_PUBLIC_DRAFT=true. */
export const DRAFT = process.env.NEXT_PUBLIC_DRAFT === 'true';

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
export function sendLink(message: string, site: Contact) {
  if (site.whatsapp) return { href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`, via: 'WhatsApp' };
  return { href: `mailto:${site.email}?subject=${encodeURIComponent('Booking enquiry')}&body=${encodeURIComponent(message)}`, via: 'email' };
}

/** Where every booking button leads: the resort's booking system once its URL is set, the enquiry form until then. */
export const bookHref = (site: Pick<General, 'bookingUrl'>) => site.bookingUrl || '/#contact';

/** The booking engine with the guest's stay filled in, so they do not enter it again there. */
export function bookingLink(o: { checkIn: string; checkOut: string; adults: number; children: number }, bookingUrl: string) {
  const q = new URLSearchParams({ checkin: o.checkIn, checkout: o.checkOut, adults: String(o.adults), children: String(o.children) });
  return `${bookingUrl}?${q}`;
}

export function waHref(site: Pick<General, 'whatsapp'>) {
  return site.whatsapp ? `https://wa.me/${site.whatsapp}` : '/#contact';
}

/** The tel: link for a phone number as it is written for guests, e.g. "+91 72059 70222". */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function todayISO(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
