/* Website health: plain-language checks on the site's content (content/site/home.json) and photo sizes. Server only. */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { githubPhotoSizes, ghConfigFromEnv } from './website';

export type HealthItem = { id: string; title: string; detail: string; count?: number; severity: 'fix' | 'tip' };
export type Health = { items: HealthItem[]; checked: number; photosChecked: boolean };

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Every photo reference in the content: objects with an /img/ or /media/ "src" and their alt text. */
export function photosIn(node: Json, out: { src: string; alt: string }[] = []) {
  if (Array.isArray(node)) node.forEach(n => photosIn(n, out));
  else if (isObj(node)) {
    if (typeof node.src === 'string' && /^\/(img|media)\//.test(node.src)) out.push({ src: node.src, alt: typeof node.alt === 'string' ? node.alt : '' });
    for (const v of Object.values(node)) photosIn(v, out);
  }
  return out;
}

/** Things still marked to confirm: `pending: true` or a non-empty `pending` note, named after the nearest title. */
export function pendingIn(node: Json, out: string[] = []) {
  if (Array.isArray(node)) node.forEach(n => pendingIn(n, out));
  else if (isObj(node)) {
    if (node.pending === true || (typeof node.pending === 'string' && node.pending.trim())) out.push(String(node.name ?? node.q ?? node.title ?? 'An item'));
    for (const v of Object.values(node)) pendingIn(v, out);
  }
  return out;
}

export function checkContent(c: Record<string, Json>): HealthItem[] {
  const items: HealthItem[] = [];
  const general = isObj(c.general) ? c.general : {};
  const seo = isObj(c.seo) ? c.seo : {};
  if (!String(general.whatsapp ?? '').trim()) items.push({ id: 'whatsapp', severity: 'fix', title: 'WhatsApp number is missing', detail: 'The WhatsApp button cannot open a chat yet, so guests are sent to email instead.' });
  const noAlt = photosIn(c).filter(p => !p.alt.trim());
  if (noAlt.length) items.push({ id: 'alt', severity: 'fix', count: noAlt.length, title: `${noAlt.length} ${noAlt.length === 1 ? 'photo has' : 'photos have'} no description`, detail: 'Descriptions help guests who use screen readers and help Google understand your photos.' });
  const pending = pendingIn(c);
  if (pending.length) items.push({ id: 'pending', severity: 'tip', count: pending.length, title: `${pending.length} ${pending.length === 1 ? 'item is' : 'items are'} still marked "to confirm"`, detail: `${pending.slice(0, 3).join(', ')}${pending.length > 3 ? ' and more' : ''}. Check the details, then untick "to confirm" in the editor.` });
  const title = String(seo.title ?? '').trim(), desc = String(seo.description ?? '').trim();
  if (title.length < 25 || title.length > 65) items.push({ id: 'seo-title', severity: 'tip', title: title ? `Google title is ${title.length < 25 ? 'short' : 'long'} (${title.length} letters)` : 'Google title is empty', detail: 'Aim for about 30 to 60 letters so it shows fully in search results.' });
  if (desc.length < 70 || desc.length > 170) items.push({ id: 'seo-desc', severity: 'tip', title: desc ? `Google description is ${desc.length < 70 ? 'short' : 'long'} (${desc.length} letters)` : 'Google description is empty', detail: 'Aim for about 80 to 160 letters: a friendly sentence about the resort.' });
  const faqs = isObj(c.faqSection) && Array.isArray(c.faqSection.faqs) ? c.faqSection.faqs : [];
  if (faqs.length < 5) items.push({ id: 'faq', severity: 'tip', count: faqs.length, title: `Only ${faqs.length} questions in the FAQ`, detail: 'Most guests read the FAQ before booking. Five to ten of the questions you hear most is a good number.' });
  return items;
}

const BIG = 500 * 1024;
async function photoSizes(): Promise<{ path: string; size: number }[] | null> {
  try {
    if (process.env.MEDIA_BACKEND === 'local' || process.env.TINA_PUBLIC_IS_LOCAL === 'true') {
      const root = path.join(process.cwd(), 'public', 'img');
      const out: { path: string; size: number }[] = [];
      for (const e of await readdir(root, { withFileTypes: true })) {
        if (e.isFile()) out.push({ path: `/img/${e.name}`, size: (await stat(path.join(root, e.name))).size });
      }
      return out;
    }
    const cfg = ghConfigFromEnv();
    return cfg ? await githubPhotoSizes(cfg) : null;
  } catch { return null; }
}

let cache: { at: number; h: Health } | null = null;
export async function siteHealth(content: Record<string, Json>): Promise<Health> {
  if (cache && Date.now() - cache.at < 600_000) return cache.h;
  const items = checkContent(content);
  const sizes = await photoSizes();
  if (sizes) {
    const used = new Set(photosIn(content).map(p => p.src));
    const big = sizes.filter(s => s.size > BIG && used.has(s.path));
    if (big.length) items.push({ id: 'big', severity: 'tip', count: big.length, title: `${big.length} ${big.length === 1 ? 'photo is' : 'photos are'} larger than 500 KB`, detail: `${big.slice(0, 2).map(b => `${b.path.split('/').pop()} (${Math.round(b.size / 1024)} KB)`).join(', ')}${big.length > 2 ? ' and more' : ''}. Big photos make the page slower on phones. Photos you upload in the editor are already shrunk for you.` });
  }
  const h = { items, checked: 6, photosChecked: !!sizes };
  cache = { at: Date.now(), h };
  return h;
}
