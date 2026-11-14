import { content } from '@/content/site';
import { PreviewClient } from './PreviewClient';

/* Only the editor loads this (an iframe inside /admin/editor/), and only for a signed-in admin:
   src/middleware.ts guards /admin/*. It is the public homepage fed with live data. */
export const dynamic = 'force-dynamic';

export default function PreviewPage() {
  return <PreviewClient initial={content} />;
}
