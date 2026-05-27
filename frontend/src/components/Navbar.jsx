import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Bell, LogOut, User, ChevronDown, Menu, X,
} from 'lucide-react';
import { useAuth } from '../App.jsx';

/**
 * Navbar — top navigation bar shown on authenticated pages.
 * Props:
 *   onMenuToggle — callback to toggle the mobile sidebar
 *   sidebarOpen  — boolean
 */
export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { user, logout }   = useAuth();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [dropOpen, setDrop] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'SX';

  // Current page title derived from path
  const pageTitle = {
    '/dashboard': 'Security Dashboard',
    '/admin':     'Admin Control Panel',
    '/profile':   'User Profile',
  }[location.pathname] || 'SecureAuthX';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4
                       border-b border-cyber-border/50 bg-cyber-surface/80 backdrop-blur-sm px-4 lg:px-6">

      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-cyber-muted hover:text-cyber-bright hover:bg-cyber-border/20 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo + page title */}
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-cyber-blue" />
          <span className="hidden sm:block text-cyber-muted text-sm font-mono-code">
            /&nbsp;<span className="text-cyber-bright">{pageTitle}</span>
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">

        {/* Bell */}
        <button className="relative p-2 rounded-lg text-cyber-muted hover:text-cyber-bright hover:bg-cyber-border/20 transition-colors">
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyber-red">
            <span className="absolute inset-0 rounded-full bg-cyber-red animate-ping" />
          </span>
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDrop((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-cyber-border/20 transition-colors"
          >
            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full
                            bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-blue text-xs font-bold font-display">
              {initials}
            </div>
            <span className="hidden sm:block text-cyber-bright text-sm font-medium max-w-[120px] truncate">
              {user?.username || 'User'}
            </span>
            <ChevronDown
              size={14}
              className={`text-cyber-muted transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setDrop(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 z-20 glass-card border border-cyber-border/60
                              rounded-xl overflow-hidden shadow-glass animate-fade-in">
                <div className="px-4 py-3 border-b border-cyber-border/50">
                  <p className="text-cyber-bright text-sm font-medium truncate">{user?.username}</p>
                  <p className="text-cyber-muted text-xs truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDrop(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyber-text hover:bg-cyber-blue/10 hover:text-cyber-blue transition-colors"
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-cyber-red hover:bg-cyber-red/10 transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
