import { Suspense } from 'react';
import Link from 'next/link';
import { Glance } from './Glance';
import { ArrowRight, BookPlus, PenLine, SlidersHorizontal, CheckCheck } from 'lucide-react';
import { getSettings } from '@/lib/chat/config';
import { redisConfigured } from '@/lib/chat/redis';
import { recentConvs, type Conv } from '@/lib/chat/store';
import { convLangLabel } from '@/lib/insights/lang';
import { Badge, Card, EmptyState, PageHeader, Section, StatTile, btn } from '../_ui/ui';
import { dayOf, firstGuestMessage, guestLabel, handoffText, n, timeAgo, RESORT } from '../_lib/format';
import { getNeedsReply } from '../_lib/data';
import { setAssistantOn } from './concierge/actions';

export const metadata = { title: 'Home' };
export const dynamic = 'force-dynamic';

export default async function Home() {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const connected = redisConfigured();

  let all: Conv[] = [], settings = null as Awaited<ReturnType<typeof getSettings>> | null, failed = false;
  if (connected) {
    try { [all, settings] = await Promise.all([recentConvs(300), getSettings(true)]); } catch { failed = true; }
  }
  const needs = connected ? await getNeedsReply() : [];
  const now = Date.now();
  const today = dayOf(now);
  const week = all.filter(c => now - c.createdAt < 7 * 86400_000);
  const todayCount = all.filter(c => dayOf(c.createdAt) === today).length;
  const unansweredWeek = week.reduce((s, c) => s + (c.unanswered?.length ?? 0), 0);

  return (
    <div className="adm-page">
      <PageHeader
        title={greeting}
        description={`Here is what is happening at ${RESORT} Resort.`}
        actions={<a className={btn('primary')} href="/admin/editor/#/~/admin/preview/"><PenLine size={16} aria-hidden="true" />Edit website</a>}
      />

      {(!connected || failed) && (
        <p className="adm-banner">{failed ? 'Chat data could not be loaded just now. Try again in a moment.' : 'The chat database is not connected, so guest numbers are not available. You can still edit the website.'}</p>
      )}

      <div className="adm-stats">
        <StatTile label="Chats today" value={n(todayCount)} sub={`${n(week.length)} in the last 7 days`} href="/admin/inbox/" />
        <StatTile label="Needs your reply" value={n(needs.length)} tone={needs.length ? 'amber' : undefined} sub={needs.length ? 'Guests waiting for the team' : 'All caught up'} href="/admin/inbox/?view=needs" />
        <StatTile label="Unanswered questions" value={n(unansweredWeek)} sub="In the last 7 days" href="/admin/inbox/?view=unanswered" />
      </div>

      <div className="adm-cols">
        <div className="adm-stack">
        <Section
          title="Needs your reply"
          description="Guests who asked for the team, or a question the assistant could not answer."
          actions={needs.length > 5 ? <Link href="/admin/inbox/?view=needs" className={btn('ghost', 'sm')}>View all {needs.length}</Link> : undefined}
        >
          {needs.length === 0 ? (
            <EmptyState icon={<CheckCheck size={22} />} title="Nothing waiting">New guests who need a person will show up here.</EmptyState>
          ) : (
            <ul className="adm-rows adm-rows--flush">
              {needs.slice(0, 5).map(c => (
                <li key={c.id}>
                  <Link className="adm-row" href={`/admin/inbox/?c=${encodeURIComponent(c.id)}&view=needs`}>
                    <span className="adm-row-top"><b>{guestLabel(c)}</b><time dateTime={new Date(c.updatedAt).toISOString()}>{timeAgo(c.updatedAt)}</time></span>
                    <span className="adm-row-text">{c.unanswered?.[0] ?? firstGuestMessage(c)}</span>
                    <span className="adm-row-meta"><Badge tone="amber" dot>{handoffText(c.handoff)}</Badge><span>{convLangLabel(c)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
        </div>

        <div className="adm-stack">
          {settings && (
            <Card className="adm-status">
              <div className="adm-status-line">
                <span className={`adm-dot ${settings.enabled ? 'is-on' : ''}`} aria-hidden="true" />
                <div><b>Assistant is {settings.enabled ? 'on' : 'off'}</b><small>{settings.enabled ? 'Guests can chat from your website.' : 'The chat button is hidden from guests.'}</small></div>
              </div>
              <div className="adm-status-actions">
                <form action={setAssistantOn}>
                  <input type="hidden" name="on" value={settings.enabled ? '0' : '1'} />
                  <button className={btn('secondary', 'sm')} type="submit">Turn {settings.enabled ? 'off' : 'on'}</button>
                </form>
                <Link className={btn('ghost', 'sm')} href="/admin/concierge/">Settings</Link>
              </div>
            </Card>
          )}
          <Suspense fallback={<Card className="adm-glance-wait" aria-busy="true"><small>Loading…</small></Card>}><Glance /></Suspense>
          <Section title="Quick actions">
            <ul className="adm-actions-list">
              <li><a href="/admin/editor/#/~/admin/preview/"><PenLine size={18} aria-hidden="true" /><span><b>Edit website</b><small>Change words and photos</small></span><ArrowRight size={16} aria-hidden="true" /></a></li>
              <li><Link href="/admin/concierge/knowledge/?add=1"><BookPlus size={18} aria-hidden="true" /><span><b>Add knowledge</b><small>Teach the assistant something new</small></span><ArrowRight size={16} aria-hidden="true" /></Link></li>
              <li><Link href="/admin/concierge/"><SlidersHorizontal size={18} aria-hidden="true" /><span><b>Assistant settings</b><small>Name, tone and greeting</small></span><ArrowRight size={16} aria-hidden="true" /></Link></li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
