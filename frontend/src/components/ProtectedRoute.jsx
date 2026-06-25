import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../App.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

const ROLE_HIERARCHY = {
  admin: 3,
  analyst: 2,
  viewer: 1,
  user: 0,
};

export default function ProtectedRoute({ requireAdmin = false, minRole = null }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verifying session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = user?.role || 'user';

  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (minRole) {
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}