'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Undo2 } from 'lucide-react';
import { ConfirmDialog } from '../../_ui/Dialog';
import { useToast } from '../../_ui/Toast';
import { btn } from '../../_ui/ui';
import { undoWebsiteChange } from './actions';

export function UndoButton({ sha, message, when }: { sha: string; message: string; when: string }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const router = useRouter();
  return (
    <>
      <button type="button" className={btn('secondary', 'sm')} onClick={() => setOpen(true)}><Undo2 size={14} aria-hidden="true" />Undo last text change</button>
      <ConfirmDialog
        open={open} onClose={() => setOpen(false)} title="Undo the last website change?" confirmLabel="Undo and republish"
        onConfirm={async () => {
          const r = await undoWebsiteChange(sha);
          setOpen(false);
          if (r.ok) { toast('Done. The previous text will be live in about 2 minutes.'); router.refresh(); } else toast(r.error, 'error');
        }}
      >
        <p>This brings back the text as it was before “{message}” ({when}). The website republishes in about 2 minutes.</p>
        <p>Only text and settings are restored. Photos you added or removed are not undone.</p>
      </ConfirmDialog>
    </>
  );
}
