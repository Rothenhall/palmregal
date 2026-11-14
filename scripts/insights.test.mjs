/*
 * Logic tests for the admin Insights (no network, no Redis, nothing written anywhere):
 *   node scripts/insights.test.mjs
 * Bundles the TypeScript with esbuild (already installed for the editor), then runs plain assertions.
 * The "undo website change" flow is tested against a mocked GitHub: it must never be run against the real one here.
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(path.join(tmpdir(), 'insights-test-'));
const entry = path.join(dir, 'entry.ts');
const src = p => JSON.stringify(path.resolve('src/lib/insights', p).replace(/\\/g, '/'));
writeFileSync(entry, `
export * from ${src('website')};
export * from ${src('lang')};
export * from ${src('topics')};
export * from ${src('searches')};
export * from ${src('health')};
export * from ${src('chats')};
`);
const out = path.join(dir, 'bundle.mjs');
await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, alias: { '@': path.resolve('src') }, external: ['node:*'], logLevel: 'error' });
const m = await import(pathToFileURL(out).href);

let n = 0;
const t = (name, fn) => (async () => fn())().then(() => { n++; console.log('ok  ', name); }, e => { console.error('FAIL', name, '\n', e); process.exitCode = 1; });

/* ---------- language ---------- */
await t('guessLang: scripts', () => {
  assert.equal(m.guessLang('మీకు పెట్ పాలసీ ఉందా?').name, 'Telugu');
  assert.equal(m.guessLang('क्या पार्किंग है').name, 'Hindi');
  assert.equal(m.guessLang('ଆପଣଙ୍କ ପାଖରେ ପାର୍କିଂ ଅଛି').name, 'Odia');
});
await t('guessLang: romanized', () => {
  assert.deepEqual(m.guessLang('mujhe room kitna padega kya hai'), { name: 'Hindi', romanized: true });
  assert.deepEqual(m.guessLang('meeru enti cheppandi room undi'), { name: 'Telugu', romanized: true });
  assert.equal(m.guessLang('enna price venum').name, 'Tamil');
  assert.equal(m.langLabel(m.guessLang('kya parking hai')), 'Hindi (English letters)');
});
await t('guessLang: English stays English', () => {
  for (const s of ['What time is check-in?', 'Do you allow pets near the beach', 'I would like to book two rooms for my family', 'Is there any ache or pain remedy?', 'Good mate, thanks'])
    assert.equal(m.guessLang(s).name, 'English', s);
});
await t('convLang: most common non-English wins', () => {
  const c = { msgs: [{ r: 'u', t: 'hello', ts: 1 }, { r: 'a', t: 'hi', ts: 2 }, { r: 'u', t: 'kya room hai', ts: 3 }] };
  assert.equal(m.convLangLabel(c), 'Hindi (English letters)');
  assert.equal(m.convLangLabel({ msgs: [{ r: 'u', t: 'hello there', ts: 1 }] }), 'English');
});

/* ---------- topics and gaps ---------- */
await t('topicsOf', () => {
  assert.ok(m.topicsOf('Do you allow dogs? pet policy').includes('pets'));
  assert.ok(m.topicsOf('swimming pool timing').includes('pool'));
  assert.ok(m.topicsOf('मुझे कमरे का किराया बताओ').includes('prices'));
  assert.ok(m.topicsOf('కుక్క ఉండొచ్చా').includes('pets'));
  assert.deepEqual(m.topicsOf('hello'), ['other']);
  assert.ok(!m.topicsOf('careful with the category').includes('parking')); // "car" must not match inside words
});
await t('gap grouping and keys', () => {
  assert.ok(m.similar('Do you allow pets?', 'are pets allowed'));
  assert.ok(!m.similar('Do you allow pets?', 'Is there a swimming pool'));
  const mk = (q, at) => ({ id: q, visitor: 'v', unanswered: [q], updatedAt: at, msgs: [] });
  const g = m.groupGaps([mk('Do you allow pets?', 1000), mk('are pets allowed', 2000), mk('swimming pool open?', 1500)]);
  assert.equal(g.length, 2);
  assert.equal(g.find(x => x.count === 2).question, 'Do you allow pets?');
  assert.equal(m.gapKey('Do you allow pets?'), m.gapKey('do you allow pets'));
});

