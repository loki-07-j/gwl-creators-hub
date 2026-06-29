export const rupee = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const lakh = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

export function shortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function fullDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return shortDate(iso);
}

/** [textColor, bgColor] for a status pill. */
export function statusPill(status: string): [string, string] {
  const s = status.toUpperCase();
  if (['PAID', 'PUBLISHED', 'ACTIVE', 'REWARDED', 'LIVE', 'CREATE'].includes(s)) return ['#00C853', 'rgba(0,200,83,.12)'];
  if (['REFUNDED', 'FAILED', 'DELETE'].includes(s)) return ['#ff7b7b', 'rgba(255,82,82,.12)'];
  if (['SCHEDULED'].includes(s)) return ['#7c8bff', 'rgba(124,139,255,.12)'];
  if (['PUBLISH', 'UPDATE'].includes(s)) return ['#36b6c9', 'rgba(42,150,166,.12)'];
  // PENDING / DRAFT / PAUSED / INVITED
  return ['#F4C542', 'rgba(244,197,66,.12)'];
}

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function prettyStatus(status: string): string {
  return titleCase(status);
}

export function couponDiscount(type: string, value: number): string {
  return type === 'FIXED' ? `₹${value}` : `${value}%`;
}

export function couponExpiry(iso?: string | null): string {
  if (!iso) return 'No expiry';
  return fullDate(iso);
}

export const stars = (n: number) => '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
