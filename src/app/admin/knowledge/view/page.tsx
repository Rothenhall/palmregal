import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  redirect(id ? `/admin/concierge/knowledge/view/?id=${encodeURIComponent(id)}` : '/admin/concierge/knowledge/');
}
