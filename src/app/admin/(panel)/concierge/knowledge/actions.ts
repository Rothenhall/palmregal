'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { addDoc, KB_LIMITS, removeDoc, updateDoc } from '@/lib/chat/kb';

async function guard() {
  if (!(await auth())?.user) throw new Error('Not signed in');
}
const done = () => revalidatePath('/admin/concierge/knowledge');
export type Result = { ok: true; title?: string } | { ok: false; error: string };

export async function addNote(title: string, text: string): Promise<Result> {
  await guard();
  title = title.trim(); text = text.trim();
  try {
    if (!title || !text) throw new Error('Give the note a title and some text.');
    if (text.length > KB_LIMITS.noteChars) throw new Error(`Notes can be up to ${KB_LIMITS.noteChars.toLocaleString('en-IN')} characters.`);
    await addDoc(title, 'note', 'note', text.length, text);
    done();
    return { ok: true, title };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Could not save.' }; }
}

export async function renameDoc(id: string, title: string): Promise<Result> {
  await guard();
  if (!title.trim()) return { ok: false, error: 'The title cannot be empty.' };
  await updateDoc(id, { title });
  done();
  return { ok: true };
}

export async function toggleDoc(id: string, enabled: boolean): Promise<Result> {
  await guard();
  await updateDoc(id, { enabled });
  done();
  return { ok: true };
}

export async function deleteDoc(id: string): Promise<Result> {
  await guard();
  await removeDoc(id);
  done();
  return { ok: true };
}
