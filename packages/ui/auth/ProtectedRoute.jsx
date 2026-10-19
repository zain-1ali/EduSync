import { ACCESS_LEVELS } from '@school/contracts';
import { Navigate, useLocation } from 'react-router-dom';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { useAuth } from './AuthProvider';

function SessionLoading() {
  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        <span className="material-symbols-outlined animate-spin" aria-hidden="true">
          progress_activity
        </span>
        <span className="font-semibold">Restoring your EduSync session…</span>
      </div>
    </main>
  );
}

export function ProtectedRoute({
  children,
  module,
  level = ACCESS_LEVELS.VIEW,
  roles,
}) {
  const location = useLocation();
  const { status, user, hasAccess } = useAuth();

  if (status === 'loading') return <SessionLoading />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) return <AccessDeniedPage />;
  if (module && !hasAccess(module, level)) return <AccessDeniedPage />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { status, user } = useAuth();
  if (status === 'loading') return <SessionLoading />;
  if (status === 'authenticated') {
    const destination = user?.role === 'super_admin' ? '/dev-admin' : '/dashboard';
    return <Navigate to={destination} replace />;
  }
  return children;
}
