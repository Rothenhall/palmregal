'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ExternalLink, MessageSquareQuote, Plus, Star, Trash2, X } from 'lucide-react';
import type { Testimonial } from '@/content/types';
import { ConfirmDialog } from '../../_ui/Dialog';
import { useToast } from '../../_ui/Toast';
import { Badge, EmptyState, Field, Input, Section, Select, Switch, Textarea, btn } from '../../_ui/ui';
import { saveTestimonials } from './actions';
import { SOURCES, TONE_OF, type TestimonialsDraft } from './shared';

const blank = (): Testimonial => ({ quote: '', name: '', from: '', stayed: '', rating: 5, source: 'Google', link: '', photo: null });
const s = (v: unknown) => (typeof v === 'string' ? v : '');

/** Star picker: click a star to set the rating, click the same star again to clear it. */
function Stars({ value, onChange, label }: { value: number | null | undefined; onChange: (v: number | null) => void; label: string }) {
  const v = Number(value) || 0;
  return (
    <div className="adm-stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" role="radio" aria-checked={v === n} aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`} className={n <= v ? 'is-on' : ''} onClick={() => onChange(v === n ? null : n)}>
          <Star size={18} aria-hidden="true" />
        </button>
      ))}
      <small>{v ? `${v} of 5` : 'No stars shown'}</small>
    </div>
  );
}

export function TestimonialsEditor({ initial, connected }: { initial: TestimonialsDraft; connected: boolean }) {
  const [base, setBase] = useState(initial);
  const [d, setD] = useState(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const dirty = JSON.stringify(d) !== JSON.stringify(base);
  const missing = d.items.findIndex(i => !s(i.quote).trim() || !s(i.name).trim());
  const linkBad = d.items.findIndex(i => s(i.link).trim() && !/^https:\/\/\S+$/i.test(s(i.link).trim()));

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const setItem = (k: number, patch: Partial<Testimonial>) => setD(o => ({ ...o, items: o.items.map((x, i) => (i === k ? { ...x, ...patch } : x)) }));
  const move = (k: number, by: number) => setD(o => {
    const items = [...o.items]; const j = k + by;
    if (j < 0 || j >= items.length) return o;
    [items[k], items[j]] = [items[j], items[k]];
    setOpen(op => (op === k ? j : op === j ? k : op));
    return { ...o, items };
  });
  const add = () => { setD(o => ({ ...o, items: [...o.items, blank()] })); setOpen(d.items.length); };

  const save = () => start(async () => {
    const r = await saveTestimonials(d);
    if (!r.ok) { toast(r.error, 'error'); return; }
    setBase(d);
    toast(r.local ? 'Saved to this computer’s copy of the website.' : 'Saved. Live on the website in about 2 minutes.');
    router.refresh();
  });

  const live = d.show && d.items.some(i => s(i.quote).trim() && s(i.name).trim());
  const invalid = missing >= 0 || linkBad >= 0;

  return (
    <>
      <div className="adm-cols adm-cols--tm">
        <div className="adm-stack">
          <div className="adm-card adm-onoff">
            <Switch
              label={live ? 'Showing on the website' : 'Hidden from the website'}
              help={d.items.length === 0 ? 'Add at least one testimonial, then switch this on.' : d.show ? 'Guests see the wall of cards above the questions section.' : 'Switch on when you are happy with the testimonials.'}
              checked={d.show} onChange={e => setD(o => ({ ...o, show: e.target.checked }))}
            />
          </div>

          <Section id="tm-list" title="Testimonials" badge={d.items.length ? <Badge>{d.items.length}</Badge> : undefined}
            description="Use the guest's own words, as they wrote them. The first and last of every seven get the large cards."
            actions={<button type="button" className={btn('primary', 'sm')} onClick={add}><Plus size={14} aria-hidden="true" />Add testimonial</button>}>
            {d.items.length === 0 ? (
              <EmptyState icon={<MessageSquareQuote size={22} />} title="No testimonials yet" action={<button type="button" className={btn('primary')} onClick={add}><Plus size={16} aria-hidden="true" />Add the first one</button>}>
                Copy a review a guest left on Google, Booking.com or in your guest book.
              </EmptyState>
            ) : (
              <ol className="adm-tm-list">
                {d.items.map((it, k) => {
                  const isOpen = open === k;
                  const bad = !s(it.quote).trim() || !s(it.name).trim();
                  return (
                    <li key={k} className={`adm-tm-item${isOpen ? ' is-open' : ''}${bad ? ' is-bad' : ''}`}>
                      <div className="adm-tm-row">
                        <button type="button" className="adm-tm-sum" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : k)}>
                          <span className={`adm-tm-tone is-${TONE_OF(k).toLowerCase()}`} title={`${TONE_OF(k)} card on the website`} aria-hidden="true" />
                          <span className="adm-tm-text">
                            <b>{s(it.name).trim() || 'New testimonial'}{it.rating ? <i className="adm-tm-stars"> {'★'.repeat(Number(it.rating))}</i> : null}</b>
                            <small>{s(it.quote).trim() ? `“${s(it.quote).trim()}”` : 'Write what the guest said'}</small>
                          </span>
                        </button>
                        <span className="adm-tm-tools">
                          <button type="button" className={btn('ghost', 'sm', true)} aria-label="Move up" disabled={k === 0} onClick={() => move(k, -1)}><ArrowUp size={14} /></button>
                          <button type="button" className={btn('ghost', 'sm', true)} aria-label="Move down" disabled={k === d.items.length - 1} onClick={() => move(k, 1)}><ArrowDown size={14} /></button>
                          <button type="button" className={btn('ghost', 'sm', true)} aria-label="Delete" onClick={() => setRemoving(k)}><Trash2 size={14} /></button>
                        </span>
                      </div>
                      {isOpen && (
                        <div className="adm-tm-form">
                          <Field label="What the guest said" htmlFor={`q${k}`} counter={`${s(it.quote).length}/700`} error={!s(it.quote).trim() ? 'Write the guest’s words.' : null}>
                            <Textarea id={`q${k}`} rows={4} maxLength={700} value={s(it.quote)} autoFocus={!s(it.quote)} onChange={e => setItem(k, { quote: e.target.value })} />
                          </Field>
                          <div className="adm-grid2">
                            <Field label="Guest name" htmlFor={`n${k}`} help="First name and initial is fine, e.g. Anita R." error={!s(it.name).trim() ? 'Add a name.' : null}>
                              <Input id={`n${k}`} maxLength={60} value={s(it.name)} onChange={e => setItem(k, { name: e.target.value })} />
                            </Field>
                            <Field label="Where they are from (optional)" htmlFor={`f${k}`}>
                              <Input id={`f${k}`} maxLength={60} value={s(it.from)} placeholder="e.g. Kolkata" onChange={e => setItem(k, { from: e.target.value })} />
                            </Field>
                            <Field label="When they stayed (optional)" htmlFor={`s${k}`}>
                              <Input id={`s${k}`} maxLength={40} value={s(it.stayed)} placeholder="e.g. March 2026" onChange={e => setItem(k, { stayed: e.target.value })} />
                            </Field>
                            <Field label="Star rating (optional)">
                              <Stars value={it.rating} label="Star rating" onChange={v => setItem(k, { rating: v })} />
                            </Field>
                            <Field label="Where it was posted (optional)" htmlFor={`p${k}`}>
                              <Select id={`p${k}`} value={s(it.source)} onChange={e => setItem(k, { source: e.target.value || null })}>
                                <option value="">Not shown</option>
                                {SOURCES.map(x => <option key={x} value={x}>{x}</option>)}
                              </Select>
                            </Field>
                            <Field label="Link to the original review (optional)" htmlFor={`l${k}`} error={s(it.link).trim() && !/^https:\/\/\S+$/i.test(s(it.link).trim()) ? 'Paste a full address starting with https://' : null}>
                              <Input id={`l${k}`} type="url" inputMode="url" maxLength={400} value={s(it.link)} placeholder="https://" onChange={e => setItem(k, { link: e.target.value })} />
                            </Field>
                          </div>
                          {it.photo ? (
                            <div className="adm-tm-photo">
                              <img src={it.photo} alt="" width={48} height={48} />
                              <span>Guest photo<small>Added in the website editor. Shown only with the guest’s permission.</small></span>
                              <button type="button" className={btn('ghost', 'sm')} onClick={() => setItem(k, { photo: null })}><X size={14} aria-hidden="true" />Remove</button>
                            </div>
                          ) : <p className="adm-fineprint">No photo: the card shows the guest’s initials. Photos can be added in the website editor, with the guest’s permission.</p>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>

          <Section id="tm-head" title="Heading" description="The words above the cards.">
            <div className="adm-grid2">
              <Field label="Small line above the heading" htmlFor="tm-eb"><Input id="tm-eb" maxLength={60} value={d.eyebrow} onChange={e => setD(o => ({ ...o, eyebrow: e.target.value }))} /></Field>
              <Field label="Heading" htmlFor="tm-h1"><Input id="tm-h1" maxLength={90} value={d.heading} onChange={e => setD(o => ({ ...o, heading: e.target.value }))} /></Field>
            </div>
            <Field label="Introduction (optional)" htmlFor="tm-in" counter={`${s(d.intro).length}/300`}>
              <Textarea id="tm-in" rows={2} maxLength={300} value={s(d.intro)} onChange={e => setD(o => ({ ...o, intro: e.target.value }))} />
            </Field>
          </Section>
        </div>

        <aside className="adm-stack adm-tm-side">
          <div className="adm-card adm-tm-preview" aria-label="Preview of the layout">
            <p className="adm-h3">How the wall will look</p>
            {d.items.length === 0 ? <p className="adm-muted">Add testimonials to see the layout.</p> : (
              <div className="adm-tm-mini">
                {d.items.slice(0, 7).map((it, k) => (
                  <span key={k} className={`is-${TONE_OF(k).toLowerCase()}${k === 0 || k === 6 ? ' is-big' : ''}`} title={s(it.name)}>
                    <i>{s(it.quote).slice(0, 60)}</i><b>{s(it.name)}</b>
                  </span>
                ))}
              </div>
            )}
            {d.items.length > 7 && <p className="adm-fineprint">{d.items.length - 7} more continue in a second wall below.</p>}
          </div>
          <div className="adm-card adm-tm-tips">
            <p className="adm-h3">Good to know</p>
            <ul>
              <li>Only add reviews guests really gave. Made-up reviews break consumer law and Google’s rules.</li>
              <li>Short quotes read best. Two or three sentences is plenty.</li>
              <li>Linking to the original review on Google or Booking.com makes it more believable.</li>
            </ul>
            <a className={btn('secondary', 'sm')} href="/#reviews" target="_blank" rel="noopener">See it on the website<ExternalLink size={14} aria-hidden="true" /></a>
            {!connected && <p className="adm-fineprint">Publishing is not connected here, so saving changes only this computer’s copy.</p>}
          </div>
        </aside>
      </div>

      <div className={`adm-savebar${dirty ? ' is-visible' : ''}`} role="region" aria-label="Unsaved changes" aria-hidden={!dirty}>
        <div className="adm-savebar-inner">
          <span>{missing >= 0 ? `Testimonial ${missing + 1} needs the guest’s words and name.` : linkBad >= 0 ? `Fix the link in testimonial ${linkBad + 1}.` : 'You have unsaved changes.'}</span>
          <button type="button" className={btn('ghost', 'sm')} tabIndex={dirty ? 0 : -1} onClick={() => setD(base)} disabled={pending}>Discard</button>
          <button type="button" className={btn('primary', 'sm')} tabIndex={dirty ? 0 : -1} onClick={save} disabled={pending || invalid}>{pending ? 'Publishing…' : 'Save and publish'}</button>
        </div>
      </div>

      <ConfirmDialog
        open={removing !== null} onClose={() => setRemoving(null)} destructive confirmLabel="Remove"
        title={`Remove ${removing !== null ? s(d.items[removing]?.name).trim() || 'this testimonial' : ''}?`}
        onConfirm={() => { const k = removing!; setD(o => ({ ...o, items: o.items.filter((_, i) => i !== k) })); setOpen(null); setRemoving(null); }}
      >
        <p>It disappears from the website when you save. Until then you can still discard the change.</p>
      </ConfirmDialog>
    </>
  );
}
