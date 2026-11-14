'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { saveSettings } from '@/lib/chat/config';
import { removeBlock } from '@/lib/chat/store';
import type { BlockKind } from '@/lib/chat/guard';

async function guard() {
  const s = await auth();
  if (!s?.user) throw new Error('Not signed in');
}

export async function saveChatSettings(formData: FormData) {
  await guard();
  const o: Record<string, unknown> = {};
  for (const [key, v] of formData.entries()) if (typeof v === 'string') o[key] = v;
  for (const b of ['enabled', 'teaserOn', 'teaserScroll', 'teaserMobile']) o[b] = formData.get(b) === 'on';
  await saveSettings(o);
  revalidatePath('/admin/settings');
  redirect('/admin/settings/?saved=1');
}

export async function unblock(formData: FormData) {
  await guard();
  const kind = String(formData.get('kind')) as BlockKind;
  if (!['ip', 'visitor', 'fp'].includes(kind)) return;
  await removeBlock(kind, String(formData.get('hash')));
  revalidatePath('/admin/settings');
}