/* ---------- search validation (what the beacon may store) ---------- */
const NOW = Date.parse('2026-11-14T10:00:00Z');
const ok = (o) => m.validate({ i: '2026-12-20', o: '2026-12-23', a: 2, c: 1, ...o }, NOW);
await t('validate: accepts a normal search', () => {
  const v = ok({});
  assert.equal(v.nights, 3); assert.equal(v.lead, 36); assert.equal(v.adults, 2);
});
await t('validate: rejects bad input', () => {
  for (const bad of [ok({ i: '2026-11-01' }), ok({ i: '2026-02-31', o: '2026-03-02' }), ok({ o: '2026-12-20' }), ok({ o: '2027-02-01' }),
    ok({ i: '2028-06-01', o: '2028-06-03' }), ok({ a: 0 }), ok({ a: 40 }), ok({ c: -1 }), ok({ a: 1.5 }), ok({ i: 'x' }), m.validate(null, NOW), m.validate('str', NOW)])
    assert.equal(bad, null);
});
await t('validate: only expected fields survive (no ids, no extras)', () => {
  const v = ok({ visitor: 'abc', ip: '1.2.3.4' });
  assert.deepEqual(Object.keys(v).sort(), ['adults', 'checkIn', 'checkOut', 'children', 'lead', 'nights']);
});

/* ---------- site health ---------- */
await t('checkContent', () => {
  const items = m.checkContent({
    general: { whatsapp: '' }, seo: { title: 'Short', description: 'x' },
    faqSection: { faqs: [{ q: 'a' }] },
    photos: [{ src: '/img/a.webp', alt: '' }, { src: '/img/b.webp', alt: 'ok' }],
    suites: [{ name: 'Sea suite', pending: true }],
  });
  const ids = items.map(i => i.id);
  for (const id of ['whatsapp', 'alt', 'pending', 'seo-title', 'seo-desc', 'faq']) assert.ok(ids.includes(id), id);
  assert.equal(items.find(i => i.id === 'alt').count, 1);
  assert.deepEqual(m.checkContent({ general: { whatsapp: '9198' }, seo: { title: 'Palm Regal serviced suites by the sea', description: 'Serviced suites with a living room and balcony, five minutes from Gopalpur beach in Odisha.' }, faqSection: { faqs: [1, 2, 3, 4, 5] } }), []);
});

