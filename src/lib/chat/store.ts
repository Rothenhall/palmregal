/* Conversation storage in Redis. Server only.
   Retention: every conversation expires 90 days after its last message (RETENTION_DAYS). */
import { cmd, k, pipeline } from './redis';
import type { BlockKind } from './guard';
import { blockKey } from './guard';

export const RETENTION_DAYS = 90;
const TTL = RETENTION_DAYS * 86400;

export type Msg = { r: 'u' | 'a'; t: string; ts: number; fb?: 1 | -1 };
export type Conv = {
  id: string; visitor: string; ipHash: string; ipMask: string; fp: string | null;
  createdAt: number; updatedAt: number; lang: string; msgs: Msg[]; limited: number;
  /** set when the chat ended in a handoff to the team (reason: human, unknown, frustrated) */
  handoff?: string;
  /** guest questions the bot could not answer: what to add to the Knowledge base */
  unanswered?: string[];
  /** admin inbox: 'done' hides it from "Needs reply" until the guest writes again (see isDone) */
  status?: 'open' | 'done';
  doneAt?: number;
};

/** Marked done and nothing new from the guest since (a new message moves updatedAt past doneAt). */
export const isDone = (c: Conv) => c.status === 'done' && (c.doneAt ?? 0) >= c.updatedAt;
/** The team has something to do: the guest asked for a person or the assistant could not answer, and nobody marked it done. */
export const needsReply = (c: Conv) => Boolean(c.handoff || c.unanswered?.length) && !isDone(c);

export const validCid = (s: unknown): s is string => typeof s === 'string' && /^[A-Za-z0-9_-]{16,32}$/.test(s);

export async function getConv(id: string): Promise<Conv | null> {
  const raw = await cmd('GET', k('conv', id));
  if (!raw) return null;
  try { return JSON.parse(raw) as Conv; } catch { return null; }
}

export async function saveConv(c: Conv) {
  c.updatedAt = Date.now();
  await pipeline([
    ['SET', k('conv', c.id), JSON.stringify(c), 'EX', TTL],
    ['ZADD', k('convs'), c.updatedAt, c.id],
    ['ZREMRANGEBYSCORE', k('convs'), 0, Date.now() - TTL * 1000],
    ...(c.handoff || c.unanswered?.length ? [['ZADD', k('convs', 'flagged'), c.updatedAt, c.id]] : []),
  ]);
}

export async function deleteConv(id: string) {
  await pipeline([['DEL', k('conv', id)], ['ZREM', k('convs'), id], ['ZREM', k('convs', 'flagged'), id]]);
}

export async function listConvs(page: number, size = 20, flagged = false) {
  const zk = flagged ? k('convs', 'flagged') : k('convs');
  const start = (page - 1) * size;
  const [ids, total] = await pipeline([['ZREVRANGE', zk, start, start + size - 1], ['ZCARD', zk]]);
  let items: Conv[] = [];
  if ((ids as string[]).length) {
    const raws = (await pipeline([['MGET', ...(ids as string[]).map(i => k('conv', i))]]))[0] as (string | null)[];
    items = raws.flatMap(r => { try { return r ? [JSON.parse(r) as Conv] : []; } catch { return []; } });
  }
  return { items, total: Number(total), pages: Math.max(1, Math.ceil(Number(total) / size)) };
}

const parseConvs = (raws: (string | null)[]) => raws.flatMap(r => { try { return r ? [JSON.parse(r) as Conv] : []; } catch { return []; } });

/** Newest conversations (admin inbox, search and stats). Retention is 90 days and traffic is small, so one read is enough. */
export async function recentConvs(limit = 300): Promise<Conv[]> {
  const ids = (await cmd('ZREVRANGE', k('convs'), 0, limit - 1)) as string[];
  if (!ids.length) return [];
  const out: Conv[] = [];
  for (let i = 0; i < ids.length; i += 200) { // batched so a big inbox never makes one huge request
    out.push(...parseConvs((await pipeline([['MGET', ...ids.slice(i, i + 200).map(x => k('conv', x))]]))[0] as (string | null)[]));
  }
  return out;
}

/** Conversations that ever needed the team (newest first), whatever their status. */
export async function flaggedConvs(limit = 60): Promise<Conv[]> {
  const ids = (await cmd('ZREVRANGE', k('convs', 'flagged'), 0, limit - 1)) as string[];
  if (!ids.length) return [];
  return parseConvs((await pipeline([['MGET', ...ids.map(i => k('conv', i))]]))[0] as (string | null)[]);
}

/** Mark a conversation done or open again without touching its time or expiry. */
export async function setConvStatus(id: string, status: 'open' | 'done') {
  const c = await getConv(id);
  if (!c) return;
  c.status = status;
  c.doneAt = status === 'done' ? Date.now() : undefined;
  await cmd('SET', k('conv', id), JSON.stringify(c), 'KEEPTTL');
}

/** Which writing system a message uses: a hint for the model and a label for the admin. */
export function scriptOf(text: string): { script: string; label: string } {
  const t: [RegExp, string, string][] = [
    [/[ऀ-ॿ]/, 'Devanagari', 'Hindi / Devanagari'], [/[ఀ-౿]/, 'Telugu', 'Telugu script'],
    [/[஀-௿]/, 'Tamil', 'Tamil script'], [/[ಀ-೿]/, 'Kannada', 'Kannada script'],
    [/[ഀ-ൿ]/, 'Malayalam', 'Malayalam script'], [/[ঀ-৿]/, 'Bengali', 'Bengali / Assamese script'],
    [/[଀-୿]/, 'Odia', 'Odia script'], [/[઀-૿]/, 'Gujarati', 'Gujarati script'],
    [/[਀-੿]/, 'Gurmukhi', 'Punjabi script'], [/[؀-ۿ]/, 'Arabic', 'Urdu / Arabic script'],
  ];
  for (const [re, script, label] of t) if (re.test(text)) return { script, label };
  return { script: 'Latin', label: 'Latin letters (English or romanized)' };
}

/* ---------- blocklist ---------- */
export type BlockEntry = { kind: BlockKind; hash: string; masked: string; at: number };

export async function addBlock(kind: BlockKind, hash: string, masked: string) {
  await cmd('HSET', k('block'), blockKey(kind, hash), JSON.stringify({ masked, at: Date.now() }));
}
export const removeBlock = (kind: BlockKind, hash: string) => cmd('HDEL', k('block'), blockKey(kind, hash));
export async function listBlocks(): Promise<BlockEntry[]> {
  const all = ((await cmd('HGETALL', k('block'))) as string[] | null) ?? [];
  const out: BlockEntry[] = [];
  for (let i = 0; i < all.length; i += 2) {
    const [kind, hash] = [all[i].split(':')[0] as BlockKind, all[i].slice(all[i].indexOf(':') + 1)];
    try { const v = JSON.parse(all[i + 1]); out.push({ kind, hash, masked: v.masked, at: v.at }); } catch {}
  }
  return out.sort((a, b) => b.at - a.at);
}
export async function isBlockedHash(kind: BlockKind, hash: string) {
  return Boolean(await cmd('HEXISTS', k('block'), blockKey(kind, hash)));
}
