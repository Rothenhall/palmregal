/* The admin password: one shared password for the resort team, no email and no database. Server only.
   It lives as a bcrypt hash (never the password itself) in content/admin.json, next to the website text. A change in
   Admin → Password is saved to that file the same way the editor saves text: as a commit on the site's branch (or
   straight to the file on a developer's computer). Wrong tries are limited per network, in memory: simple, and
   enough for a small resort admin. */
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import bundled from '../../content/admin.json';
import { editContentFile, ghConfigFromEnv, readContentFile } from '@/lib/insights/website';

const FILE = 'content/admin.json';
/* bcrypt hash of the starting password (PalmRegal*123), used until the team chooses its own */
const DEFAULT_HASH = '$2b$12$eUghZ3SzihfZ4t.ANlGq9e.BsHa2bwsYohzwARps3S4xp./jn4oIW';
export const MAX_TRIES = 8, WINDOW_MS = 15 * 60_000;
export const MIN_LENGTH = 10;

const local = () => !ghConfigFromEnv() && process.env.NODE_ENV !== 'production';
/** The password can be changed where publishing is connected, and on a developer's computer. */
export const canChangePassword = () => Boolean(ghConfigFromEnv()) || local();

/** A one-way key for the network a sign-in comes from (the address itself is never kept). */
export const clientKey = (forwardedFor: string | null | undefined) =>
  createHash('sha256').update(((forwardedFor ?? '').split(',')[0].trim() || 'unknown') + (process.env.AUTH_SECRET ?? '')).digest('hex').slice(0, 24);

const valid = (h: unknown): h is string => typeof h === 'string' && /^\$2[aby]\$\d{2}\$.{53}$/.test(h);

/* The newest hash: from the branch when publishing is connected (a change counts at once, before the site has
   republished; cached for a minute), the local file on a developer's computer, else the copy built into the site. */
let cache: { at: number; hash: string } | null = null;
async function currentHash(): Promise<string> {
  if (cache && Date.now() - cache.at < 60_000) return cache.hash;
  let hash: unknown = bundled.passwordHash;
  const cfg = ghConfigFromEnv();
  if (cfg) { const r = await readContentFile(cfg, fetch, FILE); if (r) hash = r.data.passwordHash; }
  else if (local()) { try { hash = JSON.parse(await fs.readFile(path.join(process.cwd(), FILE), 'utf8')).passwordHash; } catch { /* keep bundled */ } }
  const h = valid(hash) ? hash : DEFAULT_HASH;
  cache = { at: Date.now(), hash: h };
  return h;
}

/** True while the starting password is still in use (the admin nudges the team to change it). */
export async function usingDefaultPassword() { return (await currentHash()) === DEFAULT_HASH; }

/* wrong tries per network, kept in this server's memory */
const tries = new Map<string, { n: number; until: number }>();
export async function tooManyTries(who: string) {
  const t = tries.get(who);
  if (t && t.until < Date.now()) tries.delete(who);
  return (tries.get(who)?.n ?? 0) >= MAX_TRIES;
}
function countTry(who: string) {
  const t = tries.get(who);
  tries.set(who, { n: (t && t.until > Date.now() ? t.n : 0) + 1, until: Date.now() + WINDOW_MS });
  if (tries.size > 5000) tries.clear(); // never grows without bound
}

export async function checkPassword(password: string, who: string): Promise<boolean> {
  if (!password || password.length > 200) return false;
  if (await tooManyTries(who)) return false;
  const ok = await bcrypt.compare(password, await currentHash());
  if (ok) tries.delete(who); else countTry(who);
  return ok;
}

export type ChangeResult = { ok: true } | { ok: false; error: string; field?: 'current' | 'next' | 'confirm' };

export async function changePassword(current: string, next: string, confirm: string): Promise<ChangeResult> {
  if (!canChangePassword()) return { ok: false, error: 'The password cannot be changed on this server because publishing is not connected.' };
  cache = null;
  if (!(await bcrypt.compare(current, await currentHash()))) return { ok: false, error: 'The current password is not right.', field: 'current' };
  if (next.length < MIN_LENGTH) return { ok: false, error: `Use at least ${MIN_LENGTH} characters.`, field: 'next' };
  if (next.length > 200) return { ok: false, error: 'That password is too long.', field: 'next' };
  if (next === current) return { ok: false, error: 'Choose a password different from the current one.', field: 'next' };
  if (next !== confirm) return { ok: false, error: 'The two new passwords do not match.', field: 'confirm' };
  const hash = await bcrypt.hash(next, 12);

  if (local()) {
    try { await fs.writeFile(path.join(process.cwd(), FILE), JSON.stringify({ passwordHash: hash }, null, 2) + '\n'); }
    catch { return { ok: false, error: 'Could not save the new password.' }; }
  } else {
    const r = await editContentFile(ghConfigFromEnv(), d => { d.passwordHash = hash; }, 'Admin: change the admin password', fetch, FILE);
    if (!r.ok) return { ok: false, error: r.error };
  }
  cache = { at: Date.now(), hash };
  return { ok: true };
}
