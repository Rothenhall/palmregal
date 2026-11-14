import type { Metadata, Viewport } from 'next';
import './admin.css';

/* Its own root layout: none of the public site's header, motion or CSS is loaded here. */
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Palm Regal Admin' },
  robots: { index: false, follow: false, nocache: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#193F47' };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Figtree:wght@400;500;600&display=swap" />
      </head>
      <body className="adm">{children}</body>
    </html>
  );
}
