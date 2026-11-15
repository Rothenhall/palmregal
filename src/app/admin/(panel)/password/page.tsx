import { canChangePassword, MIN_LENGTH, usingDefaultPassword } from '@/lib/adminPassword';
import { PageHeader } from '../../_ui/ui';
import { PasswordForm } from './PasswordForm';

export const metadata = { title: 'Password' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const [connected, starting] = [canChangePassword(), await usingDefaultPassword()];
  return (
    <div className="adm-page adm-page--narrow">
      <PageHeader title="Password" description="Everyone on the team signs in to this admin with the same password. Change it here, then share the new one with your team." />
      <PasswordForm connected={connected} starting={starting} min={MIN_LENGTH} />
    </div>
  );
}
