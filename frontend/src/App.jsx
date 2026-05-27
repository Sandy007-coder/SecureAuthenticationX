import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authApi } from './services/api.js';

import Login        from './pages/Login.jsx';
import Register     from './pages/Register.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import AdminPanel   from './pages/AdminPanel.jsx';
import Profile      from './pages/Profile.jsx';
import NotFound     from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// ─── Auth Provider ────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt to restore session from server on first mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.getProfile();
        setUser(data.user || data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cyber-bg">
        <LoadingSpinner size="lg" message="Authenticating…" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<Profile />} />
        </Route>

        {/* Protected routes — admin only */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Redirects */}
        <Route path="/"   element={<Navigate to="/dashboard" replace />} />
        <Route path="*"   element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
