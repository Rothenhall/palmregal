import type { Metadata, Viewport } from 'next';
import { SiteDocument } from '@/components/SiteDocument';
import { content } from '@/content/site';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: content.seo.title, template: '%s · Palm Regal Gopalpur' },
  description: content.seo.description,
  icons: { icon: '/img/emblem.png' },
  openGraph: { type: 'website', siteName: 'Palm Regal', images: [content.seo.image] },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#193F47' };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
