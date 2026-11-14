'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { setGapStatus } from '@/lib/insights/chats';

/** Mark a knowledge gap as answered (after its note was saved) or dismissed. */
export async function markGap(key: string, status: 'resolved' | 'dismissed') {
  if (!(await auth())?.user) throw new Error('Not signed in');
  if (!/^[a-z0-9]{1,16}$/.test(key)) return;
  await setGapStatus(key, status);
  revalidatePath('/admin/insights');
  revalidatePath('/admin');
}
