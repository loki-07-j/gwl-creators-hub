import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { RequireAuth, RedirectIfAuthed } from '@/components/RouteGuards';
import { SkeletonCards } from '@/components/ui/Skeleton';

const Landing = lazy(() => import('@/pages/Landing'));
const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const MemberDashboard = lazy(() => import('@/pages/member/MemberDashboard'));
const AdminPortal = lazy(() => import('@/pages/admin/AdminPortal'));

function PageFallback() {
  return (
    <div className="fade-up" style={{ minHeight: '100vh', maxWidth: 1160, margin: '0 auto', padding: '32px 26px' }}>
      <SkeletonCards count={6} cols={3} />
    </div>
  );
}

export default function App() {
  const bootstrap = useAuth((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/signin"
          element={
            <RedirectIfAuthed>
              <SignIn />
            </RedirectIfAuthed>
          }
        />
        <Route path="/signup/:token" element={<SignUp />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth role="MEMBER">
              <MemberDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/*"
          element={
            <RequireAuth role="ADMIN">
              <AdminPortal />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
