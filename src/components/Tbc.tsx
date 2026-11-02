/** Marks content the resort still has to send or confirm. Remove once the real content is in. */
export function Tbc({ children }: { children: React.ReactNode }) {
  return <span className="tbc">{children}</span>;
}
