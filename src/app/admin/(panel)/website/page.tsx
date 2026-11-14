import { ArrowUpRight, CheckCircle2, CircleAlert, Globe, Image as ImageIcon, PenLine, Type } from 'lucide-react';
import { content } from '@/content/site';
import { siteHealth } from '@/lib/insights/health';
import { Badge, EmptyState, PageHeader, Section, btn } from '../../_ui/ui';
import { getSiteStatus } from '../../_lib/data';
import { timeAgo } from '../../_lib/format';
import { UndoButton } from './UndoButton';

export const metadata = { title: 'Website status' };
export const dynamic = 'force-dynamic';

const EDITOR = '/admin/editor/#/~/admin/preview/';
const LIVE = process.env.NEXT_PUBLIC_SITE_URL || '/';

export default async function Page() {
  const [status, health] = await Promise.all([getSiteStatus(), siteHealth(content as unknown as Record<string, unknown>)]);
  const fix = health.items.filter(i => i.severity === 'fix');
  const tips = health.items.filter(i => i.severity === 'tip');

  return (
    <div className="adm-page adm-page--narrow">
      <PageHeader
        title="Website status"
        description="Whether your latest changes are live, and a quick check that the site is in good shape."
        actions={<><a className={btn('secondary')} href={LIVE} target="_blank" rel="noopener">View live site<ArrowUpRight size={14} aria-hidden="true" /></a><a className={btn('primary')} href={EDITOR}><PenLine size={16} aria-hidden="true" />Edit website</a></>}
      />
      <div className="adm-stack">
        <Section id="publishing" title="Publishing" description="Changes you save in the editor go live automatically.">
          {!status.ok ? (
            <p className="adm-statusline"><Badge tone="neutral">Status unavailable</Badge><span className="adm-muted">{status.reason === 'no-token' ? 'Publishing is not connected on this server.' : 'We could not reach the publishing service just now. Your website is not affected.'}</span></p>
          ) : (
            <>
              <p className="adm-statusline">
                {status.deploy.state === 'live' && <Badge tone="teal" dot>Live</Badge>}
                {status.deploy.state === 'publishing' && <Badge tone="amber" dot>Publishing…</Badge>}
                {status.deploy.state === 'failed' && <Badge tone="red" dot>Failed</Badge>}
                {status.deploy.state === 'unknown' && <Badge>No status yet</Badge>}
                <span className="adm-muted">
                  {status.deploy.state === 'live' && 'Your latest changes are on the website.'}
                  {status.deploy.state === 'publishing' && 'Usually about 2 minutes. You can keep working.'}
                  {status.deploy.state === 'failed' && 'The last update did not go live. Please contact support.'}
                  {status.deploy.state === 'unknown' && 'No publishing information is available for the latest update.'}
                </span>
              </p>
              {status.changes.length === 0 ? <p className="adm-muted">No changes to text or photos yet.</p> : (
                <ul className="adm-list adm-changes">
                  {status.changes.map(c => (
                    <li key={c.sha}>
                      <span className="adm-change-icon" aria-hidden="true">{c.kind === 'photo' ? <ImageIcon size={16} /> : <Type size={16} />}</span>
                      <span><b>{c.message}</b><small>{c.author} · {timeAgo(c.at)} · {c.kind === 'photo' ? 'Photo' : 'Text'}</small></span>
                    </li>
                  ))}
                </ul>
              )}
              {status.undo && <div className="adm-undo"><UndoButton sha={status.undo.sha} message={status.undo.message} when={timeAgo(status.undo.at)} /><small>Brings back the text from before the latest edit. Photos are not undone.</small></div>}
            </>
          )}
        </Section>

        <Section id="health" title="Site health" badge={health.items.length ? <Badge tone="amber">{health.items.length} to look at</Badge> : <Badge tone="teal">All good</Badge>} description="Simple checks on your words and photos.">
          {health.items.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={22} />} title="All good">Nothing needs your attention right now.</EmptyState>
          ) : (
            <ul className="adm-health">
              {[...fix, ...tips].map(i => (
                <li key={i.id}>
                  <span className={`adm-health-icon is-${i.severity}`} aria-hidden="true"><CircleAlert size={16} /></span>
                  <span><b>{i.title}</b><small>{i.detail}</small></span>
                  <a className={btn('secondary', 'sm')} href={EDITOR}>Fix in editor</a>
                </li>
              ))}
            </ul>
          )}
          {!health.photosChecked && <p className="adm-fineprint"><Globe size={14} aria-hidden="true" />Photo sizes could not be checked just now.</p>}
        </Section>
      </div>
    </div>
  );
}
