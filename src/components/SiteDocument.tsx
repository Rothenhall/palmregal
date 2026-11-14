import 'lenis/dist/lenis.css';
import '@/app/globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { content as siteContent } from '@/content/site';
import type { SiteContent } from '@/content/types';
import { DRAFT, telHref } from '@/lib/book';

const jsonLd = (c: SiteContent) => ({
  '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: 'Palm Regal Resort Homestay',
  address: { '@type': 'PostalAddress', streetAddress: '1 Park Avenue, Adjt. Zone by the Park', addressLocality: 'Gopalpur on Sea', addressRegion: 'Odisha', postalCode: '761002', addressCountry: 'IN' },
  telephone: telHref(c.general.phone).replace('tel:', ''), email: c.general.email, checkinTime: '12:00', checkoutTime: '10:00', petsAllowed: true,
  amenityFeature: ['Swimming pool', 'Gym', 'Restaurant', 'Kitchenette', 'Parking', 'Wi-Fi'].map(n => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
});

/* Fonts, the motion switch and structured data. Shared by the public document and the editor's preview. */
export function SiteHead({ content = siteContent }: { content?: SiteContent }) {
  return (
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..500,0..100;1,9..144,300..500,0..100&family=Figtree:ital,wght@0,400;0,500;0,600;1,400&display=swap" />
      <script dangerouslySetInnerHTML={{ __html: "(function(){var d=document.documentElement;d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion');})();" }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(content)) }} />
    </head>
  );
}

/* The public document shell (html, fonts, header, footer, motion). Shared by the site layout and the global 404. */
export function SiteDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <SiteHead />
      <body className={DRAFT ? 'draft' : undefined}>
        <SiteChrome content={siteContent}>{children}</SiteChrome>
      </body>
    </html>
  );
}
