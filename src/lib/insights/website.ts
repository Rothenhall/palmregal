/* The website's publishing state, read from GitHub (the site's content is commits on the branch; Vercel deploys each one).
   Reads are read-only. The one write is "undo last website change": it puts the previous version of content/site/home.json
   back as a new commit. No imports from the app, so it can be tested with a mocked fetch. Server only. */

export interface GhConfig { token: string; owner: string; repo: string; branch: string; api?: string }
type F = typeof fetch;

export const CONTENT_FILE = 'content/site/home.json';

export function ghConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GhConfig | null {
  if (!env.GITHUB_PAT) return null;
  return {
    token: env.GITHUB_PAT, owner: env.GITHUB_OWNER || 'Rothenhall', repo: env.GITHUB_REPO || 'palmregal',
    branch: env.GITHUB_BRANCH || env.VERCEL_GIT_COMMIT_REF || 'main', api: env.GITHUB_API_URL,
  };
}

const enc = (p: string) => p.split('/').map(encodeURIComponent).join('/');

async function gh(cfg: GhConfig, path: string, f: F, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 4000, ...rest } = init;
  const base = `${cfg.api || 'https://api.github.com'}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`;
  return f(base + path, {
    ...rest, cache: 'no-store', signal: AbortSignal.timeout(timeoutMs),
    headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'palmregal-admin', ...(rest.headers as Record<string, string>) },
  });
}
const json = async <T,>(r: Response): Promise<T> => { if (!r.ok) throw new Error(`github-${r.status}`); return (await r.json()) as T; };

/* ---------- status ---------- */

export type Change = { sha: string; message: string; author: string; at: number; kind: 'text' | 'photo' };
export type Deploy = { state: 'live' | 'publishing' | 'failed' | 'unknown'; sha: string };
export type SiteStatus =
  | { ok: true; deploy: Deploy; changes: Change[]; undo: { sha: string; message: string; at: number } | null }
  | { ok: false; reason: 'no-token' | 'unavailable' };

type RawCommit = { sha: string; commit: { message: string; author?: { name?: string; date?: string } }; author?: { login?: string } | null };
const toChange = (c: RawCommit, kind: Change['kind']): Change => ({
  sha: c.sha, kind, message: c.commit.message.split('\n')[0].slice(0, 120),
  author: c.commit.author?.name || c.author?.login || 'Someone', at: Date.parse(c.commit.author?.date ?? '') || 0,
});

async function deployState(cfg: GhConfig, f: F, sha: string): Promise<Deploy['state']> {
  const deps = await json<{ id: number }[]>(await gh(cfg, `/deployments?sha=${sha}&per_page=5`, f));
  if (deps[0]) {
    const st = await json<{ state: string }[]>(await gh(cfg, `/deployments/${deps[0].id}/statuses?per_page=1`, f));
    const s = st[0]?.state;
    if (s === 'success') return 'live';
    if (s === 'error' || s === 'failure') return 'failed';
    if (s === 'pending' || s === 'queued' || s === 'in_progress' || !s) return 'publishing';
  }
  const comb = await json<{ state: string; total_count: number }>(await gh(cfg, `/commits/${sha}/status`, f));
  if (!comb.total_count) return 'unknown';
  return comb.state === 'success' ? 'live' : comb.state === 'pending' ? 'publishing' : 'failed';
}

