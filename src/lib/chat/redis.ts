/*
 * Minimal Upstash Redis REST client (no dependency). Server only.
 * Every key is namespaced so local testing never mixes with real guests: CHAT_KEY_PREFIX, else "prod:" on
 * Vercel production and "dev:" everywhere else.
 */
const URL_ = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;

export const PREFIX = process.env.CHAT_KEY_PREFIX ?? (process.env.VERCEL_ENV === 'production' ? 'prod:' : 'dev:');
export const k = (...parts: (string | number)[]) => `${PREFIX}chat:${parts.join(':')}`;
export const redisConfigured = () => !!(URL_ && TOKEN);

type Cmd = (string | number)[];

async function call(path: string, body: unknown): Promise<any[]> {
  if (!URL_ || !TOKEN) throw new Error('redis-not-configured');
  const r = await fetch(`${URL_}${path}`, {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`redis-${r.status}`);
  const out = await r.json();
  return (out as any[]).map(x => { if (x?.error) throw new Error(x.error); return x.result; });
}

/** One round trip, commands run in order (not atomic). */
export const pipeline = (cmds: Cmd[]) => call('/pipeline', cmds);
/** One round trip, all-or-nothing (MULTI/EXEC). */
export const multi = (cmds: Cmd[]) => call('/multi-exec', cmds);
export async function cmd(...c: Cmd) { return (await pipeline([c]))[0]; }
