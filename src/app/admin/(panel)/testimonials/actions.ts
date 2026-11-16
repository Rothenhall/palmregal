'use server';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { CONTENT_FILE, editContentFile, ghConfigFromEnv } from '@/lib/insights/website';
import type { Testimonial } from '@/content/types';
import { clearSiteStatus } from '../../_lib/data';
import { SOURCES, type TestimonialsDraft } from './shared';

export type SaveResult = { ok: true; local: boolean } | { ok: false; error: string };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Everything that reaches the website file is checked again here, whatever the form sent. */
function clean(d: TestimonialsDraft): { section: TestimonialsDraft; error?: string } {
  const items: Testimonial[] = [];
  for (const [k, raw] of (Array.isArray(d.items) ? d.items : []).slice(0, 30).entries()) {
    const quote = str(raw.quote, 700), name = str(raw.name, 60);
    if (!quote && !name) continue;
    if (!quote || !name) return { section: d, error: `Testimonial ${k + 1} needs both the guest's words and their name.` };
    const rating = Number(raw.rating);
    const link = str(raw.link, 400), photo = str(raw.photo, 400), source = str(raw.source, 40);
    items.push({
      quote, name,
      from: str(raw.from, 60) || null,
      stayed: str(raw.stayed, 40) || null,
      rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
      source: (SOURCES as readonly string[]).includes(source) ? source : null,
      link: /^https:\/\/\S+$/i.test(link) ? link : null,
      photo: /^(\/img\/|https:\/\/)\S+$/i.test(photo) ? photo : null,
    });
  }
  return {
    section: {
      show: d.show === true,
      eyebrow: str(d.eyebrow, 60),
      heading: str(d.heading, 90) || 'What our guests say',
      intro: str(d.intro, 300),
      items,
    },
  };
}

export async function saveTestimonials(draft: TestimonialsDraft): Promise<SaveResult> {
  if (!(await auth())?.user) return { ok: false, error: 'Please sign in again.' };
  const { section, error } = clean(draft);
  if (error) return { ok: false, error };
  const apply = (data: Record<string, unknown>) => {
    /* keep the overall Google rating, which this form does not edit */
    const old = (data.testimonials ?? {}) as { overall?: unknown };
    data.testimonials = old.overall ? { ...section, overall: old.overall } : section;
  };

  const cfg = ghConfigFromEnv();
  if (!cfg) {
    // On a developer's computer (no publishing connection) the change is written to the local file instead.
    if (process.env.NODE_ENV === 'production') return { ok: false, error: 'Publishing is not set up on this server.' };
    try {
      const file = path.join(process.cwd(), CONTENT_FILE);
      const raw = await fs.readFile(file, 'utf8');
      const data = JSON.parse(raw);
      apply(data);
      const out = JSON.stringify(data, null, 2) + '\n';
      await fs.writeFile(file, raw.includes('\r\n') ? out.replace(/\n/g, '\r\n') : out);
    } catch { return { ok: false, error: 'Could not write the website file.' }; }
    revalidatePath('/admin/testimonials');
    return { ok: true, local: true };
  }

  const n = section.items.length;
  const r = await editContentFile(cfg, apply, `Admin: update guest testimonials (${n} ${n === 1 ? 'review' : 'reviews'}${section.show ? '' : ', hidden'})`);
  if (!r.ok) return r;
  clearSiteStatus();
  revalidatePath('/admin/testimonials'); revalidatePath('/admin/website'); revalidatePath('/admin');
  return { ok: true, local: false };
}
