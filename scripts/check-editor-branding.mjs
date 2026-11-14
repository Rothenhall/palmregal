/*
 * Build guard: fails (exit 1) if the built Edit site editor still shows TinaCMS branding to admins.
 * The editor is white-labelled by patches/ (applied by `patch-package` on install: tinacms, @tinacms/app, @tinacms/cli).
 * If a TinaCMS upgrade drops or breaks those patches this check fails the build instead of shipping a Tina-branded editor.
 * After upgrading Tina, re-apply the edits in node_modules and run: npx patch-package tinacms @tinacms/cli @tinacms/app
 * Only admin-visible giveaways are checked (not package names or internal identifiers).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const dir = new URL('../public/admin/editor/', import.meta.url);
const GIVEAWAYS = [
  [/<title>\s*TinaCMS/i, 'page title "TinaCMS"'],
  [/M18\.6466 14\.5553/, "Tina's llama logo path"],
  [/TinaCMS form fields/, 'empty-state text "TinaCMS form fields"'],
  [/Visual Editing Docs/, '"Visual Editing Docs" button'],
  [/See latest Releases/, 'version / "See latest Releases" line'],
  [/Failed loading TinaCMS/, '"Failed loading TinaCMS assets" message'],
  [/looking for llamas|Reticulating llama|llama splines|\u{1F999}/u, 'llama loading messages'],
  [/rel="icon"[^>]*favicon\.svg/, "Tina's favicon"],
];

if (!existsSync(dir)) { console.error('check-editor-branding: public/admin/editor not found (did `tinacms build` run?).'); process.exit(1); }
const files = ['index.html', ...(existsSync(new URL('assets/', dir)) ? readdirSync(new URL('assets/', dir)).filter(f => f.endsWith('.js')).map(f => 'assets/' + f) : [])];
const problems = [];
for (const f of files) {
  const text = readFileSync(new URL(f, dir), 'utf8');
  for (const [re, what] of GIVEAWAYS) if (re.test(text)) problems.push(`${f}: ${what}`);
}
const html = readFileSync(new URL('index.html', dir), 'utf8');
for (const need of ['Palm Regal Admin', '/brand/editor.css', 'noindex']) if (!html.includes(need)) problems.push(`index.html: missing "${need}"`);
if (problems.length) {
  console.error('check-editor-branding: the editor is not fully white-labelled:\n  - ' + problems.join('\n  - ') + '\nRe-apply patches (npx patch-package) or refresh them after a Tina upgrade; see README "Edit site".');
  process.exit(1);
}
console.log(`check-editor-branding: ok (${files.length} files checked).`);
