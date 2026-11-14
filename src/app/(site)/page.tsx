import { SiteBody } from '@/components/SiteBody';
import { content } from '@/content/site';

/* Prerendered at build time from content/site/home.json. Nothing here knows about the editor. */
export default function Home() {
  return <SiteBody content={content} />;
}
