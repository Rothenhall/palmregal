'use client';
import { useActionState, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ChatSettings } from '@/lib/chat/config';
import { Badge, Field, Input, PageHeader, Progress, Section, Switch, Textarea, btn } from '../../_ui/ui';
import { useToast } from '../../_ui/Toast';
import { ChatPreview } from './ChatPreview';
import { saveChatSettings } from './actions';

type V = Record<string, string | boolean>;
const BOOLS = ['enabled', 'teaserOn', 'teaserScroll', 'teaserMobile'];
const toV = (s: ChatSettings): V => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, typeof v === 'boolean' ? v : String(v)]));

const TONE_EXAMPLE: Record<string, string> = {
  warm: '“We would love to host you! The sea-view suites are lovely at sunrise.”',
  formal: '“Good evening. It would be my pleasure to assist you with your enquiry.”',
  brief: '“Yes. Check-in is from 12 pm.”',
};
const TEASER_RANGES: Record<string, [number, number, string]> = { teaserDelay: [3, 120, 'Show after (seconds)'], teaserDays: [1, 60, 'Show again after (days)'] };

type Props = {
  initial: ChatSettings;
  bounds: Record<string, [number, number, string, string]>;
  numKeys: string[];
  tones: { id: string; label: string }[];
  usage: { requests: number; tokens: number; tokenCap: number };
  children: ReactNode;
};

