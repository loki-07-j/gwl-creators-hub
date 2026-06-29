import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Spinner } from '@/components/ui/Spinner';
import type { Role } from '@/types';

function FullScreenLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={28} />
    </div>
  );
}

/** Guards a route to authenticated users with an optional required role. */
export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') return <FullScreenLoader />;
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

/** Redirects already-authenticated users away from public-only pages (e.g. sign in). */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  if (status === 'idle' || status === 'loading') return <FullScreenLoader />;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}
