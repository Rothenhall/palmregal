/* Knowledge base: documents the admin uploads, stored as text chunks in Redis, searched per guest message.
   Server only. The original files are not kept, only the extracted text.
   Retrieval is BM25 over the chunks: cheap, no embeddings. Upgrade path: Upstash Vector (see docs/chatbot-knowledge.md). */
import { randomBytes } from 'node:crypto';
import { cmd, k, pipeline } from './redis';

export const KB_LIMITS = { fileBytes: 4 * 1024 * 1024, docs: 25, totalChars: 400_000, docChars: 120_000, noteChars: 20_000 };
const CHUNK = 1000, OVERLAP = 150;

export type KbDoc = { id: string; title: string; filename: string; kind: 'pdf' | 'docx' | 'note'; at: number; size: number; chars: number; chunks: number; enabled: boolean };

/* ---------- extraction ---------- */

export async function extractText(file: File): Promise<{ kind: 'pdf' | 'docx'; text: string }> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const head = String.fromCharCode(...buf.slice(0, 5));
  if (head.startsWith('%PDF')) {
    const { extractText: pdf } = await import('unpdf');
    const out = await pdf(buf, { mergePages: true });
    return { kind: 'pdf', text: String(out.text ?? '') };
  }
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    if (!/\.docx$/i.test(file.name)) throw new Error('Only .pdf and .docx files can be added.');
    const mammoth = await import('mammoth');
    const out = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return { kind: 'docx', text: out.value };
  }
  throw new Error('That file is not a PDF or a Word (.docx) document. Older .doc files are not supported: save as .docx first.');
}

const tidy = (t: string) => t.replace(/\r/g, '').replace(/[ \t ]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

export function chunkText(text: string): string[] {
  const t = tidy(text); const out: string[] = [];
  for (let i = 0; i < t.length; i += CHUNK - OVERLAP) {
    let end = Math.min(t.length, i + CHUNK);
    if (end < t.length) { const cut = t.lastIndexOf('\n', end); const sp = t.lastIndexOf(' ', end); const best = Math.max(cut, sp); if (best > i + CHUNK / 2) end = best; }
    out.push(t.slice(i, end).trim());
    if (end >= t.length) break;
    i = end - (CHUNK - OVERLAP);
  }
  return out.filter(Boolean);
}

/* ---------- storage ---------- */

export async function listDocs(): Promise<KbDoc[]> {
  const ids = (await cmd('ZREVRANGE', k('kb', 'docs'), 0, -1)) as string[];
  if (!ids.length) return [];
  const raws = (await pipeline([['MGET', ...ids.map(i => k('kb', 'doc', i))]]))[0] as (string | null)[];
  return raws.flatMap(r => { try { return r ? [JSON.parse(r) as KbDoc] : []; } catch { return []; } });
}
export async function getDoc(id: string) {
  const [m, c] = await pipeline([['GET', k('kb', 'doc', id)], ['GET', k('kb', 'chunks', id)]]);
  if (!m) return null;
  return { doc: JSON.parse(m) as KbDoc, chunks: (c ? JSON.parse(c) : []) as string[] };
}

export async function addDoc(title: string, filename: string, kind: KbDoc['kind'], size: number, text: string) {
  const docs = await listDocs();
  if (docs.length >= KB_LIMITS.docs) throw new Error(`The knowledge base is full (${KB_LIMITS.docs} documents). Delete one first.`);
  const chunks = chunkText(text);
  const chars = chunks.reduce((n, c) => n + c.length, 0);
  if (!chars) throw new Error('No readable text was found. Scanned (image) PDFs are not supported; paste the text as a note instead.');
  if (chars > KB_LIMITS.docChars) throw new Error(`That document is too long (${chars.toLocaleString('en-IN')} characters; limit ${KB_LIMITS.docChars.toLocaleString('en-IN')}). Split it or trim it.`);
  if (docs.reduce((n, d) => n + d.chars, 0) + chars > KB_LIMITS.totalChars) throw new Error('The knowledge base would exceed its total size limit. Delete a document first.');
  const doc: KbDoc = { id: randomBytes(9).toString('base64url'), title: title.slice(0, 80) || filename, filename, kind, at: Date.now(), size, chars, chunks: chunks.length, enabled: true };
  await pipeline([['SET', k('kb', 'doc', doc.id), JSON.stringify(doc)], ['SET', k('kb', 'chunks', doc.id), JSON.stringify(chunks)], ['ZADD', k('kb', 'docs'), doc.at, doc.id]]);
  cache = null;
  return doc;
}
export async function updateDoc(id: string, patch: Partial<Pick<KbDoc, 'title' | 'enabled'>>) {
  const d = await getDoc(id); if (!d) return;
  const next = { ...d.doc, ...(patch.title !== undefined ? { title: patch.title.trim().slice(0, 80) || d.doc.title } : {}), ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}) };
  await cmd('SET', k('kb', 'doc', id), JSON.stringify(next));
  cache = null;
}
export async function removeDoc(id: string) {
  await pipeline([['DEL', k('kb', 'doc', id)], ['DEL', k('kb', 'chunks', id)], ['ZREM', k('kb', 'docs'), id]]);
  cache = null;
}

