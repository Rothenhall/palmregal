'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, FileText, MoreHorizontal, Pencil, Plus, StickyNote, Trash2 } from 'lucide-react';
import type { KbDoc } from '@/lib/chat/kb';
import { ConfirmDialog, Dialog } from '../../../_ui/Dialog';
import { Menu } from '../../../_ui/Menu';
import { useToast } from '../../../_ui/Toast';
import { Badge, Card, EmptyState, Field, Input, PageHeader, Progress, btn } from '../../../_ui/ui';
import { AddKnowledge } from './AddKnowledge';
import { deleteDoc, renameDoc, toggleDoc } from './actions';

const date = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

export function KnowledgeView({ docs, limits, openAdd, error }: { docs: KbDoc[]; limits: { docs: number; totalChars: number; noteChars: number; fileMb: number }; openAdd: boolean; error?: string }) {
  const [adding, setAdding] = useState(openAdd);
  const [renaming, setRenaming] = useState<KbDoc | null>(null);
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<KbDoc | null>(null);
  const [over, setOver] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const toast = useToast();

  const used = docs.reduce((s, d) => s + d.chars, 0);
  const full = docs.length >= limits.docs;
  const add = <button type="button" className={btn('primary')} onClick={() => setAdding(true)} disabled={full}><Plus size={16} aria-hidden="true" />Add knowledge</button>;

  const toggle = async (d: KbDoc, on: boolean) => {
    setOver(o => ({ ...o, [d.id]: on }));
    try { await toggleDoc(d.id, on); toast(on ? `“${d.title}” is on` : `“${d.title}” is off`); router.refresh(); }
    catch { setOver(o => { const { [d.id]: _, ...r } = o; return r; }); toast('Could not change that. Please try again.', 'error'); }
  };

  return (
    <div className="adm-page">
      <PageHeader title="Knowledge" description="Documents and notes the assistant can answer from, on top of your website: policies, menus, tariff cards, local guides." actions={add} />
      {error && <p className="adm-banner adm-banner--error" role="alert">{error}</p>}

      {docs.length === 0 ? (
        <Card><EmptyState icon={<BookOpen size={22} />} title="Nothing added yet" action={add}>Add a PDF, a Word file or a short note, and the assistant will use it to answer guests.</EmptyState></Card>
      ) : (
        <>
          <Card className="adm-table">
            <div className="adm-table-head" aria-hidden="true"><span>Name</span><span>Added</span><span>Use it</span><span /></div>
            <ul>
              {docs.map(d => {
                const on = over[d.id] ?? d.enabled;
                return (
                  <li key={d.id} className={on ? '' : 'is-off'}>
                    <span className="adm-doc">
                      <span className="adm-doc-icon" aria-hidden="true">{d.kind === 'note' ? <StickyNote size={18} /> : <FileText size={18} />}</span>
                      <span className="adm-doc-text">
                        <a href={`/admin/concierge/knowledge/view/?id=${encodeURIComponent(d.id)}`}>{d.title}</a>
                        <small>{d.kind === 'note' ? 'Note' : d.kind === 'pdf' ? 'PDF' : 'Word'} · {d.chars.toLocaleString('en-IN')} characters{d.kind !== 'note' && <span className="adm-fn"> · {d.filename}</span>}</small>
                      </span>
                    </span>
                    <span className="adm-cell-date">{date(d.at)}</span>
                    <span className="adm-cell-switch">
                      <input type="checkbox" role="switch" className="adm-switch" checked={on} onChange={e => toggle(d, e.target.checked)} aria-label={`Use “${d.title}” when answering guests`} />
                      <small>{on ? 'On' : 'Off'}</small>
                    </span>
                    <span className="adm-cell-menu">
                      <Menu
                        label={`Actions for ${d.title}`}
                        trigger={<MoreHorizontal size={16} aria-hidden="true" />}
                        items={[
                          { label: 'View text', href: `/admin/concierge/knowledge/view/?id=${encodeURIComponent(d.id)}`, icon: <Eye size={16} aria-hidden="true" /> },
                          { label: 'Rename', icon: <Pencil size={16} aria-hidden="true" />, onSelect: () => { setName(d.title); setRenaming(d); } },
                          { separator: true },
                          { label: 'Delete', icon: <Trash2 size={16} aria-hidden="true" />, danger: true, onSelect: () => setDeleting(d) },
                        ]}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <div className="adm-capacity">
            <span>{docs.length} of {limits.docs} items</span>
            <Progress value={(used / limits.totalChars) * 100} label="Space used" />
            <span>{Math.round((used / limits.totalChars) * 100)}% of space used</span>
            {full && <Badge tone="amber">Library full</Badge>}
          </div>
        </>
      )}

      <AddKnowledge open={adding} onClose={() => { setAdding(false); if (location.search.includes('add=')) history.replaceState(history.state, '', location.pathname); }} limits={limits} />

      <Dialog
        open={!!renaming} onClose={() => setRenaming(null)} title="Rename"
        footer={<>
          <button type="button" className={btn('secondary')} onClick={() => setRenaming(null)}>Cancel</button>
          <button type="button" className={btn('primary')} disabled={!name.trim()} onClick={async () => {
            const r = await renameDoc(renaming!.id, name);
            if (r.ok) { setRenaming(null); toast('Renamed'); router.refresh(); } else toast(r.error, 'error');
          }}>Save</button>
        </>}
      >
        <Field label="Title" htmlFor="rn"><Input id="rn" value={name} maxLength={80} onChange={e => setName(e.target.value)} autoFocus /></Field>
      </Dialog>

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)} title={`Delete “${deleting?.title ?? ''}”?`} confirmLabel="Delete" destructive
        onConfirm={async () => { const t = deleting!.title; await deleteDoc(deleting!.id); setDeleting(null); toast(`Deleted “${t}”`); router.refresh(); }}
      >
        <p>The assistant will no longer be able to answer from it. This cannot be undone. If you only want a pause, switch it off instead.</p>
      </ConfirmDialog>
    </div>
  );
}
