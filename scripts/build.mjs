/*
 * Production build: the Edit site editor first, then the website.
 *
 * - Self-hosted env vars all set (Vercel): `tinacms build` builds the editor into public/admin/editor and indexes
 *   content/site/home.json into Upstash Redis, so the editor can save and publish through GitHub.
 * - Otherwise (a plain local `npm run build`): the editor is built in local mode, with no database. The website
 *   is identical; the built editor then only works with `npm run dev`.
 */
import { spawnSync } from 'node:child_process';

const need = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'GITHUB_PAT'];
const missing = need.filter(k => !process.env[k]);
const selfHosted = missing.length === 0;

const run = (cmd, args, env = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

if (selfHosted) {
  console.log('Edit site: self-hosted build (Upstash Redis + GitHub).');
  run('npx', ['tinacms', 'build', '--skip-cloud-checks'], { TINA_PUBLIC_IS_LOCAL: 'false' });
} else {
  console.log(`Edit site: local-mode build (missing ${missing.join(', ')}). The editor will only work with "npm run dev".`);
  run('npx', ['tinacms', 'build', '--local', '--skip-indexing', '--skip-cloud-checks'], { TINA_PUBLIC_IS_LOCAL: 'true' });
}
// Fails the build if the editor still shows Tina branding (e.g. a Tina upgrade dropped our patches/)
run('node', ['scripts/check-editor-branding.mjs']);
run('npx', ['next', 'build']);
