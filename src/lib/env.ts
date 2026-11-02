export const isFine = () => typeof window !== 'undefined' && matchMedia('(hover:hover) and (pointer:fine)').matches;
export const hasMotion = () => typeof window !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
export function isWeak() {
  const n = navigator as any;
  return !!((n.connection && n.connection.saveData) || (n.deviceMemory && n.deviceMemory < 4) || (n.hardwareConcurrency && n.hardwareConcurrency < 4));
}
export const canLiquid = () => hasMotion() && !isWeak();
