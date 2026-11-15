import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PaletteButton } from '../_ui/CommandPalette';
import { auth, signOut } from '@/auth';
import { AdminNav, type NavGroup } from './AdminNav';
import { AccountMenu } from './AccountMenu';
import { ShellFrame } from './ShellFrame';
import { getNeedsReply } from '../_lib/data';
import { RESORT, initials } from '../_lib/format';

/* The tab title carries the number of guests waiting, so a pinned tab shows it at a glance. */
export async function generateMetadata(): Promise<Metadata> {
  const waiting = (await getNeedsReply()).length;
  return { title: { default: 'Admin', template: `${waiting ? `(${waiting}) ` : ''}%s · Palm Regal Admin` } };
}

/* Second line of defence behind the middleware: no session, no admin. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login/');
  const email = session.user.name ?? 'Palm Regal team';
  const waiting = (await getNeedsReply()).length;

  async function logout() {
    'use server';
    await signOut({ redirectTo: '/admin/login/' });
  }

  const groups: NavGroup[] = [
    { items: [{ href: '/admin/', label: 'Home', icon: 'home', exact: true }] },
    { label: 'Guests', items: [
      { href: '/admin/inbox/', label: 'Inbox', icon: 'inbox', badge: waiting },
      { href: '/admin/insights/', label: 'Insights', icon: 'insights' },
    ] },
    { label: 'Aria', items: [
      { href: '/admin/concierge/knowledge/', label: 'Knowledge', icon: 'knowledge' },
      { href: '/admin/concierge/', label: 'Assistant settings', icon: 'settings', exact: true },
    ] },
    { label: 'Website', items: [
      { href: '/admin/editor/#/~/admin/preview/', label: 'Edit website', icon: 'edit', external: true },
      { href: '/admin/testimonials/', label: 'Testimonials', icon: 'quote' },
      { href: '/admin/website/', label: 'Website status', icon: 'website' },
    ] },
  ];

  const sidebar = (
    <>
      <div className="adm-brand"><span className="adm-mark" aria-hidden="true">PR</span><span className="adm-wordmark">{RESORT}</span></div>
      <PaletteButton />
      <AdminNav groups={groups} />
      <div className="adm-side-foot">
        <AccountMenu email={email} initials={initials(email)} signOut={logout} />
        <a className="adm-credit" href="https://rothenhall.com" target="_blank" rel="noopener" aria-label="Built by Rothenhall Partners (opens in a new tab)"><span>Built by</span><img src="/brand/rothenhall-wordmark-ink.png" alt="" width="640" height="112" loading="lazy" /></a>
      </div>
    </>
  );
  return <ShellFrame sidebar={sidebar} badge={waiting} resort={RESORT}>{children}</ShellFrame>;
}
