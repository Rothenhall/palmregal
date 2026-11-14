'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getSettings, saveSettings, type ChatSettings } from '@/lib/chat/config';
import { removeBlock } from '@/lib/chat/store';
import type { BlockKind } from '@/lib/chat/guard';

async function guard() {
  const s = await auth();
  if (!s?.user) throw new Error('Not signed in');
}

export type SaveState = { ok: boolean; at: number; error?: string; saved?: ChatSettings } | null;

/** Same validation as before: everything goes through sanitize() in saveSettings. Returns the clamped values so the form can rebase on them. */
export async function saveChatSettings(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await guard();
  try {
    const o: Record<string, unknown> = {};
    for (const [key, v] of formData.entries()) if (typeof v === 'string') o[key] = v;
    for (const b of ['enabled', 'teaserOn', 'teaserScroll', 'teaserMobile']) o[b] = formData.get(b) === 'on';
    const saved = await saveSettings(o);
    revalidatePath('/admin', 'layout');
    return { ok: true, at: Date.now(), saved };
  } catch {
    return { ok: false, at: Date.now(), error: 'Could not save. Please try again.' };
  }
}

/** One-tap on/off from Home. */
export async function setAssistantOn(formData: FormData) {
  await guard();
  const s = await getSettings(true);
  await saveSettings({ ...s, enabled: formData.get('on') === '1' });
  revalidatePath('/admin', 'layout');
  redirect('/admin/?toast=saved');
}

export async function unblock(formData: FormData) {
  await guard();
  const kind = String(formData.get('kind')) as BlockKind;
  if (!['ip', 'visitor', 'fp'].includes(kind)) return;
  await removeBlock(kind, String(formData.get('hash')));
  revalidatePath('/admin/concierge');
  redirect('/admin/concierge/?toast=unblocked#blocked');
}
