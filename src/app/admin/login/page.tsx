import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

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
      <form className="adm-card adm-login-card" action={login}>
        <p className="adm-eyebrow">Palm Regal</p>
        <h1>Admin sign in</h1>
        {error && <p className="adm-error" role="alert">That email or password is not right. Please try again.</p>}
        <label>Email<input name="email" type="email" autoComplete="username" required autoFocus /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="adm-btn" type="submit">Sign in</button>
      </form>
      <a className="adm-login-credit" href="https://rothenhall.com" target="_blank" rel="noopener" aria-label="Built by Rothenhall Partners (opens in a new tab)"><span>Built by</span><img src="/brand/rothenhall-wordmark-ink.png" alt="" width="640" height="112" loading="lazy" /></a>
    </main>
  );
}
