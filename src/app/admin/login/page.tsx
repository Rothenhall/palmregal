import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { clientKey, tooManyTries } from '@/lib/adminPassword';
import { AuthError } from 'next-auth';
import { CircleAlert } from 'lucide-react';
import { signIn } from '@/auth';
import { Field } from '../_ui/ui';
import { PasswordInput, SignInButton } from './LoginBits';
import { RESORT } from '../_lib/format';

export const metadata: Metadata = { title: 'Sign in' };

async function login(formData: FormData) {
  'use server';
  try {
    await signIn('credentials', {
      password: formData.get('password'),
      redirectTo: '/admin/',
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const locked = await tooManyTries(clientKey((await headers()).get('x-forwarded-for')));
      redirect(`/admin/login/?error=${locked ? 'locked' : '1'}`);
    }
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
          <div><h1>Welcome back</h1><p>Enter the team password to manage your website and guest chats.</p></div>
          {error && <p className="adm-inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error === 'locked' ? 'Too many wrong tries. Please wait 15 minutes and try again.' : 'That password is not right. Please try again.'}</p>}
          <Field label="Password" htmlFor="password"><PasswordInput /></Field>
          <SignInButton />
        </form>
        <a className="adm-credit adm-credit--login" href="https://rothenhall.com" target="_blank" rel="noopener" aria-label="Built by Rothenhall Partners (opens in a new tab)"><span>Built by</span><img src="/brand/rothenhall-wordmark-ink.png" alt="" width="640" height="112" loading="lazy" /></a>
      </div>
    </main>
  );
}
