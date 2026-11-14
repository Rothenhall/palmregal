import { NextResponse } from 'next/server';
import { fail, guard } from '@/lib/media/http';
import { deleteImage, getStorage, listMedia, uploadImage } from '@/lib/media/service';
import { MAX_UPLOAD_BYTES } from '@/lib/media/shared';
import { MediaError } from '@/lib/media/rules';

/* The editor's photo library (src/../tina/media-store.ts talks to this). Every handler needs an admin session.
   GET list, POST upload one (already shrunk by the browser) photo, DELETE one photo (refused while the website uses it). */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noStore = { 'Cache-Control': 'no-store' };

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const q = new URL(req.url).searchParams;
    const out = await listMedia(getStorage(), {
      dir: q.get('directory') ?? '',
      limit: Number(q.get('limit')) || undefined,
      offset: Number(q.get('offset')) || undefined,
      search: q.get('search') ?? '',
      ext: (q.get('ext') ?? '').split(',').filter(Boolean),
      filesOnly: q.get('filesOnly') === 'true',
    });
    return NextResponse.json(out, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  const denied = await guard(req, { write: true });
  if (denied) return denied;
  try {
    // refuse oversized bodies before reading them (Vercel itself stops at about 4.5 MB)
    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_UPLOAD_BYTES + 64 * 1024) throw new MediaError(413, 'That photo is too large (the limit is 4 MB). Try a smaller one.');
    const form = await req.formData().catch(() => null);
    const files = form?.getAll('file').filter((f): f is File => typeof f !== 'string') ?? [];
    if (files.length !== 1) throw new MediaError(400, 'Upload one photo at a time.');
    const file = files[0];
    if (file.size > MAX_UPLOAD_BYTES) throw new MediaError(413, 'That photo is too large (the limit is 4 MB). Try a smaller one.');
    const saved = await uploadImage(getStorage(), {
      bytes: new Uint8Array(await file.arrayBuffer()),
      filename: String(form?.get('filename') || file.name || 'photo'),
      dir: String(form?.get('directory') ?? ''),
    });
    return NextResponse.json({ success: true, ...saved }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  const denied = await guard(req, { write: true });
  if (denied) return denied;
  try {
    await deleteImage(getStorage(), new URL(req.url).searchParams.get('path') ?? '');
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch (e) {
    return fail(e);
  }
}