export function SettingsForm({ initial, bounds, numKeys, tones, usage, children }: Props) {
  const [base, setBase] = useState<V>(() => toV(initial));
  const [v, setV] = useState<V>(base);
  const [state, formAction, pending] = useActionState(saveChatSettings, null);
  const toast = useToast();
  const set = (k: string, val: string | boolean) => setV(o => ({ ...o, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(base);

  useEffect(() => {
    if (!state) return;
    if (state.ok && state.saved) { const next = toV(state.saved); setBase(next); setV(next); toast('Settings saved. Guests see changes within a minute.'); }
    else if (!state.ok) toast(state.error ?? 'Could not save.', 'error');
  }, [state, toast]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!String(v.name).trim()) e.name = 'Give the assistant a name.';
    if (!String(v.greeting).trim()) e.greeting = 'Write a first message for guests.';
    const ranges: [string, number, number][] = [...Object.entries(TEASER_RANGES).map(([k, r]) => [k, r[0], r[1]] as [string, number, number]), ...numKeys.map(k => [k, bounds[k][0], bounds[k][1]] as [string, number, number])];
    for (const [k, lo, hi] of ranges) {
      const x = Number(v[k]);
      if (String(v[k]).trim() === '' || !Number.isFinite(x) || x < lo || x > hi) e[k] = `Enter a number between ${lo.toLocaleString('en-IN')} and ${hi.toLocaleString('en-IN')}.`;
    }
    return e;
  }, [v, bounds, numKeys]);
  const invalid = Object.keys(errors).length > 0;
  const pct = (usage.requests / Number(base.dailyCap)) * 100;
  const on = v.enabled === true;

  return (
    <div className="adm-page adm-page--settings">
      <PageHeader title="Assistant settings" description="How the chat assistant introduces itself and behaves on your website. Changes apply within a minute." />
      <nav className="adm-jump" aria-label="On this page">
        {[['identity', 'Identity'], ['personality', 'Personality'], ['bubble', 'Greeting bubble'], ['limits', 'Limits and usage'], ['blocked', 'Blocked guests']].map(([id, l]) => <a key={id} href={`#${id}`}>{l}</a>)}
      </nav>

      <div className="adm-settings">
        <div className="adm-settings-main">
          <form action={formAction} id="settings-form" className="adm-stack" noValidate>
            <div className="adm-card adm-onoff">
              <Switch label={on ? 'Assistant is on' : 'Assistant is off'} help={on ? 'Guests can chat with it from your website.' : 'The chat button is hidden from guests.'} name="enabled" checked={on} onChange={e => set('enabled', e.target.checked)} />
            </div>

            <Section id="identity" title="Identity" description="What guests see at the top of the chat and in its first message.">
              <Field label="Assistant name" htmlFor="name" error={errors.name} counter={`${String(v.name).length}/40`}>
                <Input id="name" name="name" value={String(v.name)} maxLength={40} onChange={e => set('name', e.target.value)} />
              </Field>
              <Field label="First message" htmlFor="greeting" error={errors.greeting} counter={`${String(v.greeting).length}/300`} help="The assistant says this when a guest opens the chat.">
                <Textarea id="greeting" name="greeting" rows={3} value={String(v.greeting)} maxLength={300} onChange={e => set('greeting', e.target.value)} />
              </Field>
            </Section>

            <Section id="personality" title="Personality" description="How the assistant sounds when it replies.">
              <div className="adm-tones" role="radiogroup" aria-label="Tone">
                {tones.map(t => (
                  <label key={t.id} className={`adm-tone${v.tone === t.id ? ' is-on' : ''}`}>
                    <input type="radio" name="tone" value={t.id} checked={v.tone === t.id} onChange={() => set('tone', t.id)} />
                    <b>{t.label}</b>
                    <span>{TONE_EXAMPLE[t.id]}</span>
                  </label>
                ))}
              </div>
              <Field label="Extra instructions (optional)" htmlFor="extra" counter={`${String(v.extra).length}/1200`} help="Added to what the assistant already knows from your website. It will not give prices or promise availability, whatever is written here.">
                <Textarea id="extra" name="extra" rows={4} value={String(v.extra)} maxLength={1200} placeholder="For example: mention that the pool opens at 7 am." onChange={e => set('extra', e.target.value)} />
              </Field>
            </Section>

            <Section id="bubble" title="Greeting bubble" description="A small message beside the chat button. It never opens the chat by itself and costs nothing.">
              <Switch label="Show the bubble" name="teaserOn" checked={v.teaserOn === true} onChange={e => set('teaserOn', e.target.checked)} />
              <Field label="Message" htmlFor="teaserText" counter={`${String(v.teaserText).length}/140`}>
                <Input id="teaserText" name="teaserText" value={String(v.teaserText)} maxLength={140} onChange={e => set('teaserText', e.target.value)} />
              </Field>
              <div className="adm-grid2">
                <Field label="Show after (seconds on the page)" htmlFor="teaserDelay" error={errors.teaserDelay}>
                  <Input id="teaserDelay" name="teaserDelay" type="number" inputMode="numeric" min={3} max={120} value={String(v.teaserDelay)} onChange={e => set('teaserDelay', e.target.value)} />
                </Field>
                <Field label="Show again after (days)" htmlFor="teaserDays" error={errors.teaserDays} help="Each guest sees it once in this many days.">
                  <Input id="teaserDays" name="teaserDays" type="number" inputMode="numeric" min={1} max={60} value={String(v.teaserDays)} onChange={e => set('teaserDays', e.target.value)} />
                </Field>
              </div>
              <Switch label="Also show it once a guest scrolls halfway" name="teaserScroll" checked={v.teaserScroll === true} onChange={e => set('teaserScroll', e.target.checked)} />
              <Switch label="Show it on phones" help="Off by default because phones have little room." name="teaserMobile" checked={v.teaserMobile === true} onChange={e => set('teaserMobile', e.target.checked)} />
            </Section>

            <Section id="limits" title="Limits and usage" badge={<Badge>Advanced</Badge>} description="Keeps your AI credits under control. The defaults suit most resorts.">
              <div className="adm-usage">
                <div><b>{usage.requests.toLocaleString('en-IN')}</b> of {Number(base.dailyCap).toLocaleString('en-IN')} replies used today</div>
                <Progress value={pct} label="Replies used today" tone={pct >= 90 ? 'red' : pct >= 70 ? 'amber' : undefined} />
                <small>The count resets at midnight India time.</small>
              </div>
              <details className="adm-details adm-details--box">
                <summary>Change limits</summary>
                <div className="adm-grid2">
                  {numKeys.map(k => (
                    <Field key={k} label={bounds[k][2]} htmlFor={k} error={errors[k]} help={`${bounds[k][3]}${bounds[k][3] ? ' ' : ''}(${bounds[k][0].toLocaleString('en-IN')} to ${bounds[k][1].toLocaleString('en-IN')})`}>
                      <Input id={k} name={k} type="number" inputMode="numeric" min={bounds[k][0]} max={bounds[k][1]} value={String(v[k])} onChange={e => set(k, e.target.value)} />
                    </Field>
                  ))}
                </div>
              </details>
            </Section>
          </form>
          {children}
        </div>
        <ChatPreview name={String(v.name)} greeting={String(v.greeting)} teaserOn={v.teaserOn === true} teaserText={String(v.teaserText)} />
      </div>

      <div className={`adm-savebar${dirty ? ' is-visible' : ''}`} role="region" aria-label="Unsaved changes" aria-hidden={!dirty}>
        <div className="adm-savebar-inner">
          <span>{invalid ? 'Fix the highlighted fields to save.' : 'You have unsaved changes.'}</span>
          <button type="button" className={btn('ghost', 'sm')} tabIndex={dirty ? 0 : -1} onClick={() => setV(base)} disabled={pending}>Discard</button>
          <button type="submit" form="settings-form" className={btn('primary', 'sm')} tabIndex={dirty ? 0 : -1} disabled={pending || invalid}>{pending ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}