/* ---------- retrieval (BM25) ---------- */

const tok = (s: string) => (s.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).filter(w => w.length > 1 || /[^\x00-\x7f]/.test(w));
const STOP = new Set('the is are was and for you your with that this have has can could would what when where which how does do not from there their about any our can will please tell me us we it its in on of to a an at be by or as if hai hain ka ki ke ko se mein me kya aap hum ye yeh woh'.split(' '));

type Idx = { at: number; chunks: { doc: string; title: string; text: string; tf: Map<string, number>; len: number }[]; df: Map<string, number>; avg: number; titles: string[] };
let cache: Idx | null = null;

async function index(): Promise<Idx> {
  if (cache && Date.now() - cache.at < 60_000) return cache;
  const docs = (await listDocs()).filter(d => d.enabled);
  const sets = docs.length ? ((await pipeline([['MGET', ...docs.map(d => k('kb', 'chunks', d.id))]]))[0] as (string | null)[]) : [];
  const chunks: Idx['chunks'] = []; const df = new Map<string, number>();
  docs.forEach((d, i) => {
    let arr: string[] = []; try { arr = sets[i] ? JSON.parse(sets[i]!) : []; } catch {}
    for (const text of arr) {
      const words = tok(d.title + ' ' + text); const tf = new Map<string, number>();
      for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
      for (const w of tf.keys()) df.set(w, (df.get(w) ?? 0) + 1);
      chunks.push({ doc: d.id, title: d.title, text, tf, len: words.length });
    }
  });
  const avg = chunks.reduce((n, c) => n + c.len, 0) / (chunks.length || 1);
  return (cache = { at: Date.now(), chunks, df, avg, titles: docs.map(d => d.title) });
}

export const NO_MATCH = 'The resort has extra documents';
/** Text to add to the system prompt for this guest message: the best few chunks, or just the document titles. */
export async function knowledgeFor(query: string, maxChars = 3000, top = 3): Promise<string> {
  const ix = await index();
  if (!ix.chunks.length) return '';
  const q = tok(query).filter(w => !STOP.has(w));
  const N = ix.chunks.length; const scored: { s: number; c: Idx['chunks'][number] }[] = [];
  for (const c of ix.chunks) {
    let s = 0, hits = 0;
    for (const w of q) {
      const f = c.tf.get(w); if (!f) continue;
      hits++;
      const n = ix.df.get(w) ?? 0; const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      s += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (c.len / ix.avg))));
    }
    if (hits >= 2 || (hits === 1 && s >= 1)) scored.push({ s, c });
  }
  scored.sort((a, b) => b.s - a.s);
  const best = scored.slice(0, top);
  if (!best.length) return `${NO_MATCH} on: ${ix.titles.join('; ')}. None matched this question.`;
  let out = '';
  for (const { c } of best) { const add = `[${c.title}]\n${c.text}\n\n`; if (out.length + add.length > maxChars) break; out += add; }
  return out.trim();
}
