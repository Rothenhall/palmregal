import { Ban, ShieldCheck } from 'lucide-react';
import { BOUNDS, NUM_KEYS, TONES, getSettings } from '@/lib/chat/config';
import { globalUsage, tokenCap } from '@/lib/chat/guard';
import { redisConfigured } from '@/lib/chat/redis';
import { listBlocks, RETENTION_DAYS } from '@/lib/chat/store';
import { EmptyState, PageHeader, Section, btn } from '../../_ui/ui';
import { shortDate } from '../../_lib/format';
import { SettingsForm } from './SettingsForm';
import { unblock } from './actions';

export const metadata = { title: 'Assistant settings' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!redisConfigured()) {
    return (
      <div className="adm-page">
        <PageHeader title="Assistant settings" />
        <EmptyState icon={<Ban size={22} />} title="The assistant is not connected yet">The chat database is not set up (KV_REST_API_URL, KV_REST_API_TOKEN), so settings cannot be shown.</EmptyState>
      </div>
    );
  }
  const [s, usage, blocks] = await Promise.all([getSettings(true), globalUsage(), listBlocks()]);
  const bounds = Object.fromEntries(NUM_KEYS.map(k => [k, [...BOUNDS[k]]])) as Record<string, [number, number, string, string]>;
  const tones = Object.entries(TONES).map(([id, t]) => ({ id, label: t.label }));

  return (
    <SettingsForm initial={s} bounds={bounds} numKeys={[...NUM_KEYS]} tones={tones} usage={{ requests: usage.requests, tokens: usage.tokens, tokenCap: tokenCap(s.dailyCap) }}>
      <Section id="blocked" title="Blocked guests" description="People who cannot use the chat. Block a guest from their conversation in the Inbox.">
        {blocks.length === 0 ? (
          <p className="adm-muted">No one is blocked.</p>
        ) : (
          <ul className="adm-list">
            {blocks.map(b => (
              <li key={b.kind + b.hash}>
                <span><b>{b.kind === 'ip' ? 'Wi-Fi network' : b.kind === 'fp' ? 'Device' : 'Guest'}</b><small>{b.masked} · blocked {shortDate(b.at)}</small></span>
                <form action={unblock}><input type="hidden" name="kind" value={b.kind} /><input type="hidden" name="hash" value={b.hash} /><button className={btn('secondary', 'sm')} type="submit">Allow again</button></form>
              </li>
            ))}
          </ul>
        )}
        <p className="adm-fineprint"><ShieldCheck size={14} aria-hidden="true" />Chats are kept for {RETENTION_DAYS} days after the last message, then deleted automatically. Network addresses are stored only as a one-way code.</p>
      </Section>
    </SettingsForm>
  );
}
