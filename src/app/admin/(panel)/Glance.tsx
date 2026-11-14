import Link from 'next/link';
import { BookPlus, CalendarSearch, Globe, HeartPulse } from 'lucide-react';
import { content } from '@/content/site';
import { openGaps } from '@/lib/insights/chats';
import { siteHealth } from '@/lib/insights/health';
import { readSearches } from '@/lib/insights/searches';
import { redisConfigured } from '@/lib/chat/redis';
import { Badge, Section } from '../_ui/ui';
import { getSiteStatus } from '../_lib/data';
import { timeAgo } from '../_lib/format';

const short = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Compact "At a glance" card for Home: website, site health, most searched dates and knowledge gaps. Each part fails quietly. */
export async function Glance() {
  const [site, health, searches, gaps] = await Promise.all([
    getSiteStatus(),
    siteHealth(content as unknown as Record<string, unknown>).catch(() => null),
    redisConfigured() ? readSearches().catch(() => null) : null,
    redisConfigured() ? openGaps().catch(() => null) : null,
  ]);
  const top = searches?.top.slice(0, 3) ?? [];
  return (
    <Section title="At a glance">
      <ul className="adm-glance">
        <li>
          <Link href="/admin/website/"><Globe size={18} aria-hidden="true" /><span><b>Website</b>
            <small>{!site.ok ? 'Status unavailable' : site.deploy.state === 'live' ? 'Live' : site.deploy.state === 'publishing' ? 'Publishing… usually about 2 minutes' : site.deploy.state === 'failed' ? 'Last update failed. Contact support' : 'No publishing info'}{site.ok && site.changes[0] ? ` · last change ${timeAgo(site.changes[0].at)}` : ''}</small></span>
            {site.ok && site.deploy.state === 'live' && <Badge tone="teal" dot>Live</Badge>}{site.ok && site.deploy.state === 'publishing' && <Badge tone="amber" dot>Publishing</Badge>}{site.ok && site.deploy.state === 'failed' && <Badge tone="red" dot>Failed</Badge>}</Link>
        </li>
        <li>
          <Link href="/admin/website/#health"><HeartPulse size={18} aria-hidden="true" /><span><b>Site health</b><small>{!health ? 'Not available' : health.items.length ? `${health.items.length} ${health.items.length === 1 ? 'thing' : 'things'} to look at` : 'All good'}</small></span>
            {health && health.items.length > 0 && <Badge tone="amber">{health.items.length}</Badge>}</Link>
        </li>
        <li>
          <Link href="/admin/insights/#dates"><CalendarSearch size={18} aria-hidden="true" /><span><b>Dates guests search</b>
            <small>{top.length ? top.map(t => `${short(t.date)} (${t.count})`).join(' · ') : 'Starts counting once the new website is live'}</small></span></Link>
        </li>
        <li>
          <Link href="/admin/insights/#gaps"><BookPlus size={18} aria-hidden="true" /><span><b>Knowledge gaps</b><small>{gaps ? (gaps.length ? `${gaps.length} ${gaps.length === 1 ? 'question' : 'questions'} to teach the assistant` : 'Nothing to teach right now') : 'Not available'}</small></span>
            {gaps && gaps.length > 0 && <Badge tone="amber">{gaps.length}</Badge>}</Link>
        </li>
      </ul>
    </Section>
  );
}
