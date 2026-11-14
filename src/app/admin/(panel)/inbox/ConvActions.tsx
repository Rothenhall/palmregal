'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCheck, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import { Menu } from '../../_ui/Menu';
import { ConfirmDialog } from '../../_ui/Dialog';
import { useToast } from '../../_ui/Toast';
import { btn } from '../../_ui/ui';
import { blockGuest, markDone, removeConversation } from './actions';

export function ConvActions({ id, done, canMark, blocked }: { id: string; done: boolean; canMark: boolean; blocked: boolean }) {
  const [dlg, setDlg] = useState<null | 'block' | 'delete'>(null);
  const [network, setNetwork] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const close = () => { setDlg(null); setNetwork(false); };

  const toggleDone = async () => {
    try { await markDone(id, !done); toast(done ? 'Moved back to open' : 'Marked as done'); router.refresh(); }
    catch { toast('Something went wrong. Please try again.', 'error'); }
  };

  return (
    <>
      {canMark && (
        <button type="button" className={btn(done ? 'secondary' : 'primary', 'sm')} onClick={toggleDone}>
          {done ? <RotateCcw size={14} aria-hidden="true" /> : <CheckCheck size={14} aria-hidden="true" />}{done ? 'Reopen' : 'Mark as done'}
        </button>
      )}
      <Menu
        label="More actions"
        trigger={<MoreHorizontal size={16} aria-hidden="true" />}
        items={[
          { label: blocked ? 'Guest is blocked' : 'Block guest', icon: <Ban size={16} aria-hidden="true" />, disabled: blocked, onSelect: () => setDlg('block') },
          { separator: true },
          { label: 'Delete conversation', icon: <Trash2 size={16} aria-hidden="true" />, danger: true, onSelect: () => setDlg('delete') },
        ]}
      />
      <ConfirmDialog
        open={dlg === 'block'} onClose={close} title="Block this guest?" confirmLabel="Block guest" destructive
        onConfirm={async () => {
          try { await blockGuest(id, network); close(); toast('Guest blocked'); router.refresh(); }
          catch { toast('Could not block this guest.', 'error'); }
        }}
      >
        <p>They will see that the assistant is unavailable. You can allow them again any time under Assistant settings.</p>
        <label className="adm-check">
          <input type="checkbox" checked={network} onChange={e => setNetwork(e.target.checked)} />
          <span>Also block their Wi-Fi network<small>Everyone on the same connection, such as the resort Wi-Fi, would be blocked too.</small></span>
        </label>
      </ConfirmDialog>
      <ConfirmDialog
        open={dlg === 'delete'} onClose={close} title="Delete this conversation?" confirmLabel="Delete" destructive
        onConfirm={async () => { await removeConversation(id); }}
      >
        <p>The whole chat is removed for good. This cannot be undone.</p>
      </ConfirmDialog>
    </>
  );
}
