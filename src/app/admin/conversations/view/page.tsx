import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  redirect(id ? `/admin/inbox/?c=${encodeURIComponent(id)}` : '/admin/inbox/');
}
