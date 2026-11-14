'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { btn } from './ui';

/** Native modal <dialog>: the browser traps focus, makes the page inert and closes on Esc. */
export function Dialog({ open, onClose, title, description, children, footer, wide }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`adm-dialog${wide ? ' adm-dialog--wide' : ''}`}
      aria-labelledby="adm-dlg-title"
      onClose={onClose}
      onClick={e => { if (e.target === ref.current) onClose(); }}
    >
      {open && (
        <div className="adm-dialog-inner">
          <div className="adm-dialog-head">
            <div><h2 id="adm-dlg-title">{title}</h2>{description && <p>{description}</p>}</div>
            <button type="button" className={btn('ghost', 'sm', true)} onClick={onClose} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="adm-dialog-body">{children}</div>
          {footer && <div className="adm-dialog-foot">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, onClose, title, children, confirmLabel, destructive, onConfirm }: { open: boolean; onClose: () => void; title: string; children: ReactNode; confirmLabel: string; destructive?: boolean; onConfirm: () => Promise<void> | void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className={btn('secondary')} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={btn(destructive ? 'danger' : 'primary')}
            disabled={busy}
            onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}
          >{busy ? 'Working…' : confirmLabel}</button>
        </>
      }
    >
      <div className="adm-dialog-text">{children}</div>
    </Dialog>
  );
}
