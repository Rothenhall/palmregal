import Link from 'next/link';
import { CalendarSearch, ChartColumn, MessagesSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { redisConfigured } from '@/lib/chat/redis';
import { chatInsights, openGaps } from '@/lib/insights/chats';
import { LEAD_BUCKETS, readSearches, type SearchInsights } from '@/lib/insights/searches';
import { Card, EmptyState, PageHeader, Section, StatTile } from '../../_ui/ui';
import { BarList, Columns } from '../../_ui/charts';
import { n, timeAgo } from '../../_lib/format';
import { GapList } from './GapList';
import { KB_LIMITS } from '@/lib/chat/kb';

export const metadata = { title: 'Insights' };
export const dynamic = 'force-dynamic';

const MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const dateLabel = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthLabel = (m: string, long = true) => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-IN', { month: long ? 'long' : 'short', year: long ? 'numeric' : undefined, timeZone: 'UTC' });
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`;

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  if (!redisConfigured()) {
    return (
      <div className="adm-page">
        <PageHeader title="Insights" />
        <EmptyState icon={<ChartColumn size={22} />} title="Insights are not connected yet">The chat database is not set up, so there is nothing to show.</EmptyState>
      </div>
    );
  }
  const { m } = await searchParams;
  const [searches, chats, gaps] = await Promise.all([readSearches(), chatInsights(), openGaps()]);
  const month = m && searches.months.includes(m) ? m : searches.months[0];

  return (
    <div className="adm-page">
      <PageHeader title="Insights" description="What guests are looking for, what they ask the assistant, and what to teach it next." />
      <nav className="adm-jump" aria-label="On this page">
        <a href="#dates">Dates guests search</a><a href="#asks">What guests ask</a><a href="#gaps">Knowledge gaps{gaps.length ? ` (${gaps.length})` : ''}</a>
      </nav>
      <div className="adm-stack">
        <Section id="dates" title="Dates guests search for" description="Every time a guest presses “Check availability” on your website. Only the dates and group size are counted, nothing about the guest.">
          {searches.total === 0 ? (
            <EmptyState icon={<CalendarSearch size={22} />} title="Nothing counted yet">This starts collecting as soon as the updated website is live. Come back after a few days of guests searching.</EmptyState>
          ) : <Dates s={searches} month={month} />}
        </Section>

        <Section id="asks" title="What guests ask" description="From the assistant’s chats in the last 30 days.">
          {chats.total === 0 ? (
            <EmptyState icon={<MessagesSquare size={22} />} title="No chats in the last 30 days">When guests use the chat, you will see their topics, languages and busy hours here.</EmptyState>
          ) : (
            <>
              <div className="adm-stats adm-stats--flat">
                <StatTile label="Chats" value={n(chats.total)} sub="Last 30 days" />
                <StatTile label="Passed to the team" value={`${pct(chats.handoff, chats.total)}%`} sub={`${n(chats.handoff)} of ${n(chats.total)} chats`} />
                <StatTile label="With an unanswered question" value={`${pct(chats.unanswered, chats.total)}%`} sub={`${n(chats.unanswered)} of ${n(chats.total)} chats`} />
                <StatTile label="Guest feedback" value={<span className="adm-thumbs"><span><ThumbsUp size={16} aria-hidden="true" />{n(chats.up)}</span><span><ThumbsDown size={16} aria-hidden="true" />{n(chats.down)}</span></span>} sub={chats.up + chats.down ? `${pct(chats.up, chats.up + chats.down)}% liked` : 'No feedback yet'} />
              </div>
              <div className="adm-grid2">
                <div><h3 className="adm-h3">Topics</h3><BarList items={chats.topics.slice(0, 8).map(t => ({ label: t.label, value: t.count }))} /></div>
                <div><h3 className="adm-h3">Languages</h3><BarList items={chats.langs.slice(0, 6).map(t => ({ label: t.label, value: t.count }))} /></div>
              </div>
              <div>
                <h3 className="adm-h3">Busiest hours <small>India time, guest messages</small></h3>
                <Columns values={chats.hours} labels={chats.hours.map((_, h) => hourLabel(h))} tickEvery={3} summary={`Guest messages by hour. Busiest at ${hourLabel(chats.hours.indexOf(Math.max(...chats.hours)))}.`} />
              </div>
            </>
          )}
        </Section>

        <Section id="gaps" title="Knowledge gaps" description="Questions the assistant could not answer, grouped. Add the answer once and it can help the next guest.">
          <GapList
            gaps={gaps.map(g => ({ key: g.key, question: g.question, count: g.count, lastAsked: timeAgo(g.lastAsked), samples: g.samples }))}
            limits={{ noteChars: KB_LIMITS.noteChars, fileMb: KB_LIMITS.fileBytes / 1048576 }}
          />
        </Section>
      </div>
    </div>
  );
}

function Dates({ s, month }: { s: SearchInsights; month: string }) {
  const [y, mo] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1));
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const max = Math.max(1, ...Object.entries(s.byDay).filter(([d]) => d.startsWith(month)).map(([, c]) => c));
  const today = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
  const nightsTotal = Object.values(s.nights).reduce((a, b) => a + b, 0);
  const leadMax = s.lead.reduce((a, b) => a + b, 0);
  const trendTotal = s.trend.reduce((a, b) => a + b.count, 0);
  const tr = s.typical;

  return (
    <>
      <div className="adm-stats adm-stats--flat">
        <StatTile label="Searches, last 30 days" value={n(trendTotal)} sub={`${n(s.total)} counted in total`} />
        <StatTile label="Average stay" value={s.avgNights ? `${s.avgNights.toFixed(1)} nights` : '–'} sub={`${n(nightsTotal)} searches`} />
        <StatTile label="Typical group" value={tr ? `${tr.adults} ${tr.adults === 1 ? 'adult' : 'adults'}${tr.children ? `, ${tr.children} ${tr.children === 1 ? 'child' : 'children'}` : ''}` : '–'} sub="Most common choice" />
      </div>

      <div className="adm-dates">
        <div>
          <div className="adm-month-tabs" role="tablist" aria-label="Month">
            {s.months.map(mm => <Link key={mm} href={`/admin/insights/?m=${mm}#dates`} role="tab" aria-selected={mm === month} aria-current={mm === month ? 'page' : undefined}>{monthLabel(mm, false)}</Link>)}
          </div>
          <h3 className="adm-h3">{monthLabel(month)} <small>by check-in date</small></h3>
          <div className="adm-cal" role="grid" aria-label={`Searches by check-in date, ${monthLabel(month)}`}>
            {MON.map(d => <span key={d} className="adm-cal-h" role="columnheader">{d}</span>)}
            {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} className="adm-cal-empty" />)}
            {Array.from({ length: days }, (_, i) => {
              const day = `${month}-${String(i + 1).padStart(2, '0')}`;
              const c = s.byDay[day] ?? 0, h = c / max;
              return (
                <span key={day} role="gridcell" className={`adm-cal-d${day < today ? ' is-past' : ''}${h > 0.55 ? ' is-hot' : ''}`} style={{ ['--h' as string]: h }} title={`${dateLabel(day)}: ${c} ${c === 1 ? 'search' : 'searches'}`} aria-label={`${dateLabel(day)}: ${c} searches`}>
                  <b>{i + 1}</b>{c > 0 && <i>{c}</i>}
                </span>
              );
            })}
          </div>
          <p className="adm-fineprint">Darker means more guests searched to arrive that day.</p>
        </div>
        <div>
          <h3 className="adm-h3">Most searched dates <small>to arrive</small></h3>
          <BarList empty="No upcoming dates searched yet." items={s.top.map(t => ({ label: dateLabel(t.date), value: t.count }))} />
          <h3 className="adm-h3 adm-mt">How far ahead guests search</h3>
          <BarList items={LEAD_BUCKETS.map((l, i) => ({ label: l, value: s.lead[i], hint: leadMax ? `${pct(s.lead[i], leadMax)}%` : '' }))} />
        </div>
      </div>

      <div>
        <h3 className="adm-h3">Searches per day <small>last 30 days</small></h3>
        <Columns values={s.trend.map(t => t.count)} labels={s.trend.map(t => new Date(t.date + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }))} tickEvery={5} summary={`${trendTotal} searches in the last 30 days.`} />
      </div>
    </>
  );
}
