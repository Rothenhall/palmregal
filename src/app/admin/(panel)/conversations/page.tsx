import Link from 'next/link';
import { redirect } from 'next/navigation';
import { redisConfigured } from '@/lib/chat/redis';
import { listConvs, isBlockedHash } from '@/lib/chat/store';

export const metadata = { title: 'Conversations' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; filter?: string }> }) {
  if (!redisConfigured()) {
    return (
      <>
        <header className="adm-head"><h1>Conversations</h1></header>
        <div className="adm-card adm-empty"><p>The database is not connected, so conversations cannot be shown.</p></div>
      </>
    );
  }
  const sp = await searchParams;
  const flagged = sp.filter === 'attention';
  const page = Math.max(1, Number(sp.page) || 1);
  const { items, total, pages } = await listConvs(page, 20, flagged);
  const base = flagged ? '/admin/conversations/?filter=attention&' : '/admin/conversations/?';
  if (page > pages) redirect(flagged ? '/admin/conversations/?filter=attention' : '/admin/conversations/');
  const blocked = await Promise.all(items.map(async c => (await isBlockedHash('visitor', c.visitor)) || (await isBlockedHash('ip', c.ipHash))));
  return (
    <>
      <header className="adm-head"><h1>Conversations</h1><p>{total} {flagged ? 'that needed the team' : 'kept'}, newest first. Deleted automatically 90 days after the last message.</p></header>
      <nav className="adm-tabs" aria-label="Filter">
        <Link href="/admin/conversations/" aria-current={flagged ? undefined : 'page'}>All</Link>
        <Link href="/admin/conversations/?filter=attention" aria-current={flagged ? 'page' : undefined}>Unanswered and handoffs</Link>
      </nav>
      {flagged && <p className="adm-hint">Questions the assistant could not answer are listed below. Add the answer in Knowledge so it can next time.</p>}
      {items.length === 0 ? <div className="adm-card adm-empty"><p>{flagged ? 'Nothing needed the team yet.' : 'No guest has used the chat yet.'}</p></div> : (
        <ul className="adm-convs">
          {items.map((c, i) => (
            <li key={c.id}>
              <Link className="adm-card adm-conv" href={`/admin/conversations/view/?id=${encodeURIComponent(c.id)}`}>
                <span className="adm-conv-first">{c.msgs.find(m => m.r === 'u')?.t.slice(0, 120) ?? '(empty)'}</span>
                <span className="adm-conv-meta">
                  {c.lang} · {c.msgs.length} messages · {new Date(c.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} · {c.ipMask} · {c.visitor.slice(0, 8)}
                  {c.handoff && <b className="adm-flag">handoff: {c.handoff}</b>}
                  {c.msgs.some(m => m.fb === -1) && <b className="adm-flag">thumbs down</b>}
                  {c.limited > 0 && <b className="adm-flag">rate limited ×{c.limited}</b>}
                  {blocked[i] && <b className="adm-flag adm-flag--red">blocked</b>}
                </span>
              </Link>
              {flagged && c.unanswered?.length ? <ul className="adm-unans">{c.unanswered.map((q, n) => <li key={n}>{q}</li>)}</ul> : null}
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav className="adm-pager" aria-label="Pages">
          {page > 1 ? <Link href={`${base}page=${page - 1}`}>Newer</Link> : <span />}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={`${base}page=${page + 1}`}>Older</Link> : <span />}
        </nav>
      )}
    </>
  );
}
