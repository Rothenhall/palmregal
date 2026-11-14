import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { CircleAlert } from 'lucide-react';
import { signIn } from '@/auth';
import { Field, Input, btn } from '../_ui/ui';
import { RESORT } from '../_lib/format';

export const metadata: Metadata = { title: 'Sign in' };

async function login(formData: FormData) {
  'use server';
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/admin/',
    });
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login/?error=1');
    throw err; // the success redirect is thrown too
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="adm-login">
      <div className="adm-login-wrap">
        <div className="adm-login-brand"><span className="adm-mark" aria-hidden="true">PR</span><span className="adm-wordmark">{RESORT}</span></div>
        <form className="adm-card adm-login-card" action={login}>
          <div><h1>Welcome back</h1><p>Sign in to manage your website and guest chats.</p></div>
          {error && <p className="adm-inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />That email or password is not right. Please try again.</p>}
          <Field label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="username" required autoFocus /></Field>
          <Field label="Password" htmlFor="password"><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
          <button className={`${btn('primary')} adm-btn--block`} type="submit">Sign in</button>
        </form>
        <a className="adm-credit adm-credit--login" href="https://rothenhall.com" target="_blank" rel="noopener" aria-label="Built by Rothenhall Partners (opens in a new tab)"><span>Built by</span><img src="/brand/rothenhall-wordmark-ink.png" alt="" width="640" height="112" loading="lazy" /></a>
      </div>
    </main>
  );
}
