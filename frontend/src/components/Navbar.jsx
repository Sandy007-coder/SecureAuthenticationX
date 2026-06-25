import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react';

import { useAuth } from '../App.jsx';

const PAGE_TITLES = {
  '/dashboard': 'Security Dashboard',
  '/admin': 'Admin Control Panel',
  '/profile': 'User Profile',
  '/security-settings': 'Security Settings',
};

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readIds, setReadIds] = useState([]);

  const notifications = [
    {
      id: 1,
      severity: 'critical',
      title: 'Brute-Force Attempt Detected',
      message: '18 failed login attempts from IP 203.0.113.42 in the last 10 minutes.',
      time: '2 min ago',
    },
    {
      id: 2,
      severity: 'warning',
      title: 'Unusual Location Sign-In',
      message: 'New sign-in from Singapore detected for account diana@corp.io.',
      time: '5 min ago',
    },
  ];

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'SecureAuthenticationX';

  const userInitials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'SX';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOpenNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setReadIds(notifications.map((n) => n.id));
  };

  const handleViewDetails = (id) => {
    setIsNotificationOpen(false);
    navigate(`/alerts/${id}`);
  };

  const handleViewAllAlerts = () => {
    setIsNotificationOpen(false);
    navigate('/alerts');
  };

  return (
    <header
      className="
        sticky top-0 z-30 flex h-16 items-center justify-between
        border-b border-cyber-border/50 bg-cyber-surface/80
        px-4 backdrop-blur-sm lg:px-6
      "
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="
            rounded-lg p-2 text-cyber-muted
            hover:bg-cyber-border/20 hover:text-cyber-bright
            lg:hidden
          "
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <Shield size={22} className="text-cyber-blue" />
          <span className="hidden sm:block text-sm font-mono-code text-cyber-muted">
            /
            <span className="ml-1 text-cyber-bright">{pageTitle}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">

        <div className="relative">
          <button
            type="button"
            onClick={handleOpenNotifications}
            className="
              relative rounded-lg p-2 text-cyber-muted
              hover:bg-cyber-border/20 hover:text-cyber-bright
            "
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <>
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyber-red" />
                <span
                  className="
                    absolute -right-1 -top-1
                    flex h-4 w-4 items-center justify-center
                    rounded-full bg-cyber-red
                    text-[10px] text-white
                  "
                >
                  {unreadCount}
                </span>
              </>
            )}
          </button>

          {isNotificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationOpen(false)}
              />

              <div
                className="
                  absolute right-0 top-full z-50 mt-2 w-96
                  overflow-hidden rounded-xl
                  border border-cyber-border/60
                  bg-cyber-surface
                  shadow-glass animate-fade-in
                "
              >
                <div className="border-b border-cyber-border/50 px-4 py-3">
                  <h3 className="font-semibold text-cyber-bright">Notifications</h3>
                  <p className="text-xs text-cyber-muted">
                    {notifications.length} active alerts
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="
                        border-b border-cyber-border/30
                        px-4 py-4
                        hover:bg-cyber-surface/60
                        transition-colors
                      "
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${
                            notification.severity === 'critical'
                              ? 'bg-cyber-red'
                              : 'bg-cyber-yellow'
                          }`}
                        />

                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              notification.severity === 'critical'
                                ? 'text-cyber-red'
                                : 'text-cyber-yellow'
                            }`}
                          >
                            {notification.title}
                          </p>

                          <p className="mt-1 text-sm text-cyber-muted">
                            {notification.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-cyber-muted">{notification.time}</p>

                            <button
                              onClick={() => handleViewDetails(notification.id)}
                              className="
                                text-xs font-medium text-cyber-blue
                                hover:underline
                              "
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cyber-border/50 p-3">
                  <button
                    onClick={handleViewAllAlerts}
                    className="
                      w-full rounded-lg
                      bg-cyber-blue/10 py-2
                      text-sm font-medium text-cyber-blue
                      hover:bg-cyber-blue/20
                    "
                  >
                    View All Alerts
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="
              flex items-center gap-2 rounded-lg px-3 py-1.5
              hover:bg-cyber-border/20
            "
          >
            <div
              className="
                flex h-7 w-7 items-center justify-center
                rounded-full border border-cyber-blue/40
                bg-cyber-blue/20 text-xs font-bold
                text-cyber-blue
              "
            >
              {userInitials}
            </div>

            <span className="hidden sm:block text-sm font-medium text-cyber-bright">
              {user?.username || 'User'}
            </span>

            <ChevronDown
              size={14}
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div
                className="
                  absolute right-0 top-full z-20 mt-2
                  w-48 overflow-hidden rounded-xl
                  border border-cyber-border/60
                  glass-card shadow-glass
                "
              >
                <div className="border-b border-cyber-border/50 px-4 py-3">
                  <p className="truncate text-sm font-medium text-cyber-bright">
                    {user?.username}
                  </p>
                  <p className="truncate text-xs text-cyber-muted">
                    {user?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="
                      flex items-center gap-2 px-4 py-2.5
                      text-sm text-cyber-text
                      hover:bg-cyber-blue/10
                    "
                  >
                    <User size={15} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex w-full items-center gap-2
                      px-4 py-2.5 text-sm text-cyber-red
                      hover:bg-cyber-red/10
                    "
                  >
                    <LogOut size={15} />
                    Logout
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