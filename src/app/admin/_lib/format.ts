/* Small, server-safe helpers that turn stored data into the words the resort staff see. */
import type { Conv } from '@/lib/chat/store';

export const RESORT = 'Palm Regal';

const IST = 'Asia/Kolkata';

export function when(t: number) {
  return new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: IST });
}
export function dayOf(t: number) {
  return new Date(t + 5.5 * 3600_000).toISOString().slice(0, 10);
}
export function shortDate(t: number) {
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: IST });
}

/** "Just now", "5 min ago", "3 hr ago", "Yesterday", "12 Nov". */
export function timeAgo(t: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hr ago`;
  if (dayOf(t) === dayOf(now - 86400_000)) return 'Yesterday';
  return shortDate(t);
}

const hashOf = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
/** A friendly, stable number per visitor ("Guest 4821"), from a hash of the visitor id. */
export function guestLabel(c: Pick<Conv, 'visitor'>) {
  return `Guest ${1000 + (hashOf(c.visitor) % 9000)}`;
}
/** A stable colour (0-5) per visitor, so the same guest is easy to spot in a list. */
export const guestTone = (c: Pick<Conv, 'visitor'>) => (hashOf(c.visitor) >>> 8) % 6;

/** "Today", "Yesterday", "Earlier this week", "Older": headings for a list sorted newest first. */
export function dayGroup(t: number, now = Date.now()) {
  if (dayOf(t) === dayOf(now)) return 'Today';
  if (dayOf(t) === dayOf(now - 86400_000)) return 'Yesterday';
  if (now - t < 7 * 86400_000) return 'Earlier this week';
  return 'Older';
}

/** The whole chat as plain text, for copying into WhatsApp, email or notes. */
export function transcriptText(c: Conv) {
  const head = `${guestLabel(c)} · started ${when(c.createdAt)}`;
  return [head, '', ...c.msgs.map(m => `[${when(m.ts)}] ${m.r === 'u' ? 'Guest' : 'Assistant'}: ${m.t}`)].join('\n');
}
export function firstGuestMessage(c: Conv) {
  return c.msgs.find(m => m.r === 'u')?.t ?? '';
}
export function lastMessage(c: Conv) {
  const m = c.msgs[c.msgs.length - 1];
  return m ? `${m.r === 'u' ? '' : 'Assistant: '}${m.t}` : 'No messages yet';
}

export const HANDOFF_TEXT: Record<string, string> = {
  human: 'Guest asked to talk to the team',
  unknown: "The assistant couldn't answer this",
  frustrated: 'Guest seemed unhappy with the answers',
};
export const handoffText = (r?: string) => (r ? HANDOFF_TEXT[r] ?? 'Guest needs the team' : '');

export const initials = (email: string) => {
  const name = email.split('@')[0].replace(/[^a-zA-Z]+/g, ' ').trim();
  const parts = name.split(' ').filter(Boolean);
  return ((parts[0]?.[0] ?? 'A') + (parts[1]?.[0] ?? '')).toUpperCase();
};

export const n = (v: number) => v.toLocaleString('en-IN');
