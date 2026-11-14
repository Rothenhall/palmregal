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

/** A friendly, stable number per visitor ("Guest 4821"), from a hash of the visitor id. */
export function guestLabel(c: Pick<Conv, 'visitor'>) {
  let h = 2166136261;
  for (let i = 0; i < c.visitor.length; i++) { h ^= c.visitor.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return `Guest ${1000 + (h % 9000)}`;
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
