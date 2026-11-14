'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudUpload, FileText, Loader2, X } from 'lucide-react';
import { Dialog } from '../../../_ui/Dialog';
import { Segmented } from '../../../_ui/Segmented';
import { useToast } from '../../../_ui/Toast';
import { Field, Input, Textarea, btn } from '../../../_ui/ui';
import { addNote } from './actions';

type Tab = 'file' | 'note';
const ACCEPT = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export type AddDefaults = { tab?: Tab; title?: string; hint?: string };

export function AddKnowledge({ open, onClose, limits, defaults, onAdded }: { open: boolean; onClose: () => void; limits: { noteChars: number; fileMb: number }; defaults?: AddDefaults; onAdded?: (title: string) => void | Promise<void> }) {
  const [tab, setTab] = useState<Tab>('file');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<number | null>(null); // 0-100 uploading, 101 = reading
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();
  const busy = progress !== null;
  useEffect(() => { if (open && defaults) { setTab(defaults.tab ?? 'file'); setTitle(defaults.title ?? ''); setText(''); setError(''); } }, [open, defaults]);

  const reset = () => { setFile(null); setTitle(''); setText(''); setError(''); setProgress(null); setDrag(false); };
  const close = () => { if (busy) return; reset(); onClose(); };
  const finish = (name: string) => { reset(); onClose(); toast(`Added “${name}”. The assistant can use it now.`); void onAdded?.(name); router.refresh(); };

  const pick = (f: File | undefined | null) => {
    setError('');
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name)) { setError('Only PDF and Word (.docx) files can be added. Older .doc files: open them in Word and save as .docx.'); return; }
    if (f.size > limits.fileMb * 1048576) { setError(`That file is over ${limits.fileMb} MB. Split it or remove large images.`); return; }
    setFile(f);
  };

  const upload = () => {
    if (!file) return;
    setError(''); setProgress(0);
    const fd = new FormData();
    fd.set('file', file); fd.set('title', title);
    const x = new XMLHttpRequest();
    x.open('POST', '/admin/concierge/knowledge/upload/');
    x.setRequestHeader('x-adm-fetch', '1');
    x.upload.onprogress = e => { if (e.lengthComputable) setProgress(e.loaded >= e.total ? 101 : Math.round((e.loaded / e.total) * 100)); };
    x.upload.onload = () => setProgress(101);
    x.onerror = () => { setProgress(null); setError('The upload did not go through. Check your connection and try again.'); };
    x.onload = () => {
      let r: { ok?: boolean; error?: string; title?: string } = {};
      try { r = JSON.parse(x.responseText); } catch {}
      if (r.ok) finish(r.title ?? file.name);
      else { setProgress(null); setError(r.error ?? 'Could not read that file.'); }
    };
    x.send(fd);
  };

  const saveNote = async () => {
    setError(''); setProgress(101);
    try {
      const r = await addNote(title, text);
      if (r.ok) finish(r.title ?? title); else { setProgress(null); setError(r.error); }
    } catch { setProgress(null); setError('Something went wrong. Please try again.'); }
  };

  return (
    <Dialog
      open={open} onClose={close} wide
      title="Add knowledge" description="Teach the assistant something it can use when guests ask. Only the text is kept, not the original file."
      footer={
        <>
          <button type="button" className={btn('secondary')} onClick={close} disabled={busy}>Cancel</button>
          {tab === 'file'
            ? <button type="button" className={btn('primary')} onClick={upload} disabled={!file || busy}>{busy ? 'Adding…' : 'Add file'}</button>
            : <button type="button" className={btn('primary')} onClick={saveNote} disabled={!title.trim() || !text.trim() || busy}>{busy ? 'Adding…' : 'Add note'}</button>}
        </>
      }
    >
      <Segmented<Tab> label="How to add" value={tab} onChange={t => { setTab(t); setError(''); }} options={[{ value: 'file', label: 'Upload a file' }, { value: 'note', label: 'Write a note' }]} />
      <div className="adm-add-body">
        {tab === 'file' ? (
          <>
            {!file ? (
              <label
                className={`adm-drop${drag ? ' is-drag' : ''}`}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              >
                <CloudUpload size={26} aria-hidden="true" />
                <b>Drag a file here, or <u>browse</u></b>
                <small>PDF or Word (.docx), up to {limits.fileMb} MB</small>
                <input ref={input} type="file" accept={ACCEPT} onChange={e => pick(e.target.files?.[0])} />
              </label>
            ) : (
              <div className="adm-file">
                <FileText size={20} aria-hidden="true" />
                <span><b>{file.name}</b><small>{size(file.size)}</small></span>
                {!busy && <button type="button" className={btn('ghost', 'sm', true)} aria-label="Remove file" onClick={() => { setFile(null); if (input.current) input.current.value = ''; }}><X size={16} /></button>}
              </div>
            )}
            {busy && (
              <div className="adm-upstate" role="status">
                <div className="adm-progress"><span style={{ width: `${Math.min(progress!, 100)}%`, transition: 'width .2s' }} /></div>
                <small>{progress! > 100 ? <><Loader2 size={13} className="adm-spin" aria-hidden="true" /> Reading the document…</> : `Uploading… ${progress}%`}</small>
              </div>
            )}
            <Field label="Title (optional)" htmlFor="k-title" help="Shown in your library. Defaults to the file name.">
              <Input id="k-title" value={title} maxLength={80} placeholder="Cancellation policy" onChange={e => setTitle(e.target.value)} disabled={busy} />
            </Field>
            <p className="adm-fineprint">Scanned PDFs (pictures of pages) have no text to read: paste the text as a note instead.</p>
          </>
        ) : (
          <>
            <Field label="Title" htmlFor="n-title" counter={`${title.length}/80`}>
              <Input id="n-title" value={title} maxLength={80} placeholder="Pet policy" onChange={e => setTitle(e.target.value)} disabled={busy} />
            </Field>
            <Field label="What should the assistant know?" htmlFor="n-text" counter={`${text.length.toLocaleString('en-IN')}/${limits.noteChars.toLocaleString('en-IN')}`}>
              <Textarea id="n-text" rows={7} value={text} maxLength={limits.noteChars} placeholder={defaults?.hint ?? "Small pets are welcome on request with a refundable deposit…"} onChange={e => setText(e.target.value)} disabled={busy} />
            </Field>
          </>
        )}
        {error && <p className="adm-inline-error" role="alert">{error}</p>}
      </div>
    </Dialog>
  );
}
