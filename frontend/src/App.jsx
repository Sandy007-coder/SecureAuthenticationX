import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { authApi } from './services/api.js';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Profile from './pages/Profile.jsx';
import SecuritySettings from './pages/SecuritySettings.jsx';
import Alerts from './pages/Alerts.jsx';
import AlertDetails from './pages/AlertDetails.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
};

function AuthProvider({ children }) {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const response = await authApi.getProfile();
        if (mounted) {
          setAuthenticatedUser(response.data.user ?? null);
        }
      } catch {
        if (mounted) {
          setAuthenticatedUser(null);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback((userData) => {
    setAuthenticatedUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      setAuthenticatedUser(null);
    }
  }, []);

  const updateUser = useCallback((partialUpdate) => {
    setAuthenticatedUser((current) =>
      current ? { ...current, ...partialUpdate } : current
    );
  }, []);

  const authContextValue = useMemo(
    () => ({
      user: authenticatedUser,
      isAuthenticated: Boolean(authenticatedUser),
      isLoading: isInitializing,
      login,
      logout,
      updateUser,
    }),
    [authenticatedUser, isInitializing, login, logout, updateUser]
  );

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-cyber-bg">
        <LoadingSpinner size="lg" message="Authenticating…" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security-settings" element={<SecuritySettings />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:id" element={<AlertDetails />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}