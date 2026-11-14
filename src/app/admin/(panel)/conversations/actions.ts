'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { addBlock, deleteConv, getConv } from '@/lib/chat/store';
import type { BlockKind } from '@/lib/chat/guard';

async function guard() {
  if (!(await auth())?.user) throw new Error('Not signed in');
}

export async function blockFrom(formData: FormData) {
  await guard();
  const conv = await getConv(String(formData.get('id')));
  const kind = String(formData.get('kind')) as BlockKind;
  if (!conv) return;
  if (kind === 'ip') await addBlock('ip', conv.ipHash, conv.ipMask);
  else if (kind === 'visitor') await addBlock('visitor', conv.visitor, conv.visitor.slice(0, 8));
  else if (kind === 'fp' && conv.fp) await addBlock('fp', conv.fp, conv.fp.slice(0, 8));
  revalidatePath('/admin/conversations');
  revalidatePath('/admin/settings');
  redirect(`/admin/conversations/view/?id=${encodeURIComponent(conv.id)}&blocked=${kind}`);
}

export async function removeConversation(formData: FormData) {
  await guard();
  await deleteConv(String(formData.get('id')));
  revalidatePath('/admin/conversations');
  redirect('/admin/conversations/');
}
