import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { addDoc, extractText, KB_LIMITS } from '@/lib/chat/kb';

export const runtime = 'nodejs';
export const maxDuration = 30;

/* A route handler rather than a server action: server actions cap request bodies at 1 MB, uploads here go up to 4 MB
   (Vercel's function body limit is 4.5 MB). Signed-in admins only, checked here as well as in the middleware.
   The admin's drop zone sends x-adm-fetch and gets JSON (so it can show progress); a plain form post still redirects. */
export async function POST(req: Request) {
  const ajax = req.headers.get('x-adm-fetch') === '1';
  const reply = (ok: boolean, msg: string, status = 200) =>
    ajax ? NextResponse.json(ok ? { ok, title: msg } : { ok, error: msg }, { status })
         : NextResponse.redirect(new URL(`/admin/concierge/knowledge/?${ok ? 'toast=added' : `error=${encodeURIComponent(msg)}`}`, req.url), 303);
  if (!(await auth())?.user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File) || !file.size) throw new Error('Choose a PDF or Word (.docx) file first.');
    if (file.size > KB_LIMITS.fileBytes) throw new Error('That file is over 4 MB. Split it or remove large images.');
    const { kind, text } = await extractText(file);
    const title = String(form.get('title') ?? '').trim() || file.name.replace(/\.(pdf|docx)$/i, '');
    await addDoc(title, file.name, kind, file.size, text);
    revalidatePath('/admin/concierge/knowledge');
    return reply(true, title);
  } catch (e) {
    return reply(false, e instanceof Error ? e.message : 'Could not read that file.', 200);
  }
}
