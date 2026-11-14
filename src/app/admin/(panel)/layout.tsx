import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { AdminNav } from './AdminNav';

/* Second line of defence behind the middleware: no session, no admin. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login/');

  async function logout() {
    'use server';
    await signOut({ redirectTo: '/admin/login/' });
  }

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand"><span>Palm Regal</span><small>Admin</small></div>
        <AdminNav />
        <div className="adm-user">
          <span title={session.user.email ?? ''}>{session.user.email}</span>
          <form action={logout}><button className="adm-btn adm-btn--ghost" type="submit">Log out</button></form>
        </div>
        <a className="adm-credit" href="https://rothenhall.com" target="_blank" rel="noopener" aria-label="Built by Rothenhall Partners (opens in a new tab)"><span>Built by</span><img src="/brand/rothenhall-wordmark-light.png" alt="" width="640" height="112" loading="lazy" /></a>
      </aside>
      <main className="adm-main">{children}
        <a className="adm-credit adm-credit--main" href="https://rothenhall.com" target="_blank" rel="noopener" aria-label="Built by Rothenhall Partners (opens in a new tab)"><span>Built by</span><img src="/brand/rothenhall-wordmark-ink.png" alt="" width="640" height="112" loading="lazy" /></a>
      </main>
    </div>
  );
}
