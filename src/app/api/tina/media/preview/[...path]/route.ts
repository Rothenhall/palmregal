import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fail } from '@/lib/media/http';
import { MIME, cleanFilePath, extOf } from '@/lib/media/rules';
import { getStorage } from '@/lib/media/service';

/* Streams a photo from the photo store (the GitHub branch on the live site), for admins only.
   A just-uploaded photo is not served at /img/... until Vercel has redeployed (1-2 minutes). next.config.mjs sends any
   /img/* request that matches no real file here (fallback rewrite), so the editor shows new photos at once.
   Signed-out callers get a plain 404, so visitors see an ordinary missing image and nothing is revealed. */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session?.user) return notFound();
  try {
    const { path } = await ctx.params;
    const { rel, name } = cleanFilePath(path.map(decodeURIComponent).join('/'));
    const bytes = await getStorage().read(rel);
    if (!bytes) return notFound();
    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': MIME[extOf(name)] ?? 'application/octet-stream',
        'Content-Length': String(bytes.length),
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    });
  } catch (e) {
    return e instanceof Error && 'status' in e && (e as { status: number }).status === 400 ? notFound() : fail(e);
  }
}
