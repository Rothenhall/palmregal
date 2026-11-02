import type { Metadata } from 'next';
import { PageHero, Cta } from '@/components/Blocks';
import { GalleryGrid } from '@/components/GalleryGrid';
import { Icon } from '@/components/Icons';
import { Todo } from '@/components/Todo';

export const metadata: Metadata = { title: 'Gallery', description: 'Photos of the suites, gardens, pool and sea at Palm Regal, Gopalpur on Sea.' };

export default function Gallery() {
  return (
    <>
      <PageHero crumb="Gallery" eyebrow="Photos and tour" title="See it before" em="you arrive." lede="The gardens, the suites, the pool and the sea, as our guests find them." />
      <section className="sec" data-bg="mint" style={{ paddingTop: 0 }} aria-label="Photos">
        <div className="wrap">
          <figure className="para" style={{ marginTop: 0, marginBottom: 'clamp(50px,7vw,90px)' }} data-gl="photo" data-depth="-90">
            <img src="/img/amphitheatre.webp" alt="Palm Regal lawns and amphitheatre" loading="lazy" />
            <figcaption><Icon id="i-play" />Video tour <Todo>YouTube link to come</Todo></figcaption>
          </figure>
          <GalleryGrid />
        </div>
      </section>
      <Cta />
    </>
  );
}
