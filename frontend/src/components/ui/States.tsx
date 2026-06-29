import { SkeletonCards, SkeletonTable, SkeletonDashboard, SkeletonList } from './Skeleton';

export type LoadingVariant = 'cards' | 'table' | 'dashboard' | 'list';

/**
 * Skeleton loading state for panels/views. Defaults to a clean card grid;
 * pass `variant` to match the view (table / dashboard / list).
 */
export function Loading({ variant = 'cards' }: { variant?: LoadingVariant; label?: string }) {
  return (
    <div className="fade-up" aria-busy="true" aria-live="polite">
      {variant === 'table' ? <SkeletonTable /> : variant === 'dashboard' ? <SkeletonDashboard /> : variant === 'list' ? <SkeletonList /> : <SkeletonCards />}
    </div>
  );
}

/** Inline error block with retry. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '50px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 30 }}>⚠️</div>
      <div style={{ fontSize: 14, color: '#ff9b9b', maxWidth: 420 }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ cursor: 'pointer', marginTop: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '9px 18px' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Empty placeholder for zero-result views. */
export function EmptyState({ icon = '📭', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 34, opacity: 0.8 }}>{icon}</div>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, color: '#6b7686', maxWidth: 380 }}>{hint}</div>}
    </div>
  );
}
