'use client';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function SubmitButton({ children, pendingLabel, className }: { children: ReactNode; pendingLabel: string; className: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending}>{pending && <Loader2 size={14} className="adm-spin" aria-hidden="true" />}{pending ? pendingLabel : children}</button>;
}
