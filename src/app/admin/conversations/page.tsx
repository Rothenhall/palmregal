import { redirect } from 'next/navigation';

/* Old address: Conversations is now the Inbox. */
export default async function Page({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  redirect(filter === 'attention' ? '/admin/inbox/?view=needs' : '/admin/inbox/');
}