export async function getWebsiteStatus(cfg: GhConfig | null, f: F = fetch): Promise<SiteStatus> {
  if (!cfg) return { ok: false, reason: 'no-token' };
  const q = (path: string, n: number) => gh(cfg, `/commits?sha=${encodeURIComponent(cfg.branch)}&path=${encodeURIComponent(path)}&per_page=${n}`, f).then(r => json<RawCommit[]>(r));
  try {
    const [text, photos, head] = await Promise.all([q('content', 8), q('public/img', 8), gh(cfg, `/commits/${encodeURIComponent(cfg.branch)}`, f).then(r => json<RawCommit>(r))]);
    const seen = new Set<string>();
    const changes = [...text.map(c => toChange(c, 'text')), ...photos.map(c => toChange(c, 'photo'))]
      .filter(c => !seen.has(c.sha) && seen.add(c.sha)).sort((a, b) => b.at - a.at).slice(0, 6);
    const home = (await q(CONTENT_FILE, 1))[0];
    const state = await deployState(cfg, f, head.sha).catch(() => 'unknown' as const);
    return {
      ok: true, deploy: { state, sha: head.sha }, changes,
      undo: home ? { sha: home.sha, message: home.commit.message.split('\n')[0].slice(0, 120), at: Date.parse(home.commit.author?.date ?? '') || 0 } : null,
    };
  } catch { return { ok: false, reason: 'unavailable' }; }
}

/* ---------- undo ---------- */

export type UndoResult = { ok: true; sha: string } | { ok: false; error: string };

/** Restores the text before the latest change to content/site/home.json. Only if that change is still the latest one the admin saw. */
export async function undoLastChange(cfg: GhConfig | null, expectedSha: string, f: F = fetch): Promise<UndoResult> {
  if (!cfg) return { ok: false, error: 'Publishing is not set up on this server.' };
  try {
    const latest = (await json<RawCommit[]>(await gh(cfg, `/commits?sha=${encodeURIComponent(cfg.branch)}&path=${encodeURIComponent(CONTENT_FILE)}&per_page=1`, f)))[0];
    if (!latest) return { ok: false, error: 'There is no earlier version to go back to.' };
    if (latest.sha !== expectedSha) return { ok: false, error: 'The website was changed again in the meantime. Reload the page and check before undoing.' };
    const detail = await json<{ sha: string; parents: { sha: string }[] }>(await gh(cfg, `/commits/${latest.sha}`, f));
    if (detail.parents.length !== 1) return { ok: false, error: 'That change cannot be undone automatically.' };
    const before = await gh(cfg, `/contents/${enc(CONTENT_FILE)}?ref=${detail.parents[0].sha}`, f);
    if (before.status === 404) return { ok: false, error: 'There is no earlier version to go back to.' };
    const old = await json<{ content: string; encoding: string }>(before);
    if (old.encoding !== 'base64') return { ok: false, error: 'The earlier version could not be read.' };
    const now = await json<{ sha: string }>(await gh(cfg, `/contents/${enc(CONTENT_FILE)}?ref=${encodeURIComponent(cfg.branch)}`, f));
    const res = await gh(cfg, `/contents/${enc(CONTENT_FILE)}`, f, {
      method: 'PUT', timeoutMs: 15000, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Admin: undo website change ${latest.sha.slice(0, 7)}`, content: old.content.replace(/\n/g, ''), sha: now.sha, branch: cfg.branch }),
    });
    const out = await json<{ commit: { sha: string } }>(res);
    return { ok: true, sha: out.commit.sha };
  } catch { return { ok: false, error: 'Could not reach the publishing service. Nothing was changed. Please try again.' }; }
}

/* ---------- photo sizes (for the site health check) ---------- */

export async function githubPhotoSizes(cfg: GhConfig, f: F = fetch): Promise<{ path: string; size: number }[]> {
  type E = { type: string; name: string; size: number };
  const ls = async (dir: string) => json<E[]>(await gh(cfg, `/contents/${enc(dir)}?ref=${encodeURIComponent(cfg.branch)}`, f));
  const out: { path: string; size: number }[] = [];
  const root = await ls('public/img');
  for (const e of root) if (e.type === 'file') out.push({ path: `/img/${e.name}`, size: e.size });
  for (const d of root.filter(e => e.type === 'dir')) for (const e of await ls(`public/img/${d.name}`)) if (e.type === 'file') out.push({ path: `/img/${d.name}/${e.name}`, size: e.size });
  return out;
}
