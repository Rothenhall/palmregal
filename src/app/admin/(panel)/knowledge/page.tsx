import Link from 'next/link';
import { redisConfigured } from '@/lib/chat/redis';
import { KB_LIMITS, listDocs } from '@/lib/chat/kb';
import { addNote } from './actions';

export const metadata = { title: 'Knowledge' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ added?: string; error?: string }> }) {
  const { added, error } = await searchParams;
  if (!redisConfigured()) {
    return (
      <>
        <header className="adm-head"><h1>Knowledge</h1></header>
        <div className="adm-card adm-empty"><p>The database is not connected, so documents cannot be shown.</p></div>
      </>
    );
  }
  const docs = await listDocs();
  const total = docs.reduce((n, d) => n + d.chars, 0);
  return (
    <>
      <header className="adm-head"><h1>Knowledge</h1><p>Extra things the chat assistant can answer from, on top of the website itself: policies, menus, tariffs cards, local guides. Only the text is kept, not the original file.</p></header>
      {added && <p className="adm-note" role="status">Added.</p>}
      {error && <p className="adm-error" role="alert">{error}</p>}

      <form className="adm-card adm-form" action="/admin/knowledge/upload/" method="post" encType="multipart/form-data">
        <h2>Upload a document</h2>
        <label>File (PDF or Word .docx, up to 4 MB)<input type="file" name="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label>
        <label>Title (optional)<input name="title" maxLength={80} placeholder="Cancellation policy" /></label>
        <small>Older .doc files are not supported: open them in Word and save as .docx. Scanned PDFs (pictures of pages) have no text to read; paste the text as a note instead.</small>
        <button className="adm-btn" type="submit">Upload</button>
      </form>

      <form className="adm-card adm-form" action={addNote}>
        <h2>Or add a note</h2>
        <label>Title<input name="title" maxLength={80} required placeholder="Pet policy" /></label>
        <label>Text<textarea name="text" rows={5} maxLength={KB_LIMITS.noteChars} required placeholder="Small pets are welcome on request with a refundable deposit..." /></label>
        <button className="adm-btn" type="submit">Add note</button>
      </form>

      <section className="adm-card adm-form" aria-labelledby="docs">
        <h2 id="docs">What the assistant knows ({docs.length} of {KB_LIMITS.docs})</h2>
        {docs.length === 0 ? <p>Nothing added yet.</p> : (
          <ul className="adm-list">
            {docs.map(d => (
              <li key={d.id}>
                <span><Link href={`/admin/knowledge/view/?id=${encodeURIComponent(d.id)}`}><strong>{d.title}</strong></Link> <small>{d.kind === 'note' ? 'note' : d.filename} · {d.chars.toLocaleString('en-IN')} characters · {new Date(d.at).toLocaleDateString('en-IN')}</small>{!d.enabled && <b className="adm-flag">off</b>}</span>
              </li>
            ))}
          </ul>
        )}
        <p><small>{total.toLocaleString('en-IN')} of {KB_LIMITS.totalChars.toLocaleString('en-IN')} characters used.</small></p>
      </section>
    </>
  );
}
