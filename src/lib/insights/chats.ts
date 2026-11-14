/* What guests ask, from the stored conversations of the last 30 days. Server only. Results are cached in memory for 5 minutes. */
import { cmd, k } from '@/lib/chat/redis';
import { recentConvs, type Conv } from '@/lib/chat/store';
import { convLang, langLabel } from './lang';
import { TOPIC_LABEL, gapKey, similar, topicsOf } from './topics';

const DAY = 86400_000;
const SCAN = 2000;

export type ChatInsights = {
  total: number; days: number;
  topics: { id: string; label: string; count: number }[];
  langs: { label: string; count: number }[];
  hours: number[];            // guest messages by hour of day, India time
  handoff: number; unanswered: number; up: number; down: number;
};
export type Gap = { key: string; question: string; count: number; lastAsked: number; samples: string[] };
export type GapStatus = { s: 'resolved' | 'dismissed'; at: number };

let cache: { at: number; convs: Conv[] } | null = null;

/** Conversations from the last 90 days (gaps look back further than the 30-day chat view), capped. */
async function load(): Promise<Conv[]> {
  if (cache && Date.now() - cache.at < 300_000) return cache.convs;
  const convs = await recentConvs(SCAN);
  cache = { at: Date.now(), convs };
  return convs;
}

const istHour = (t: number) => new Date(t + 5.5 * 3600_000).getUTCHours();

export function summarize(all: Conv[], now = Date.now(), days = 30): ChatInsights {
  const convs = all.filter(c => now - c.updatedAt <= days * DAY);
  const topics = new Map<string, number>(); const langs = new Map<string, number>();
  const hours = Array<number>(24).fill(0);
  let handoff = 0, unanswered = 0, up = 0, down = 0;
  for (const c of convs) {
    const guest = c.msgs.filter(m => m.r === 'u');
    for (const id of new Set(guest.flatMap(m => topicsOf(m.t)).filter((t, _, a) => t !== 'other' || a.every(x => x === 'other')))) topics.set(id, (topics.get(id) ?? 0) + 1);
    const l = langLabel(convLang(c)); langs.set(l, (langs.get(l) ?? 0) + 1);
    for (const m of guest) hours[istHour(m.ts)]++;
    if (c.handoff) handoff++;
    if (c.unanswered?.length) unanswered++;
    for (const m of c.msgs) { if (m.fb === 1) up++; else if (m.fb === -1) down++; }
  }
  const sort = <T extends { count: number }>(a: T[]) => a.sort((x, y) => y.count - x.count);
  return {
    total: convs.length, days,
    topics: sort([...topics].map(([id, count]) => ({ id, label: TOPIC_LABEL[id] ?? id, count }))),
    langs: sort([...langs].map(([label, count]) => ({ label, count }))),
    hours, handoff, unanswered, up, down,
  };
}

export const chatInsights = async () => summarize(await load());

/** Unanswered questions, grouped by meaning, newest first. */
export function groupGaps(all: Conv[]): Gap[] {
  const groups: (Gap & { first: number })[] = [];
  const items = all.flatMap(c => (c.unanswered ?? []).map(q => ({ q, at: c.updatedAt }))).sort((a, b) => a.at - b.at);
  for (const { q, at } of items) {
    const g = groups.find(x => similar(x.question, q));
    if (g) { g.count++; g.lastAsked = Math.max(g.lastAsked, at); if (g.samples.length < 4 && !g.samples.includes(q)) g.samples.push(q); }
    else groups.push({ key: gapKey(q), question: q, count: 1, lastAsked: at, samples: [q], first: at });
  }
  return groups.map(({ first: _f, ...g }) => g).sort((a, b) => b.lastAsked - a.lastAsked);
}

const gk = () => k('ins', 'gaps');
export async function gapStatuses(): Promise<Record<string, GapStatus>> {
  const all = ((await cmd('HGETALL', gk())) as string[] | null) ?? [];
  const out: Record<string, GapStatus> = {};
  for (let i = 0; i < all.length; i += 2) { try { out[all[i]] = JSON.parse(all[i + 1]); } catch {} }
  return out;
}
export const setGapStatus = (key: string, s: GapStatus['s']) => cmd('HSET', gk(), key, JSON.stringify({ s, at: Date.now() } satisfies GapStatus));

/** Open gaps: not dismissed, and not resolved unless a guest asked again after the answer was added. */
export async function openGaps(): Promise<Gap[]> {
  const [gaps, st] = await Promise.all([load().then(groupGaps), gapStatuses()]);
  return gaps.filter(g => { const s = st[g.key]; return !s || (s.s === 'resolved' && g.lastAsked > s.at + 3600_000); });
}
