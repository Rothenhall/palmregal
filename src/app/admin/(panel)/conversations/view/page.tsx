import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConv, isBlockedHash } from '@/lib/chat/store';
import { blockFrom, removeConversation } from '../actions';

export const metadata = { title: 'Conversation' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string; blocked?: string }> }) {
  const { id, blocked } = await searchParams;
  const c = id ? await getConv(id) : null;
  if (!c) notFound();
  const [bIp, bVis, bFp] = await Promise.all([
    isBlockedHash('ip', c.ipHash), isBlockedHash('visitor', c.visitor), c.fp ? isBlockedHash('fp', c.fp) : Promise.resolve(false),
  ]);
  const when = (t: number) => new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  const targets = [
    { kind: 'visitor', label: 'this visitor', on: bVis, show: true },
    { kind: 'ip', label: 'this network', on: bIp, show: true },
    { kind: 'fp', label: 'this device', on: bFp, show: !!c.fp },
  ];
  return (
    <>
      <header className="adm-head">
        <p><Link href="/admin/conversations/">&larr; All conversations</Link></p>
        <h1>Conversation</h1>
        <p>{c.lang} · started {when(c.createdAt)} · network {c.ipMask} · visitor {c.visitor.slice(0, 8)}{c.fp ? ` · device ${c.fp.slice(0, 8)}` : ''}{c.limited ? ` · rate limited ×${c.limited}` : ''}{c.handoff ? ` · handoff: ${c.handoff}` : ''}</p>
        {c.unanswered?.length ? <p className="adm-hint">Could not answer: {c.unanswered.join(' / ')}. <Link href="/admin/knowledge/">Add it to Knowledge</Link>.</p> : null}
      </header>
      {blocked && <p className="adm-note" role="status">Blocked. They will see that the assistant is unavailable.</p>}
      <ol className="adm-transcript">
        {c.msgs.map((m, i) => (
          <li key={i} className={m.r === 'u' ? 'adm-msg adm-msg--guest' : 'adm-msg'}>
            <small>{m.r === 'u' ? 'Guest' : 'Assistant'} · {when(m.ts)}{m.fb === 1 ? ' · thumbs up' : m.fb === -1 ? ' · thumbs down' : ''}</small>
            <p>{m.t}</p>
          </li>
        ))}
      </ol>
      <div className="adm-card adm-form">
        <h2>Actions</h2>
        <div className="adm-actions">
          {targets.filter(t => t.show).map(t => (
            <form key={t.kind} action={blockFrom}>
              <input type="hidden" name="id" value={c.id} /><input type="hidden" name="kind" value={t.kind} />
              <button className="adm-btn adm-btn--line" type="submit" disabled={t.on}>{t.on ? `Blocked: ${t.label}` : `Block ${t.label}`}</button>
            </form>
          ))}
          <form action={removeConversation}>
            <input type="hidden" name="id" value={c.id} />
            <button className="adm-btn adm-btn--danger" type="submit">Delete conversation</button>
          </form>
        </div>
        <p><small>Blocking a network also affects other guests on the same Wi-Fi, so prefer blocking the visitor first.</small></p>
      </div>
    </>
  );
}
