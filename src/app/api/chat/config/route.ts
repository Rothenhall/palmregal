import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/chat/config';
import { redisConfigured } from '@/lib/chat/redis';

export const runtime = 'nodejs';

/* Public, cacheable and cookie-free: what the launcher needs to decide whether and how to appear.
   Fetched after the page is idle, so it never blocks the homepage. */
export async function GET() {
  const s = redisConfigured() && process.env.SARVAM_API_KEY ? await getSettings() : null;
  const body = s?.enabled
    ? { enabled: true, name: s.name, teaser: s.teaserOn ? { text: s.teaserText, delay: s.teaserDelay, scroll: s.teaserScroll, mobile: s.teaserMobile, days: s.teaserDays } : null }
    : { enabled: false };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } });
}
