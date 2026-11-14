/* Dates guests search for. Anonymous aggregate counters only: no cookie, no visitor id, no IP, no per-search record.
   Each search adds 1 to a handful of Redis hash fields (check-in day, nights, party size, lead time, search day). Server only. */
import { cmd, k, pipeline } from '@/lib/chat/redis';

const TTL = 18 * 31 * 86400; // about 18 months, refreshed on every search
const DAY = 86400_000;
const IST = 5.5 * 3600_000;

export type Search = { checkIn: string; checkOut: string; adults: number; children: number };

const ymd = (t: number) => new Date(t + IST).toISOString().slice(0, 10);
const utc = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export const LEAD_BUCKETS = ['0-7 days', '8-14 days', '15-30 days', '31-60 days', '61-90 days', '91+ days'] as const;
const leadBucket = (d: number) => (d <= 7 ? 0 : d <= 14 ? 1 : d <= 30 ? 2 : d <= 60 ? 3 : d <= 90 ? 4 : 5);

/** Returns a clean search or null. Dates must be real, from today (India) to 18 months ahead, for 1 to 30 nights. */
export function validate(raw: unknown, now = Date.now()): (Search & { nights: number; lead: number }) | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const re = /^\d{4}-\d{2}-\d{2}$/;
  const [i, o] = [String(r.i ?? r.checkIn ?? ''), String(r.o ?? r.checkOut ?? '')];
  if (!re.test(i) || !re.test(o)) return null;
  if (ymd(utc(i)) !== i || ymd(utc(o)) !== o) return null; // rejects 2026-02-31 and friends
  const today = utc(ymd(now));
  const lead = Math.round((utc(i) - today) / DAY);
  const nights = Math.round((utc(o) - utc(i)) / DAY);
  if (lead < 0 || lead > 548 || nights < 1 || nights > 30) return null;
  const adults = Number(r.a ?? r.adults), children = Number(r.c ?? r.children);
  if (!Number.isInteger(adults) || adults < 1 || adults > 10) return null;
  if (!Number.isInteger(children) || children < 0 || children > 10) return null;
  return { checkIn: i, checkOut: o, adults, children, nights, lead };
}

export async function recordSearch(s: Search & { nights: number; lead: number }, now = Date.now()) {
  const m = s.checkIn.slice(0, 7), sd = ymd(now);
  const keys = [k('ins', 'in', m), k('ins', 'sd', sd.slice(0, 7)), k('ins', 'nights'), k('ins', 'party'), k('ins', 'lead'), k('ins', 'total')];
  await pipeline([
    ['HINCRBY', keys[0], s.checkIn, 1], ['HINCRBY', keys[1], sd, 1], ['HINCRBY', keys[2], String(s.nights), 1],
    ['HINCRBY', keys[3], `${s.adults}-${s.children}`, 1], ['HINCRBY', keys[4], String(leadBucket(s.lead)), 1], ['INCR', keys[5]],
    ...keys.map(x => ['EXPIRE', x, TTL] as (string | number)[]),
  ]);
}

/* ---------- reading ---------- */

const hash = async (key: string): Promise<Record<string, number>> => {
  const all = ((await cmd('HGETALL', key)) as string[] | null) ?? [];
  const out: Record<string, number> = {};
  for (let i = 0; i < all.length; i += 2) out[all[i]] = Number(all[i + 1]);
  return out;
};

export type SearchInsights = {
  total: number;
  byDay: Record<string, number>;        // check-in date -> searches (next 6 months plus the current one)
  months: string[];                     // YYYY-MM, this month and the next 5
  top: { date: string; count: number }[];
  avgNights: number; nights: Record<string, number>;
  party: { adults: number; children: number; count: number }[]; typical: { adults: number; children: number } | null;
  lead: number[];                       // counts per LEAD_BUCKETS
  trend: { date: string; count: number }[]; // last 30 days
};

export async function readSearches(now = Date.now()): Promise<SearchInsights> {
  const today = ymd(now);
  const months: string[] = [];
  for (let i = 0; i < 6; i++) { const d = new Date(utc(today.slice(0, 7) + '-01')); d.setUTCMonth(d.getUTCMonth() + i); months.push(d.toISOString().slice(0, 7)); }
  const prev = ymd(now - 30 * DAY).slice(0, 7);
  const sdMonths = [...new Set([prev, today.slice(0, 7)])];
  const [totalRaw, nights, party, lead, ...rest] = await Promise.all([
    cmd('GET', k('ins', 'total')), hash(k('ins', 'nights')), hash(k('ins', 'party')), hash(k('ins', 'lead')),
    ...months.map(m => hash(k('ins', 'in', m))), ...sdMonths.map(m => hash(k('ins', 'sd', m))),
  ]);
  const byDay = Object.assign({}, ...rest.slice(0, months.length)) as Record<string, number>;
  const sd = Object.assign({}, ...rest.slice(months.length)) as Record<string, number>;
  const top = Object.entries(byDay).filter(([d]) => d >= today).map(([date, count]) => ({ date, count })).sort((a, b) => b.count - a.count || a.date.localeCompare(b.date)).slice(0, 8);
  const nTotal = Object.values(nights).reduce((a, b) => a + b, 0);
  const avgNights = nTotal ? Object.entries(nights).reduce((a, [n, c]) => a + Number(n) * c, 0) / nTotal : 0;
  const partyList = Object.entries(party).map(([k2, count]) => { const [a, c] = k2.split('-').map(Number); return { adults: a, children: c, count }; }).sort((a, b) => b.count - a.count);
  const trend = Array.from({ length: 30 }, (_, i) => { const date = ymd(now - (29 - i) * DAY); return { date, count: sd[date] ?? 0 }; });
  return {
    total: Number(totalRaw ?? 0), byDay, months, top, avgNights, nights,
    party: partyList, typical: partyList[0] ? { adults: partyList[0].adults, children: partyList[0].children } : null,
    lead: LEAD_BUCKETS.map((_, i) => lead[String(i)] ?? 0), trend,
  };
}
