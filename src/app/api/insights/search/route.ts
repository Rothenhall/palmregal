import { hashIp, clientIp, originOk, slide } from '@/lib/chat/guard';
import { redisConfigured } from '@/lib/chat/redis';
import { recordSearch, validate } from '@/lib/insights/searches';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* "Check availability" beacon from the booking picker. Stores anonymous counters only (see lib/insights/searches.ts):
   the IP is used once, hashed, as the rate-limit key and is never stored with the search. Always answers 204 so the
   page can ignore the result; bad or excessive requests are dropped silently. */
const empty = (status = 204) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  if (!originOk(req)) return empty(403);
  if (!redisConfigured()) return empty();
  let body: unknown;
  try { body = JSON.parse(await req.text()); } catch { return empty(400); }
  const s = validate(body);
  if (!s) return empty(400);
  try {
    const v = await slide('ins', hashIp(clientIp(req.headers)), 30, 3600);
    if (!v.ok) return empty(429);
    await recordSearch(s);
  } catch { /* analytics must never get in a guest's way */ }
  return empty();
}
