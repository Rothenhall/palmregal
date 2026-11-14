import { FileQuestion } from 'lucide-react';
import { ButtonLink, EmptyState } from '../_ui/ui';

export default function AdminNotFound() {
  return (
    <div className="adm-notfound">
      <EmptyState
        icon={<FileQuestion size={22} />}
        title="404 · This page doesn't exist"
        action={<ButtonLink href="/admin/" variant="primary">Back to Home</ButtonLink>}
      >
        The link may be old, or the page was moved. Use the menu on the left to find what you need.
      </EmptyState>
    </div>
  );
}
