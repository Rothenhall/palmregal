'use client';
import { useMemo } from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';
import { HomeDocument } from '../../../../../tina/__generated__/types';
import { SiteBody } from '@/components/SiteBody';
import { SiteChrome } from '@/components/SiteChrome';
import type { Edit, SiteContent } from '@/content/types';

/* The homepage, with every text and photo marked clickable. Tina's useTina swaps in the editor's unsaved
   changes as they are typed. This module is only ever loaded by the preview route. */
const f: Edit = (obj, field) => {
  const attr = tinaField(obj as never, field);
  return attr ? { 'data-tina-field': attr } : {};
};

const variables = { relativePath: 'home.json' };

export function PreviewClient({ initial }: { initial: SiteContent }) {
  // useTina re-renders on any new object here, so the inputs must be stable between renders
  const seed = useMemo(() => ({ home: initial }) as never, [initial]);
  const { data } = useTina({ query: HomeDocument, variables, data: seed });
  const content = ((data as unknown as { home?: SiteContent }).home ?? initial) as SiteContent;
  return (
    <SiteChrome content={content} f={f}>
      <SiteBody content={content} f={f} />
    </SiteChrome>
  );
}
