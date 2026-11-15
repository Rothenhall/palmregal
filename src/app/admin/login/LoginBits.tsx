'use client';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';

/** Password field with a show / hide button, and a Caps Lock warning. */
export function PasswordInput() {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  return (
    <>
      <span className="adm-pass">
        <input
          id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required autoFocus className="adm-input"
          onKeyUp={e => setCaps(e.getModifierState('CapsLock'))} onBlur={() => setCaps(false)}
        />
        <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
      {caps && <small className="adm-caps">Caps Lock is on</small>}
    </>
  );
}

/** The sign-in button shows that it is working, and cannot be pressed twice. */
export function SignInButton() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? <><LoaderCircle size={16} className="adm-spin" aria-hidden="true" />Signing in…</> : 'Sign in'}
    </button>
  );
}
