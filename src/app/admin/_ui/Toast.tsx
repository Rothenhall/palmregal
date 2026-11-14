'use client';
import { createContext, Suspense, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type T = { id: number; msg: string; kind: 'ok' | 'error' };
const Ctx = createContext<(msg: string, kind?: 'ok' | 'error') => void>(() => {});
export const useToast = () => useContext(Ctx);

/* Messages a server action can ask for with ?toast=key (then the key is removed from the address). */
const MESSAGES: Record<string, string> = {
  deleted: 'Conversation deleted',
  unblocked: 'Guest can use the chat again',
  added: 'Added to the assistant’s knowledge',
  saved: 'Saved',
};

function UrlToast() {
  const sp = useSearchParams();
  const path = usePathname();
  const toast = useToast();
  const seen = useRef('');
  useEffect(() => {
    const key = sp.get('toast');
    if (!key) { seen.current = ''; return; }
    if (seen.current !== key + path && MESSAGES[key]) toast(MESSAGES[key]);
    seen.current = key + path;
    const u = new URL(window.location.href);
    u.searchParams.delete('toast');
    window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
  }, [sp, path, toast]);
  return null;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const id = useRef(0);
  const push = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    const n = ++id.current;
    setItems(l => [...l, { id: n, msg, kind }]);
    setTimeout(() => setItems(l => l.filter(t => t.id !== n)), kind === 'error' ? 6000 : 3500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <Suspense fallback={null}><UrlToast /></Suspense>
      <div className="adm-toasts" role="status" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`adm-toast adm-toast--${t.kind}`}>
            {t.kind === 'ok' ? <CheckCircle2 size={16} aria-hidden="true" /> : <AlertCircle size={16} aria-hidden="true" />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
