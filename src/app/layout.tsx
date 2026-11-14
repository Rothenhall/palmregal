import type { Metadata, Viewport } from 'next';
import 'lenis/dist/lenis.css';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IconSprite, Icon } from '@/components/Icons';
import { Motion } from '@/components/Motion';
import { site } from '@/content/site';
import { DRAFT, waHref } from '@/lib/book';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Palm Regal · Serviced suites by the sea in Gopalpur', template: '%s · Palm Regal Gopalpur' },
  description: "Serviced suites with their own living room, kitchenette and balcony, among palms and lawns, five minutes' walk from Gopalpur beach in Odisha. Pets welcome.",
  icons: { icon: '/img/emblem.png' },
  openGraph: { type: 'website', siteName: 'Palm Regal', images: ['/img/exterior-2.webp'] },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#193F47' };

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: 'Palm Regal Resort Homestay',
  address: { '@type': 'PostalAddress', streetAddress: '1 Park Avenue, Adjt. Zone by the Park', addressLocality: 'Gopalpur on Sea', addressRegion: 'Odisha', postalCode: '761002', addressCountry: 'IN' },
  telephone: '+917205970222', email: site.email, checkinTime: '12:00', checkoutTime: '10:00', petsAllowed: true,
  amenityFeature: ['Swimming pool', 'Gym', 'Restaurant', 'Kitchenette', 'Parking', 'Wi-Fi'].map(n => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..500,0..100;1,9..144,300..500,0..100&family=Figtree:ital,wght@0,400;0,500;0,600;1,400&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var d=document.documentElement;d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion');})();" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={DRAFT ? 'draft' : undefined}>
        <a className="skip" href="#main">Skip to content</a>
        <IconSprite />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <a className="wa" href={waHref()} aria-label="Chat with Palm Regal on WhatsApp"><span className="t">Chat with us</span><span className="b"><Icon id="i-wa" /></span></a>
        <Motion />
      </body>
    </html>
  );
}
