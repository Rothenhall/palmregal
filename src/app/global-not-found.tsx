import type { Metadata } from 'next';
import { SiteDocument } from '@/components/SiteDocument';
import NotFound from './(site)/not-found';

/* Unmatched URLs: with separate root layouts (site, admin) Next needs a self-contained 404 document. */
export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <SiteDocument>
      <NotFound />
    </SiteDocument>
  );
}
