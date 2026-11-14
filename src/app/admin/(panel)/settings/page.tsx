import { BOUNDS, NUM_KEYS, TONES, getSettings } from '@/lib/chat/config';
import { globalUsage, tokenCap } from '@/lib/chat/guard';
import { redisConfigured } from '@/lib/chat/redis';
import { listBlocks, RETENTION_DAYS } from '@/lib/chat/store';
import { saveChatSettings, unblock } from './actions';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  if (!redisConfigured()) {
    return (
      <>
        <header className="adm-head"><h1>Settings</h1></header>
        <div className="adm-card adm-empty"><p>The database is not connected (KV_REST_API_URL, KV_REST_API_TOKEN), so chatbot settings cannot be shown.</p></div>
      </>
    );
  }
  const [s, usage, blocks] = await Promise.all([getSettings(true), globalUsage(), listBlocks()]);
  const pct = Math.min(100, Math.round((usage.requests / s.dailyCap) * 100));
  return (
    <>
      <header className="adm-head"><h1>Settings</h1><p>The guest chatbot. Changes apply within a minute, no redeploy.</p></header>
      {saved && <p className="adm-note" role="status">Saved.</p>}
      <form action={saveChatSettings} className="adm-card adm-form">
        <h2>Chatbot</h2>
        <label className="adm-switch"><input type="checkbox" name="enabled" defaultChecked={s.enabled} /> <span>Chatbot is on</span></label>
        <label>Assistant name<input name="name" defaultValue={s.name} maxLength={40} required /></label>
        <label>Greeting<textarea name="greeting" defaultValue={s.greeting} maxLength={300} rows={3} required /></label>
        <label>Tone
          <select name="tone" defaultValue={s.tone}>{Object.entries(TONES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}</select>
        </label>
        <label>Extra instructions (optional)
          <textarea name="extra" defaultValue={s.extra} maxLength={1200} rows={4} placeholder="For example: mention that the pool opens at 7am." />
          <small>Added to what the assistant already knows from the website. It will not give prices or promise availability whatever is written here.</small>
        </label>

        <details className="adm-details">
          <summary>Greeting bubble (a small message beside the chat button)</summary>
          <div className="adm-limits">
            <label className="adm-switch"><input type="checkbox" name="teaserOn" defaultChecked={s.teaserOn} /> <span>Show the bubble</span></label>
            <label>Message<input name="teaserText" defaultValue={s.teaserText} maxLength={140} /><small>It never opens the chat by itself, and costs nothing.</small></label>
            <label>Show after (seconds on the page)<input type="number" name="teaserDelay" defaultValue={s.teaserDelay} min={3} max={120} /></label>
            <label className="adm-switch"><input type="checkbox" name="teaserScroll" defaultChecked={s.teaserScroll} /> <span>Also show once the guest has scrolled halfway</span></label>
            <label className="adm-switch"><input type="checkbox" name="teaserMobile" defaultChecked={s.teaserMobile} /> <span>Show on phones (off by default: little room)</span></label>
            <label>Show again after (days)<input type="number" name="teaserDays" defaultValue={s.teaserDays} min={1} max={60} /><small>Each guest sees it once per this many days.</small></label>
          </div>
        </details>

        <details className="adm-details">
          <summary>Limits (to protect your credits)</summary>
          <div className="adm-limits">
            {NUM_KEYS.map(key => (
              <label key={key}>{BOUNDS[key][2]}
                <input type="number" name={key} defaultValue={s[key]} min={BOUNDS[key][0]} max={BOUNDS[key][1]} required />
                <small>Between {BOUNDS[key][0]} and {BOUNDS[key][1]}. {BOUNDS[key][3]}</small>
              </label>
            ))}
          </div>
        </details>
        <button className="adm-btn" type="submit">Save chatbot settings</button>
      </form>

      <section className="adm-card adm-form" aria-labelledby="usage">
        <h2 id="usage">Today</h2>
        <p>{usage.requests} of {s.dailyCap} replies used; about {usage.tokens.toLocaleString('en-IN')} of {tokenCap(s.dailyCap).toLocaleString('en-IN')} tokens. The count resets at midnight India time.</p>
        <div className="adm-meter" role="img" aria-label={`${pct} percent of the daily replies used`}><span style={{ width: `${pct}%` }} /></div>
      </section>

      <section className="adm-card adm-form" aria-labelledby="blocked">
        <h2 id="blocked">Blocked</h2>
        {blocks.length === 0 ? <p>No one is blocked. Block a guest from a conversation if needed.</p> : (
          <ul className="adm-list">
            {blocks.map(b => (
              <li key={b.kind + b.hash}>
                <span><strong>{b.kind === 'ip' ? 'Network' : b.kind === 'fp' ? 'Device' : 'Visitor'}</strong> {b.masked}, {new Date(b.at).toLocaleDateString('en-IN')}</span>
                <form action={unblock}><input type="hidden" name="kind" value={b.kind} /><input type="hidden" name="hash" value={b.hash} /><button className="adm-btn adm-btn--line" type="submit">Unblock</button></form>
              </li>
            ))}
          </ul>
        )}
        <p><small>Conversations are kept for {RETENTION_DAYS} days after the last message, then deleted automatically. Network addresses are stored only as a one-way hash.</small></p>
      </section>
    </>
  );
}
