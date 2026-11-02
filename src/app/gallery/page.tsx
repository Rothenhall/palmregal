import type { Metadata } from 'next';
import { PageHero, Cta } from '@/components/Blocks';
import { GalleryChapters } from '@/components/GalleryGrid';
import { CHAPTERS } from '@/content/site';
import { SubNav } from '@/components/SubNav';

export const metadata: Metadata = { title: 'Gallery', description: 'Photos of the suites, gardens, pool and sea at Palm Regal, Gopalpur on Sea.' };

export default function Gallery() {
  return (
    <>
      <PageHero img="/img/amphitheatre.webp" alt="Lawns and amphitheatre at Palm Regal" crumb="Gallery" eyebrow="In four chapters" title="See it before" em="you arrive." lede="The gardens, the suites, the pool and the sea, as our guests find them." />
      <SubNav label="Gallery chapters" items={CHAPTERS.map(c => ({ id: c.id, label: `${c.title} ${c.em.replace('.', '')}` }))} />
      <GalleryChapters />
      <Cta />
    </>
  );
}
