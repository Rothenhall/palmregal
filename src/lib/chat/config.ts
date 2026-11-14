/* Chatbot settings: defaults, bounds, and the Redis-backed store the admin edits. Server only. */
import { cmd, k, redisConfigured } from './redis';

export const TONES = {
  warm: { label: 'Warm and friendly', prompt: 'Warm, welcoming and personal, like a gracious host at a small seaside homestay. Short paragraphs, gentle enthusiasm, never pushy.' },
  formal: { label: 'Polished and formal', prompt: 'Polished, courteous and refined, like a five-star concierge. Complete sentences, respectful address, no slang or emoji.' },
  brief: { label: 'Short and to the point', prompt: 'Very concise and direct. One to three short sentences unless the guest asks for detail. No filler.' },
} as const;
export type ToneId = keyof typeof TONES;

export type ChatSettings = {
  enabled: boolean;
  name: string;
  greeting: string;
  tone: ToneId;
  extra: string;
  teaserOn: boolean;       // small bubble next to the launcher (static text, no AI cost)
  teaserText: string;
  teaserDelay: number;     // seconds on the page before it shows
  teaserScroll: boolean;   // also show once the guest has scrolled past half the page
  teaserMobile: boolean;   // phones have little room: off by default
  teaserDays: number;      // show again after this many days
  perMinute: number;       // messages per visitor per minute
  perDay: number;          // messages per visitor per day
  ipPerHour: number;       // messages per IP per hour (shared Wi-Fi: keep generous)
  dailyCap: number;        // total bot replies per day, whole site
  maxInput: number;        // characters per message
  maxTurns: number;        // guest messages per conversation
  maxReplyTokens: number;  // cap on each reply
};

export const DEFAULTS: ChatSettings = {
  enabled: true,
  name: 'Palm Regal Concierge',
  greeting: 'Namaste! I can help with our suites, facilities, getting here and what to see around Gopalpur. What would you like to know?',
  tone: 'warm',
  extra: '',
  teaserOn: true,
  teaserText: 'Hi! Planning a stay by the sea? I can help with suites, facilities and directions.',
  teaserDelay: 20, teaserScroll: true, teaserMobile: false, teaserDays: 7,
  perMinute: 5, perDay: 40, ipPerHour: 80, dailyCap: 1500, maxInput: 500, maxTurns: 20, maxReplyTokens: 350,
};

/** [min, max, label, help] for each numeric limit, shared by the form and the server-side clamp. */
export const BOUNDS = {
  perMinute: [1, 20, 'Messages per guest per minute', 'A person reading replies rarely sends more than 3 a minute.'],
  perDay: [5, 200, 'Messages per guest per day', 'A typical guest asks 5 to 10 questions.'],
  ipPerHour: [10, 500, 'Messages per network per hour', 'Guests on the resort Wi-Fi share one address, so keep this generous.'],
  dailyCap: [50, 20000, 'Replies per day, whole site', 'When reached, the assistant pauses until tomorrow (India time) and points guests to WhatsApp and booking.'],
  maxInput: [100, 2000, 'Longest guest message (characters)', ''],
  maxTurns: [3, 60, 'Guest messages per conversation', 'After this, the guest is asked to start a new chat.'],
  maxReplyTokens: [100, 1000, 'Longest reply (tokens, roughly 0.75 words each)', 'Replies cost per token, so this is also a cost cap.'],
} as const;
export type NumKey = keyof typeof BOUNDS;
export const NUM_KEYS = Object.keys(BOUNDS) as NumKey[];

const clamp = (n: unknown, lo: number, hi: number, d: number) => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
};

/** Accepts anything (stored JSON, form data) and returns a safe, complete settings object. */
export function sanitize(raw: Partial<Record<keyof ChatSettings, unknown>> | null | undefined): ChatSettings {
  const r = raw ?? {};
  const s: ChatSettings = { ...DEFAULTS };
  s.enabled = r.enabled === undefined ? DEFAULTS.enabled : r.enabled === true || r.enabled === 'true' || r.enabled === 'on';
  s.name = String(r.name ?? DEFAULTS.name).trim().slice(0, 40) || DEFAULTS.name;
  s.greeting = String(r.greeting ?? DEFAULTS.greeting).trim().slice(0, 300) || DEFAULTS.greeting;
  s.tone = (r.tone as ToneId) in TONES ? (r.tone as ToneId) : DEFAULTS.tone;
  s.extra = String(r.extra ?? '').trim().slice(0, 1200);
  const bool = (v: unknown, d: boolean) => (v === undefined ? d : v === true || v === 'true' || v === 'on');
  s.teaserOn = bool(r.teaserOn, DEFAULTS.teaserOn); s.teaserScroll = bool(r.teaserScroll, DEFAULTS.teaserScroll); s.teaserMobile = bool(r.teaserMobile, DEFAULTS.teaserMobile);
  s.teaserText = String(r.teaserText ?? DEFAULTS.teaserText).trim().slice(0, 140) || DEFAULTS.teaserText;
  s.teaserDelay = clamp(r.teaserDelay, 3, 120, DEFAULTS.teaserDelay); s.teaserDays = clamp(r.teaserDays, 1, 60, DEFAULTS.teaserDays);
  for (const key of NUM_KEYS) { const [lo, hi] = BOUNDS[key]; s[key] = clamp(r[key], lo, hi, DEFAULTS[key]); }
  return s;
}

let cache: { at: number; v: ChatSettings } | null = null;
const TTL = 30_000;

export async function getSettings(fresh = false): Promise<ChatSettings> {
  if (!fresh && cache && Date.now() - cache.at < TTL) return cache.v;
  let v = DEFAULTS;
  if (redisConfigured()) {
    try {
      const raw = await cmd('GET', k('settings'));
      v = sanitize(raw ? JSON.parse(raw) : null);
    } catch { v = cache?.v ?? DEFAULTS; }
  }
  cache = { at: Date.now(), v };
  return v;
}

export async function saveSettings(raw: Partial<Record<keyof ChatSettings, unknown>>) {
  const v = sanitize(raw);
  await cmd('SET', k('settings'), JSON.stringify(v));
  cache = { at: Date.now(), v };
  return v;
}
