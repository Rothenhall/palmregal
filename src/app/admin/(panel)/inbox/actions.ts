'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { addBlock, deleteConv, getConv, setConvStatus, validCid } from '@/lib/chat/store';

async function guard() {
  if (!(await auth())?.user) throw new Error('Not signed in');
}
const refresh = () => { revalidatePath('/admin', 'layout'); };

export async function markDone(id: string, done: boolean) {
  await guard();
  if (!validCid(id)) return;
  await setConvStatus(id, done ? 'done' : 'open');
  refresh();
}

/** Blocks the visitor (and their device when known). The network is optional: it also affects others on the same Wi-Fi. */
export async function blockGuest(id: string, alsoNetwork: boolean) {
  await guard();
  if (!validCid(id)) return;
  const conv = await getConv(id);
  if (!conv) return;
  await addBlock('visitor', conv.visitor, conv.visitor.slice(0, 8));
  if (conv.fp) await addBlock('fp', conv.fp, conv.fp.slice(0, 8));
  if (alsoNetwork) await addBlock('ip', conv.ipHash, conv.ipMask);
  refresh();
}

export async function removeConversation(id: string) {
  await guard();
  if (validCid(id)) await deleteConv(id);
  refresh();
  redirect('/admin/inbox/?toast=deleted');
}
