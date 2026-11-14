'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ghConfigFromEnv, undoLastChange, type UndoResult } from '@/lib/insights/website';
import { clearSiteStatus } from '../../_lib/data';

/** Puts the previous text back as a new commit on the site's branch (Vercel republishes in about 2 minutes). Photos are not touched. */
export async function undoWebsiteChange(expectedSha: string): Promise<UndoResult> {
  if (!(await auth())?.user) throw new Error('Not signed in');
  if (!/^[0-9a-f]{7,40}$/.test(expectedSha)) return { ok: false, error: 'That change could not be found.' };
  const r = await undoLastChange(ghConfigFromEnv(), expectedSha);
  clearSiteStatus();
  revalidatePath('/admin/website'); revalidatePath('/admin');
  return r;
}
