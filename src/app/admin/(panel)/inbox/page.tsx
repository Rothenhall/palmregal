import Link from 'next/link';
import { ArrowLeft, BookPlus, ChevronDown, MessageCircle, ThumbsDown, ThumbsUp, TriangleAlert } from 'lucide-react';
import { redisConfigured } from '@/lib/chat/redis';
import { getConv, isDone, listBlocks, needsReply, recentConvs, type Conv } from '@/lib/chat/store';
import { convLangLabel } from '@/lib/insights/lang';
import { Badge, EmptyState, PageHeader } from '../../_ui/ui';
import { dayGroup, firstGuestMessage, guestLabel, guestTone, handoffText, lastMessage, timeAgo, transcriptText, when } from '../../_lib/format';
import { LiveRefresh } from '../../_ui/LiveRefresh';
import { InboxKeys } from './InboxKeys';
import { Download } from 'lucide-react';
import type { ReactNode } from 'react';

/** Marks every match of the search word in a piece of text. */
function hi(text: string, needle: string): ReactNode {
  if (!needle) return text;
  const safe = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safe})`, 'gi'));
  return parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}
/** With a search, the preview is the message that matched, trimmed to start near the word. */
function previewFor(c: Conv, needle: string) {
  if (needle) {
    const m = c.msgs.find(x => x.t.toLowerCase().includes(needle));
    if (m) { const at = m.t.toLowerCase().indexOf(needle); return (at > 60 ? '…' + m.t.slice(at - 40) : m.t); }
  }
  return firstGuestMessage(c) || lastMessage(c);
}
import { ConvActions } from './ConvActions';
import { InboxToolbar } from './InboxToolbar';

export const metadata = { title: 'Inbox' };
export const dynamic = 'force-dynamic';

type View = 'all' | 'needs' | 'unanswered';
const PAGE = 20;

export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string; q?: string; page?: string; c?: string }> }) {
  if (!redisConfigured()) {
    return (
      <div className="adm-page">
        <PageHeader title="Inbox" />
        <EmptyState icon={<MessageCircle size={22} />} title="Chats are not connected yet">The chat database is not set up, so conversations cannot be shown here.</EmptyState>
      </div>
    );
  }
  const sp = await searchParams;
  const view: View = sp.view === 'needs' || sp.view === 'unanswered' ? sp.view : 'all';
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const [all, blocks] = await Promise.all([recentConvs(300), listBlocks()]);
  const blockedSet = new Set(blocks.map(b => `${b.kind}:${b.hash}`));
  const isBlocked = (c: Conv) => blockedSet.has(`visitor:${c.visitor}`) || blockedSet.has(`ip:${c.ipHash}`) || (!!c.fp && blockedSet.has(`fp:${c.fp}`));

  const counts: Record<View, number> = {
    all: all.length,
    needs: all.filter(needsReply).length,
    unanswered: all.filter(c => c.unanswered?.length && !isDone(c)).length,
  };
  const needle = q.toLowerCase();
  const filtered = all.filter(c =>
    (view === 'all' || (view === 'needs' ? needsReply(c) : Boolean(c.unanswered?.length) && !isDone(c))) &&
    (!needle || c.msgs.some(m => m.t.toLowerCase().includes(needle))));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const items = filtered.slice((Math.min(page, pages) - 1) * PAGE, Math.min(page, pages) * PAGE);

  const selected = sp.c ? (all.find(c => c.id === sp.c) ?? (await getConv(sp.c))) : null;

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (view !== 'all') p.set('view', view);
    if (q) p.set('q', q);
    if (page > 1 && !('page' in extra)) p.set('page', String(page));
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    return p.size ? `?${p}` : '';
  };

  return (
    <div className="adm-inbox" data-open={selected ? 'true' : 'false'}>
      <section className="adm-inbox-list" aria-label="Conversations">
        <div className="adm-inbox-head">
          <div className="adm-inbox-title"><h1>Inbox</h1><span><LiveRefresh /><a className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon" href="/admin/inbox/export/" title="Download all chats as a spreadsheet (CSV)" aria-label="Download all chats as a spreadsheet"><Download size={16} /></a></span></div>
          <InboxToolbar view={view} q={q} counts={counts} />
        </div>
        {items.length === 0 ? (
          <EmptyState icon={<MessageCircle size={22} />} title={q ? 'No chats match your search' : view === 'needs' ? 'Nothing needs a reply' : view === 'unanswered' ? 'No unanswered questions' : 'No chats yet'}>
            {q ? 'Try a different word.' : view === 'all' ? 'When a guest uses the chat on your website, the conversation appears here.' : 'You are all caught up.'}
          </EmptyState>
        ) : (
          <ul className="adm-rows">
            {items.map((c, i) => {
              const flag = needsReply(c);
              const preview = previewFor(c, needle);
              const group = dayGroup(c.updatedAt);
              const head = i === 0 || dayGroup(items[i - 1].updatedAt) !== group;
              return (
                <li key={c.id}>
                  {head && <p className="adm-rows-day">{group}</p>}
                  <Link href={`/admin/inbox/${qs({ c: c.id })}`} className={`adm-row adm-row--guest${flag ? ' is-flagged' : ''}`} data-conv={c.id} aria-current={selected?.id === c.id ? 'true' : undefined}>
                    <span className="adm-guest-av" data-tone={guestTone(c)} aria-hidden="true">{guestLabel(c).slice(-2)}</span>
                    <span className="adm-row-top">
                      <b>{guestLabel(c)}</b>
                      <time dateTime={new Date(c.updatedAt).toISOString()} title={when(c.updatedAt)}>{timeAgo(c.updatedAt)}</time>
                    </span>
                    <span className="adm-row-text">{hi(preview, q)}</span>
                    <span className="adm-row-meta">
                      {flag ? <Badge tone="amber" dot>Needs reply</Badge> : isDone(c) ? <Badge tone="teal">Done</Badge> : null}
                      {isBlocked(c) && <Badge tone="red">Blocked</Badge>}
                      <span>{convLangLabel(c)}</span>
                      <span>{c.msgs.length} {c.msgs.length === 1 ? 'message' : 'messages'}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {pages > 1 && (
          <nav className="adm-pager" aria-label="Pages">
            {page > 1 ? <Link href={`/admin/inbox/${qs({ page: page > 2 ? String(page - 1) : undefined })}`}>Newer</Link> : <span />}
            <span>Page {Math.min(page, pages)} of {pages}</span>
            {page < pages ? <Link href={`/admin/inbox/${qs({ page: String(page + 1) })}`}>Older</Link> : <span />}
          </nav>
        )}
        <p className="adm-inbox-note">Chats are deleted automatically 90 days after the last message.</p>
      </section>

      <InboxKeys back={`/admin/inbox/${qs({})}`} />
      <section className="adm-inbox-detail" aria-label="Conversation">
        {selected ? <Transcript c={selected} blocked={isBlocked(selected)} back={`/admin/inbox/${qs({})}`} /> : (
          <EmptyState icon={<MessageCircle size={22} />} title="Select a conversation">Choose a chat on the left to read it.</EmptyState>
        )}
      </section>
    </div>
  );
}

function Transcript({ c, blocked, back }: { c: Conv; blocked: boolean; back: string }) {
  const flagged = needsReply(c);
  const unanswered = new Set(c.unanswered ?? []);
  const noted = new Set<number>();
  c.msgs.forEach((m, i) => { if (m.r === 'u' && unanswered.has(m.t.slice(0, 200))) noted.add(i); });
  const endNote = c.handoff && (c.handoff !== 'unknown' || noted.size === 0) ? handoffText(c.handoff) : '';

  return (
    <>
      <header className="adm-conv-head">
        <Link href={back} className="adm-back" aria-label="Back to inbox"><ArrowLeft size={18} /></Link>
        <span className="adm-guest-av adm-guest-av--lg" data-tone={guestTone(c)} aria-hidden="true">{guestLabel(c).slice(-2)}</span>
        <div className="adm-conv-title">
          <h2>{guestLabel(c)}</h2>
          <p>{convLangLabel(c)} · started {when(c.createdAt)}</p>
        </div>
        <div className="adm-conv-actions">
          {flagged ? <Badge tone="amber" dot>Needs reply</Badge> : isDone(c) ? <Badge tone="teal">Done</Badge> : null}
          {blocked && <Badge tone="red">Blocked</Badge>}
          <ConvActions id={c.id} done={isDone(c)} canMark={Boolean(c.handoff || c.unanswered?.length)} blocked={blocked} transcript={transcriptText(c)} />
        </div>
      </header>
      <div className="adm-conv-scroll">
        <ol className="adm-thread">
          {c.msgs.map((m, i) => (
            <li key={i} className={m.r === 'u' ? 'is-guest' : 'is-bot'}>
              <div className="adm-bubble">{m.t}</div>
              <span className="adm-bubble-meta">
                {m.r === 'u' ? 'Guest' : 'Assistant'} · {when(m.ts)}
                {m.fb === 1 && <ThumbsUp size={12} aria-label="Guest liked this reply" />}
                {m.fb === -1 && <ThumbsDown size={12} aria-label="Guest did not like this reply" />}
              </span>
              {noted.has(i) && (
                <span className="adm-note-line"><TriangleAlert size={14} aria-hidden="true" />{handoffText('unknown')}. <Link href="/admin/concierge/knowledge/">Add the answer to Knowledge</Link></span>
              )}
            </li>
          ))}
          {endNote && <li className="adm-note-line adm-note-line--end"><TriangleAlert size={14} aria-hidden="true" />{endNote}</li>}
        </ol>
        <details className="adm-details">
          <summary><ChevronDown size={14} aria-hidden="true" />Details</summary>
          <dl>
            <div><dt>Guest ID</dt><dd>{c.visitor.slice(0, 8)}</dd></div>
            <div><dt>Network</dt><dd>{c.ipMask}</dd></div>
            {c.fp && <div><dt>Device</dt><dd>{c.fp.slice(0, 8)}</dd></div>}
            <div><dt>Last message</dt><dd>{when(c.updatedAt)}</dd></div>
            <div><dt>Messages</dt><dd>{c.msgs.length}</dd></div>
            {c.limited > 0 && <div><dt>Slowed down</dt><dd>{c.limited} {c.limited === 1 ? 'time' : 'times'}</dd></div>}
          </dl>
        </details>
        {c.unanswered?.length ? (
          <p className="adm-hintbox"><BookPlus size={16} aria-hidden="true" /><span>Questions the assistant could not answer: {c.unanswered.join(' / ')}. <Link href="/admin/concierge/knowledge/">Teach it in Knowledge</Link>.</span></p>
        ) : null}
      </div>
    </>
  );
}
