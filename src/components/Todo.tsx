import { DRAFT } from '@/lib/book';
export function Todo({ children }: { children: React.ReactNode }) {
  if (!DRAFT) return null;
  return <span className="todo">{children}</span>;
}
