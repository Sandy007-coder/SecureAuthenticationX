import { NavLink, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronRight,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  User,
} from 'lucide-react';

import { useAuth } from '../App.jsx';

const SECTION_HEADING_CLASS =
  'mb-2 px-3 font-mono-code text-xs font-semibold uppercase tracking-widest text-cyber-muted';

const ROLE_LABELS = {
  admin: 'Administrator',
  analyst: 'Security Analyst',
  viewer: 'Viewer',
  user: 'User',
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userInitials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'SX';

  const role = user?.role || 'user';
  const canViewAlerts = ['admin', 'analyst', 'viewer'].includes(role);
  const canViewAdminPanel = role === 'admin';
  const mfaEnabled = user?.mfaEnabled ?? true;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigationItemClass = ({ isActive }) =>
    [
      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
      'transition-all duration-200',
      isActive
        ? 'border-r-2 border-cyber-blue bg-cyber-blue/15 text-cyber-blue'
        : 'text-cyber-muted hover:bg-cyber-border/20 hover:text-cyber-bright',
    ].join(' ');

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col',
          'border-r border-cyber-border/50 bg-cyber-surface',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:z-auto lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-16 items-center gap-3 border-b border-cyber-border/50 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyber-blue/40 bg-cyber-blue/20">
            <Shield size={18} className="text-cyber-blue" />
          </div>

          <div>
            <p className="font-display text-sm font-bold tracking-wider text-cyber-bright">
              SecureAuthenticationX
            </p>
            <p className="font-mono-code text-xs text-cyber-muted">
              v2.0.0
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className={SECTION_HEADING_CLASS}>Main</p>

          <NavLink to="/dashboard" className={getNavigationItemClass} onClick={onClose}>
            <LayoutDashboard size={16} />
            Dashboard
            <ChevronRight size={12} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
          </NavLink>

          {canViewAlerts && (
            <NavLink to="/alerts" className={getNavigationItemClass} onClick={onClose}>
              <AlertTriangle size={16} />
              Alerts
              <ChevronRight size={12} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
            </NavLink>
          )}

          <NavLink to="/profile" className={getNavigationItemClass} onClick={onClose}>
            <User size={16} />
            Profile
            <ChevronRight size={12} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
          </NavLink>

          {canViewAdminPanel && (
            <>
              <p className={`mt-5 ${SECTION_HEADING_CLASS}`}>Admin</p>

              <NavLink to="/admin" className={getNavigationItemClass} onClick={onClose}>
                <ShieldCheck size={16} />
                Admin Panel
                <ChevronRight size={12} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
              </NavLink>
            </>
          )}

          <p className={`mt-5 ${SECTION_HEADING_CLASS}`}>Security</p>

          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cyber-muted">
            <Lock size={16} />
            <span>2FA Status</span>

            <span className={`ml-auto text-xs ${mfaEnabled ? 'badge-green' : 'badge-yellow'}`}>
              {mfaEnabled ? 'On' : 'Off'}
            </span>
          </div>

          <NavLink to="/security-settings" className={getNavigationItemClass} onClick={onClose}>
            <Settings size={16} />
            Security Settings
            <ChevronRight size={12} className="ml-auto opacity-0 transition-opacity group-hover:opacity-100" />
          </NavLink>
        </nav>

        <div className="border-t border-cyber-border/50 px-3 py-4">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div
              className="
                flex h-8 w-8 items-center justify-center rounded-full
                border border-cyber-blue/40 bg-cyber-blue/20
                font-display text-xs font-bold text-cyber-blue
              "
            >
              {userInitials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-cyber-bright">
                {user?.username || 'Guest'}
              </p>

              <p className="truncate text-xs text-cyber-muted">
                {ROLE_LABELS[role] || 'User'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm
              text-cyber-red transition-colors hover:bg-cyber-red/10
            "
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}