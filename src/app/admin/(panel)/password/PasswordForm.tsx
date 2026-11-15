'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { CircleAlert, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import type { ChangeResult } from '@/lib/adminPassword';
import { useToast } from '../../_ui/Toast';
import { Field, Section, btn } from '../../_ui/ui';
import { updatePassword } from './actions';

function Pass({ id, name, auto, show }: { id: string; name: string; auto: string; show: boolean }) {
  return <input id={id} name={name} type={show ? 'text' : 'password'} autoComplete={auto} required className="adm-input" maxLength={200} />;
}

/** How strong a new password looks, from length and variety (a guide only; the server checks the minimum). */
function strength(p: string, min: number) {
  if (!p) return { n: 0, label: '' };
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
  const n = p.length < min ? 1 : p.length >= 16 && kinds >= 3 ? 4 : kinds >= 3 || p.length >= 14 ? 3 : 2;
  return { n, label: ['', 'Too short', 'Okay', 'Good', 'Strong'][n] };
}

export function PasswordForm({ connected, starting, min }: { connected: boolean; starting: boolean; min: number }) {
  const [state, action, pending] = useActionState<ChangeResult | null, FormData>(updatePassword, null);
  const [show, setShow] = useState(false);
  const [next, setNext] = useState('');
  const form = useRef<HTMLFormElement>(null);
  const toast = useToast();
  const s = strength(next, min);

  useEffect(() => {
    if (state?.ok) { form.current?.reset(); setNext(''); toast('Password changed. Share the new one with your team.'); }
  }, [state, toast]);

  const err = (f: 'current' | 'next' | 'confirm') => (state && !state.ok && state.field === f ? state.error : null);

  return (
    <div className="adm-stack">
      {starting && (
        <p className="adm-banner"><CircleAlert size={16} aria-hidden="true" /> You are still using the starting password. Choose your own one below.</p>
      )}
      <Section title="Change the password" description={`At least ${min} characters. A short sentence you can remember works well.`}>
        {!connected ? (
          <p className="adm-muted">The password cannot be changed on this server because publishing is not connected.</p>
        ) : (
          <form ref={form} action={action} className="adm-stack adm-pw-form">
            <Field label="Current password" htmlFor="pw-cur" error={err('current')}><Pass id="pw-cur" name="current" auto="current-password" show={show} /></Field>
            <Field label="New password" htmlFor="pw-new" error={err('next')}>
              <input id="pw-new" name="next" type={show ? 'text' : 'password'} autoComplete="new-password" required className="adm-input" maxLength={200} value={next} onChange={e => setNext(e.target.value)} />
              {next && <span className={`adm-pw-meter is-${s.n}`} aria-live="polite"><i /><i /><i /><i /><small>{s.label}</small></span>}
            </Field>
            <Field label="New password again" htmlFor="pw-conf" error={err('confirm')}><Pass id="pw-conf" name="confirm" auto="new-password" show={show} /></Field>
            {state && !state.ok && !state.field && <p className="adm-inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{state.error}</p>}
            <div className="adm-pw-actions">
              <button type="button" className={btn('ghost', 'sm')} onClick={() => setShow(v => !v)} aria-pressed={show}>
                {show ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}{show ? 'Hide passwords' : 'Show passwords'}
              </button>
              <button type="submit" className={btn('primary')} disabled={pending}><KeyRound size={16} aria-hidden="true" />{pending ? 'Saving…' : 'Change password'}</button>
            </div>
          </form>
        )}
      </Section>
      <p className="adm-fineprint"><ShieldCheck size={14} aria-hidden="true" />Only a scrambled version of the password is stored. After 8 wrong tries, sign-in pauses for 15 minutes on that network.</p>
    </div>
  );
}
