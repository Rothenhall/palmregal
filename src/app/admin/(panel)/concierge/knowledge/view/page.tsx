import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDoc } from '@/lib/chat/kb';
import { Badge, Card, PageHeader } from '../../../../_ui/ui';
import { n, shortDate } from '../../../../_lib/format';

export const metadata = { title: 'Document' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const found = id ? await getDoc(id) : null;
  if (!found) notFound();
  const { doc, chunks } = found;
  return (
    <div className="adm-page adm-page--narrow">
      <Link href="/admin/concierge/knowledge/" className="adm-backlink"><ArrowLeft size={14} aria-hidden="true" />Knowledge</Link>
      <PageHeader
        title={doc.title}
        description={<>{doc.kind === 'note' ? 'Note' : doc.filename} · {n(doc.chars)} characters · added {shortDate(doc.at)} {doc.enabled ? <Badge tone="teal">In use</Badge> : <Badge>Off</Badge>}</>}
      />
      <Card>
        <p className="adm-muted">This is exactly what the assistant can read from this item. If it looks wrong or empty, upload a cleaner file or paste the text as a note.</p>
        <pre className="adm-pre">{chunks.join('\n\n')}</pre>
      </Card>
    </div>
  );
}