/* ---------- website status and undo (mocked GitHub) ---------- */
const cfg = { token: 't', owner: 'o', repo: 'r', branch: 'main', api: 'https://gh.test' };
const old = Buffer.from('{"old":true}').toString('base64');
function mockGitHub(over = {}) {
  const calls = [];
  const f = async (url, init = {}) => {
    const u = new URL(url); const method = init.method || 'GET';
    calls.push({ method, path: u.pathname + u.search, body: init.body });
    const reply = (b, status = 200) => new Response(JSON.stringify(b), { status });
    if (over.fail) throw new Error('network');
    const p = u.pathname;
    if (p === '/repos/o/r/commits' && method === 'GET') {
      const path = u.searchParams.get('path');
      const c = (sha, msg, d) => ({ sha, commit: { message: msg, author: { name: 'Owner', date: d } }, author: null });
      if (path === 'content/site/home.json') return reply(over.noHome ? [] : [c(over.latest ?? 'aaa1111', 'Update home.json', '2026-11-14T08:00:00Z')]);
      if (path === 'content') return reply([c('aaa1111', 'Update home.json', '2026-11-14T08:00:00Z')]);
      return reply([c('bbb2222', 'Add photo', '2026-11-13T08:00:00Z')]);
    }
    if (p === '/repos/o/r/commits/main') return reply({ sha: 'head0001', commit: { message: 'x', author: { date: '2026-11-14T08:00:00Z' } } });
    if (p === '/repos/o/r/deployments') return reply([{ id: 9 }]);
    if (p === '/repos/o/r/deployments/9/statuses') return reply([{ state: over.deploy ?? 'success' }]);
    if (p === '/repos/o/r/commits/aaa1111') return reply({ sha: 'aaa1111', parents: over.parents ?? [{ sha: 'parent01' }] });
    if (p === '/repos/o/r/contents/content/site/home.json' && method === 'GET') {
      if (u.searchParams.get('ref') === 'parent01') return over.noParentFile ? reply({}, 404) : reply({ content: old.replace(/(.{20})/g, '$1\n'), encoding: 'base64' });
      return reply({ sha: 'filesha1' });
    }
    if (p === '/repos/o/r/contents/content/site/home.json' && method === 'PUT') return reply({ commit: { sha: 'newcommit' } });
    return reply({}, 404);
  };
  return { f, calls };
}
await t('getWebsiteStatus: live, changes, undo candidate', async () => {
  const { f } = mockGitHub();
  const s = await m.getWebsiteStatus(cfg, f);
  assert.equal(s.ok, true); assert.equal(s.deploy.state, 'live');
  assert.deepEqual(s.changes.map(c => [c.sha, c.kind]), [['aaa1111', 'text'], ['bbb2222', 'photo']]);
  assert.equal(s.undo.sha, 'aaa1111');
});
await t('getWebsiteStatus: publishing, failed, unavailable, no token', async () => {
  assert.equal((await m.getWebsiteStatus(cfg, mockGitHub({ deploy: 'in_progress' }).f)).deploy.state, 'publishing');
  assert.equal((await m.getWebsiteStatus(cfg, mockGitHub({ deploy: 'failure' }).f)).deploy.state, 'failed');
  assert.deepEqual(await m.getWebsiteStatus(cfg, mockGitHub({ fail: true }).f), { ok: false, reason: 'unavailable' });
  assert.deepEqual(await m.getWebsiteStatus(null), { ok: false, reason: 'no-token' });
});
await t('undoLastChange: writes the parent version back as a new commit', async () => {
  const { f, calls } = mockGitHub();
  const r = await m.undoLastChange(cfg, 'aaa1111', f);
  assert.deepEqual(r, { ok: true, sha: 'newcommit' });
  const puts = calls.filter(c => c.method === 'PUT');
  assert.equal(puts.length, 1);
  const body = JSON.parse(puts[0].body);
  assert.equal(body.message, 'Admin: undo website change aaa1111');
  assert.equal(body.sha, 'filesha1'); assert.equal(body.branch, 'main');
  assert.equal(Buffer.from(body.content, 'base64').toString(), '{"old":true}');
  assert.equal(calls.filter(c => c.method !== 'GET' && c.method !== 'PUT').length, 0);
});
await t('undoLastChange: refuses when things changed or are unsafe (no write)', async () => {
  for (const [over, expected] of [[{ latest: 'zzz9999' }, 'aaa1111'], [{ parents: [{ sha: 'a' }, { sha: 'b' }] }, 'aaa1111'], [{ noParentFile: true }, 'aaa1111'], [{ noHome: true }, 'aaa1111']]) {
    const { f, calls } = mockGitHub(over);
    const r = await m.undoLastChange(cfg, expected, f);
    assert.equal(r.ok, false, JSON.stringify(over));
    assert.equal(calls.filter(c => c.method === 'PUT').length, 0);
  }
  const { f, calls } = mockGitHub({ fail: true });
  assert.equal((await m.undoLastChange(cfg, 'aaa1111', f)).ok, false);
  assert.equal(calls.filter(c => c.method === 'PUT').length, 0);
  assert.equal((await m.undoLastChange(null, 'aaa1111')).ok, false);
});

console.log(`\n${n} checks ran${process.exitCode ? ' (some failed)' : ', all passed'}`);
