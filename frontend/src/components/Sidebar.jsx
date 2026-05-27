import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShieldCheck, User, Settings,
  LogOut, Shield, Lock, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../App.jsx';

/**
 * Sidebar — left navigation panel.
 * Props:
 *   open     — boolean (mobile visibility)
 *   onClose  — callback to close on mobile
 */
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group
     ${isActive
       ? 'bg-cyber-blue/15 text-cyber-blue border-r-2 border-cyber-blue'
       : 'text-cyber-muted hover:text-cyber-bright hover:bg-cyber-border/20'}`;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 flex flex-col
                    bg-cyber-surface border-r border-cyber-border/50
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-cyber-border/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-blue/20 border border-cyber-blue/40">
            <Shield size={18} className="text-cyber-blue" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-cyber-bright tracking-wider">
              SecureAuthX
            </p>
            <p className="text-xs text-cyber-muted font-mono-code">v1.0.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

          {/* Main section */}
          <p className="mb-2 px-3 text-xs font-semibold tracking-widest text-cyber-muted uppercase font-mono-code">
            Main
          </p>

          <NavLink to="/dashboard" className={navItemCls} onClick={onClose}>
            <LayoutDashboard size={16} />
            Dashboard
            <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>

          <NavLink to="/profile" className={navItemCls} onClick={onClose}>
            <User size={16} />
            Profile
            <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>

          {/* Admin section — only visible to admins */}
          {user?.role === 'admin' && (
            <>
              <p className="mt-5 mb-2 px-3 text-xs font-semibold tracking-widest text-cyber-muted uppercase font-mono-code">
                Admin
              </p>
              <NavLink to="/admin" className={navItemCls} onClick={onClose}>
                <ShieldCheck size={16} />
                Admin Panel
                <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            </>
          )}

          {/* Security section */}
          <p className="mt-5 mb-2 px-3 text-xs font-semibold tracking-widest text-cyber-muted uppercase font-mono-code">
            Security
          </p>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cyber-muted">
            <Lock size={16} />
            <span>2FA Status</span>
            <span className="ml-auto badge-green text-xs">On</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cyber-muted">
            <Settings size={16} />
            <span>Settings</span>
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-cyber-border/50 px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full
                            bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-blue text-xs font-bold font-display">
              {user?.username?.slice(0, 2).toUpperCase() || 'SX'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cyber-bright truncate">{user?.username}</p>
              <p className="text-xs text-cyber-muted truncate">{user?.role || 'user'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                       text-cyber-red hover:bg-cyber-red/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
