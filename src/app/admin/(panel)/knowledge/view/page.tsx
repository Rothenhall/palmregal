import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDoc } from '@/lib/chat/kb';
import { deleteDoc, renameDoc, toggleDoc } from '../actions';

export const metadata = { title: 'Document' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const found = id ? await getDoc(id) : null;
  if (!found) notFound();
  const { doc, chunks } = found;
  return (
    <>
      <header className="adm-head">
        <p><Link href="/admin/knowledge/">&larr; Knowledge</Link></p>
        <h1>{doc.title}</h1>
        <p>{doc.kind === 'note' ? 'Note' : doc.filename} · {doc.chars.toLocaleString('en-IN')} characters · added {new Date(doc.at).toLocaleDateString('en-IN')} · {doc.enabled ? 'in use' : 'switched off'}</p>
      </header>
      <div className="adm-card adm-form">
        <h2>Manage</h2>
        <form action={renameDoc} className="adm-actions">
          <input type="hidden" name="id" value={doc.id} />
          <input name="title" defaultValue={doc.title} maxLength={80} aria-label="Title" style={{ maxWidth: '22rem' }} />
          <button className="adm-btn adm-btn--line" type="submit">Rename</button>
        </form>
        <div className="adm-actions">
          <form action={toggleDoc}><input type="hidden" name="id" value={doc.id} /><input type="hidden" name="enabled" value={doc.enabled ? '0' : '1'} /><button className="adm-btn adm-btn--line" type="submit">{doc.enabled ? 'Switch off' : 'Switch on'}</button></form>
          <form action={deleteDoc}><input type="hidden" name="id" value={doc.id} /><button className="adm-btn adm-btn--danger" type="submit">Delete</button></form>
        </div>
      </div>
      <section className="adm-card adm-form" aria-labelledby="text">
        <h2 id="text">What was read from it</h2>
        <p><small>This is exactly what the assistant can see. If it looks wrong or empty, upload a cleaner file or paste the text as a note.</small></p>
        <pre className="adm-pre">{chunks.map(c => c).join('\n\n')}</pre>
      </section>
    </>
  );
}
