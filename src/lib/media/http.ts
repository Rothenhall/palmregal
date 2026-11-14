import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { MediaError } from './rules';

/* Shared by the photo routes: admin-session check, same-origin check for writes, uniform JSON errors. */

/** Returns an error response if the caller is not a signed-in admin (401) or a write came from another site (403). */
export async function guard(req: Request, opts: { write?: boolean } = {}): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Not signed in' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  if (opts.write) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (origin) {
      let same = false;
      try { same = new URL(origin).host === host; } catch { /* bad Origin header */ }
      if (!same) return NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 });
    }
  }
  return null;
}

export function fail(e: unknown): NextResponse {
  if (e instanceof MediaError) return NextResponse.json({ error: e.message }, { status: e.status, headers: { 'Cache-Control': 'no-store' } });
  console.error('[photos]', e);
  return NextResponse.json({ error: 'Something went wrong with the photos. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
}
