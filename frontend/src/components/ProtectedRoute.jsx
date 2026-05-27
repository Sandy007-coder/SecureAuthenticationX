import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../App.jsx';

/**
 * ProtectedRoute
 * Wraps private pages. If the user is not authenticated, redirects to /login.
 * If requireAdmin is true and the user does not have an admin role, redirects to /dashboard.
 */
export default function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
