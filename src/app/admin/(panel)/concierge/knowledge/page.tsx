import { BookOpen } from 'lucide-react';
import { redisConfigured } from '@/lib/chat/redis';
import { KB_LIMITS, listDocs } from '@/lib/chat/kb';
import { EmptyState, PageHeader } from '../../../_ui/ui';
import { KnowledgeView } from './KnowledgeView';

export const metadata = { title: 'Knowledge' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ add?: string; error?: string }> }) {
  const { add, error } = await searchParams;
  if (!redisConfigured()) {
    return (
      <div className="adm-page">
        <PageHeader title="Knowledge" />
        <EmptyState icon={<BookOpen size={22} />} title="Knowledge is not connected yet">The chat database is not set up, so documents cannot be shown.</EmptyState>
      </div>
    );
  }
  const docs = await listDocs();
  return <KnowledgeView docs={docs} limits={{ docs: KB_LIMITS.docs, totalChars: KB_LIMITS.totalChars, noteChars: KB_LIMITS.noteChars, fileMb: KB_LIMITS.fileBytes / 1048576 }} openAdd={add === '1'} error={error} />;
}
