import { MEDIA_ROOT } from './shared';
import { MediaError } from './rules';
import type { MediaEntry, MediaStorage } from './storage';

/* Photos as commits to the site's GitHub branch (Contents API). The token never leaves the server.
   Reads use the branch, so a photo uploaded a moment ago is listed and previewable before Vercel has redeployed. */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export function githubConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GitHubConfig {
  const token = env.GITHUB_PAT;
  if (!token) throw new MediaError(503, 'Photo uploads are not set up yet (the GitHub access key is missing on the server).');
  return {
    token,
    owner: env.GITHUB_OWNER || 'Rothenhall',
    repo: env.GITHUB_REPO || 'palmregal',
    branch: env.GITHUB_BRANCH || env.VERCEL_GIT_COMMIT_REF || 'main',
  };
}

const enc = (path: string) => path.split('/').map(encodeURIComponent).join('/');
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type CallInit = Omit<RequestInit, 'cache'> & { accept?: string; withRef?: boolean };

export class GitHubStorage implements MediaStorage {
  readonly kind = 'github' as const;
  constructor(private cfg: GitHubConfig, private fetchImpl: typeof fetch = fetch) {}

  private url(path: string) {
    return `https://api.github.com/repos/${encodeURIComponent(this.cfg.owner)}/${encodeURIComponent(this.cfg.repo)}/contents/${enc(path)}`;
  }

  /** withRef: reads pass ?ref=<branch>; writes carry the branch in their JSON body instead. */
  private call(path: string, init: CallInit = {}) {
    const { accept, withRef = true, ...rest } = init;
    const url = this.url(path) + (withRef ? `?ref=${encodeURIComponent(this.cfg.branch)}` : '');
    return this.fetchImpl(url, {
      ...rest,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${this.cfg.token}`,
        Accept: accept ?? 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'palmregal-site-editor',
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  }

  /** Turns a failed GitHub response into an error the editor can show. */
  private async fail(res: Response, what: string): Promise<never> {
    let detail = '';
    try { detail = String(((await res.json()) as { message?: string }).message ?? ''); } catch { /* not JSON */ }
    const limited = res.status === 429 || (res.status === 403 && (/rate limit|abuse|secondary/i.test(detail) || res.headers.get('x-ratelimit-remaining') === '0'));
    if (limited) throw new MediaError(429, 'GitHub is asking us to slow down. Please wait a minute and try again.');
    if (res.status === 401) throw new MediaError(502, 'GitHub rejected the access key (it may have expired). Ask the website developer to renew it.');
    if (res.status === 403) throw new MediaError(502, 'The GitHub access key is not allowed to change photos (it needs "Contents: Read and write").');
    if (res.status === 404) throw new MediaError(502, 'GitHub could not find the website repository or branch. Check GITHUB_OWNER, GITHUB_REPO and GITHUB_BRANCH.');
    throw new MediaError(502, `GitHub could not ${what} (error ${res.status}).`);
  }

  async list(dir: string): Promise<MediaEntry[]> {
    const path = dir ? `${MEDIA_ROOT}/${dir}` : MEDIA_ROOT;
    const res = await this.call(path);
    if (res.status === 404) {
      // a missing root is a misconfiguration; a missing sub-folder is just empty
      if (!dir) await this.fail(res, 'list photos');
      return [];
    }
    if (!res.ok) await this.fail(res, 'list photos');
    const body = (await res.json()) as { name: string; type: string; size: number }[] | { type: string };
    if (!Array.isArray(body)) return [];
    return body
      .filter(e => e.type === 'file' || e.type === 'dir')
      .map(e => ({ type: e.type as 'file' | 'dir', name: e.name, size: e.size }));
  }

  async read(rel: string): Promise<Uint8Array | null> {
    const res = await this.call(`${MEDIA_ROOT}/${rel}`, { accept: 'application/vnd.github.raw+json' });
    if (res.status === 404) return null;
    if (!res.ok) await this.fail(res, 'read the photo');
    return new Uint8Array(await res.arrayBuffer());
  }

  async create(rel: string, data: Uint8Array, message: string): Promise<void> {
    const body = JSON.stringify({ message, content: Buffer.from(data).toString('base64'), branch: this.cfg.branch });
    for (let attempt = 0; ; attempt++) {
      // No "sha" in the body: GitHub refuses (422) if the file already exists, so we can never overwrite.
      const res = await this.call(`${MEDIA_ROOT}/${rel}`, { method: 'PUT', body, withRef: false });
      if (res.ok) return;
      // 409: someone else committed to the branch at the same moment (e.g. a Save in the editor). Retry shortly.
      if (res.status === 409 && attempt < 3) { await sleep(400 * (attempt + 1)); continue; }
      if (res.status === 422 && (await this.read(rel)) !== null) throw new MediaError(409, 'A photo with that name already exists.');
      await this.fail(res, 'save the photo');
    }
  }

  async remove(rel: string, message: string): Promise<void> {
    const path = `${MEDIA_ROOT}/${rel}`;
    const meta = await this.call(path);
    if (meta.status === 404) throw new MediaError(404, 'That photo no longer exists.');
    if (!meta.ok) await this.fail(meta, 'find the photo');
    const info = (await meta.json()) as { sha?: string; type?: string };
    if (info.type !== 'file' || !info.sha) throw new MediaError(400, 'That is not a photo.');
    for (let attempt = 0; ; attempt++) {
      const res = await this.call(path, { method: 'DELETE', body: JSON.stringify({ message, sha: info.sha, branch: this.cfg.branch }), withRef: false });
      if (res.ok) return;
      if (res.status === 409 && attempt < 3) { await sleep(400 * (attempt + 1)); continue; }
      await this.fail(res, 'delete the photo');
    }
  }

  async readRepoText(repoPath: string): Promise<string | null> {
    const res = await this.call(repoPath, { accept: 'application/vnd.github.raw+json' });
    if (res.status === 404) return null;
    if (!res.ok) await this.fail(res, 'read the site content');
    return res.text();
  }
}
