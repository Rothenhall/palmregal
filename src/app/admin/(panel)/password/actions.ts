'use server';
import { auth } from '@/auth';
import { changePassword, type ChangeResult } from '@/lib/adminPassword';

export async function updatePassword(_prev: ChangeResult | null, form: FormData): Promise<ChangeResult> {
  if (!(await auth())?.user) return { ok: false, error: 'Please sign in again.' };
  const get = (k: string) => String(form.get(k) ?? '');
  try { return await changePassword(get('current'), get('next'), get('confirm')); }
  catch { return { ok: false, error: 'Could not save the new password. Please try again.' }; }
}
