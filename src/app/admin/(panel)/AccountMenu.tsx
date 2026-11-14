'use client';
import { ChevronsUpDown, ExternalLink, LogOut } from 'lucide-react';
import { Menu } from '../_ui/Menu';
import { Avatar } from '../_ui/ui';

export function AccountMenu({ email, initials, signOut }: { email: string; initials: string; signOut: () => Promise<void> }) {
  return (
    <Menu
      label="Account menu"
      align="left"
      placement="top"
      triggerClass="adm-account"
      header={<><b>Signed in as</b><span>{email}</span></>}
      trigger={<><Avatar text={initials} /><span className="adm-account-email">{email}</span><ChevronsUpDown size={14} aria-hidden="true" /></>}
      items={[
        { label: 'View live site', href: '/', external: true, icon: <ExternalLink size={16} aria-hidden="true" /> },
        { separator: true },
        { label: 'Sign out', onSelect: () => { void signOut(); }, icon: <LogOut size={16} aria-hidden="true" /> },
      ]}
    />
  );
}
