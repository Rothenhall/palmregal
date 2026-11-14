'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { addDoc, KB_LIMITS, removeDoc, updateDoc } from '@/lib/chat/kb';

async function guard() {
  if (!(await auth())?.user) throw new Error('Not signed in');
}
const done = () => revalidatePath('/admin/knowledge');

export async function addNote(formData: FormData) {
  await guard();
  const title = String(formData.get('title') ?? '').trim();
  const text = String(formData.get('text') ?? '').trim();
  let q = 'added=1';
  try {
    if (!title || !text) throw new Error('Give the note a title and some text.');
    if (text.length > KB_LIMITS.noteChars) throw new Error(`Notes can be up to ${KB_LIMITS.noteChars.toLocaleString('en-IN')} characters.`);
    await addDoc(title, 'note', 'note', text.length, text);
  } catch (e) { q = `error=${encodeURIComponent(e instanceof Error ? e.message : 'Could not save.')}`; }
  done();
  redirect(`/admin/knowledge/?${q}`);
}

export async function renameDoc(formData: FormData) {
  await guard();
  await updateDoc(String(formData.get('id')), { title: String(formData.get('title') ?? '') });
  done();
  redirect(`/admin/knowledge/view/?id=${encodeURIComponent(String(formData.get('id')))}`);
}

export async function toggleDoc(formData: FormData) {
  await guard();
  await updateDoc(String(formData.get('id')), { enabled: formData.get('enabled') === '1' });
  done();
  redirect(`/admin/knowledge/view/?id=${encodeURIComponent(String(formData.get('id')))}`);
}

export async function deleteDoc(formData: FormData) {
  await guard();
  await removeDoc(String(formData.get('id')));
  done();
  redirect('/admin/knowledge/');
}
