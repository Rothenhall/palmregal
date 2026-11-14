import type { Metadata, Viewport } from 'next';
import { SiteHead } from '@/components/SiteDocument';
import 'lenis/dist/lenis.css';
import '@/app/globals.css';

/* Root layout for the editor's preview only. Same fonts and CSS as the public site, but never indexed. */
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false, nocache: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#193F47' };

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <SiteHead />
      <body className="draft">
        {/* Slides and overlays stack on top of each other on the real page; here only the visible one may take clicks, so clicking edits what you see. */}
        <style>{'.hs-slide:not(.on),.hs-caption:not(.on){pointer-events:none}.hs-shade,.aerial-hero__shade,.lost-shade,.dcard-veil{pointer-events:none}'}</style>
        {children}
      </body>
    </html>
  );
}
