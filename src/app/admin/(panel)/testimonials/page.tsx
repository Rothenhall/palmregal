import { promises as fs } from 'fs';
import path from 'path';
import { content } from '@/content/site';
import { CONTENT_FILE, ghConfigFromEnv, readContentFile } from '@/lib/insights/website';
import { PageHeader } from '../../_ui/ui';
import { TestimonialsEditor } from './TestimonialsEditor';
import type { TestimonialsDraft } from './shared';

export const metadata = { title: 'Testimonials' };
export const dynamic = 'force-dynamic';

/* The freshest copy: the branch on GitHub when publishing is connected (a save shows here at once, before the
   website has republished), the local file on a developer's computer, and the built-in copy as a last resort. */
async function current(): Promise<{ t: TestimonialsDraft; connected: boolean }> {
  const cfg = ghConfigFromEnv();
  if (cfg) {
    const r = await readContentFile(cfg);
    if (r?.data.testimonials) return { t: r.data.testimonials as TestimonialsDraft, connected: true };
  } else if (process.env.NODE_ENV !== 'production') {
    try { const d = JSON.parse(await fs.readFile(path.join(process.cwd(), CONTENT_FILE), 'utf8')); if (d.testimonials) return { t: d.testimonials, connected: false }; } catch { /* fall through */ }
  }
  return { t: content.testimonials as TestimonialsDraft, connected: Boolean(cfg) };
}

export default async function Page() {
  const { t, connected } = await current();
  return (
    <div className="adm-page">
      <PageHeader
        title="Testimonials"
        description="Words from real guests, shown as a wall of cards on your website just before the questions and contact form."
      />
      <TestimonialsEditor initial={{ show: !!t.show, eyebrow: t.eyebrow ?? '', heading: t.heading ?? '', intro: t.intro ?? '', items: t.items ?? [] }} connected={connected} />
    </div>
  );
}
