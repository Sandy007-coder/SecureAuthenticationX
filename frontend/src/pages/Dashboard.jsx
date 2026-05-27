import React, { useState, useEffect } from 'react';
import {
  Users, ShieldAlert, LogIn, Activity,
  TrendingUp, Clock, Eye,
} from 'lucide-react';
import Navbar              from '../components/Navbar.jsx';
import Sidebar             from '../components/Sidebar.jsx';
import SecurityCard        from '../components/SecurityCard.jsx';
import LoginActivityTable  from '../components/LoginActivityTable.jsx';
import AlertBanner         from '../components/AlertBanner.jsx';
import LoadingSpinner      from '../components/LoadingSpinner.jsx';
import { useAuth }         from '../App.jsx';
import { adminApi }        from '../services/api.js';

// ─── Mock activity data (used as fallback when no backend is running) ─────────
const MOCK_ACTIVITY = [
  { id: 1, user: 'alice@corp.io',   ip: '192.168.1.42',  location: 'New York, US',     device: 'desktop', status: 'success', timestamp: '2024-12-28 14:32:01' },
  { id: 2, user: 'bob@corp.io',     ip: '10.0.0.17',     location: 'London, UK',       device: 'mobile',  status: 'success', timestamp: '2024-12-28 14:28:45' },
  { id: 3, user: 'charlie@corp.io', ip: '203.0.113.42',  location: 'Unknown',          device: 'unknown', status: 'failed',  timestamp: '2024-12-28 14:15:22' },
  { id: 4, user: 'diana@corp.io',   ip: '172.16.0.88',   location: 'Singapore, SG',    device: 'desktop', status: 'success', timestamp: '2024-12-28 13:55:10' },
  { id: 5, user: 'eve@corp.io',     ip: '198.51.100.7',  location: 'Toronto, CA',      device: 'mobile',  status: 'failed',  timestamp: '2024-12-28 13:40:33' },
];

const MOCK_STATS = { totalUsers: 142, failedLogins: 18, lockedAccounts: 3, activeSessions: 57 };

export default function Dashboard() {
  const { user }             = useAuth();
  const [sidebarOpen, setSidebar] = useState(false);
  const [stats, setStats]    = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [alerts, setAlerts]  = useState([
    { id: 1, type: 'danger',  title: 'Brute-Force Attempt Detected', message: '18 failed login attempts from IP 203.0.113.42 in the last 10 minutes.' },
    { id: 2, type: 'warning', title: 'Unusual Location Sign-In',      message: 'New sign-in from Singapore detected for account diana@corp.io.' },
  ]);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Stats
    adminApi.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoadingStats(false));

    // Logs
    adminApi.getLogs()
      .then(({ data }) => setActivity(data.logs || data))
      .catch(() => setActivity(MOCK_ACTIVITY))
      .finally(() => setLoadingActivity(false));
  }, []);

  const dismissAlert = (id) => setAlerts((a) => a.filter((x) => x.id !== id));

  const now = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    <div className="flex h-screen bg-cyber-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebar(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebar((v) => !v)} sidebarOpen={sidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 space-y-6 animate-fade-in">

          {/* Welcome header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-bold text-cyber-bright">
                Welcome back,{' '}
                <span className="neon-text">{user?.username || 'Operator'}</span>
              </h1>
              <p className="text-cyber-muted text-sm mt-0.5 font-mono-code flex items-center gap-1.5">
                <Clock size={13} /> {now} · All systems nominal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-green">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                Secure
              </span>
              <span className="badge-blue">
                <Eye size={11} /> Monitoring
              </span>
            </div>
          </div>

          {/* Alert banners */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((a) => (
                <AlertBanner
                  key={a.id}
                  type={a.type}
                  title={a.title}
                  message={a.message}
                  onDismiss={() => dismissAlert(a.id)}
                />
              ))}
            </div>
          )}

          {/* Stats cards */}
          {loadingStats ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner message="Loading analytics…" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <SecurityCard
                icon={<Users size={20} />}
                label="Total Users"
                value={stats?.totalUsers ?? '—'}
                sub="Registered accounts"
                accent="blue"
                trend="↑ 8%"
                trendUp
              />
              <SecurityCard
                icon={<ShieldAlert size={20} />}
                label="Failed Logins"
                value={stats?.failedLogins ?? '—'}
                sub="Last 24 hours"
                accent="red"
                trend="↑ 23%"
                trendUp={false}
              />
              <SecurityCard
                icon={<LogIn size={20} />}
                label="Locked Accounts"
                value={stats?.lockedAccounts ?? '—'}
                sub="Require manual review"
                accent="yellow"
              />
              <SecurityCard
                icon={<Activity size={20} />}
                label="Active Sessions"
                value={stats?.activeSessions ?? '—'}
                sub="Currently authenticated"
                accent="green"
                trend="↑ 4%"
                trendUp
              />
            </div>
          )}

          {/* Login activity table */}
          <div className="glass-card border border-cyber-border/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-cyber-blue" />
                <h2 className="text-base font-semibold text-cyber-bright">Recent Login Activity</h2>
              </div>
              <span className="badge-blue text-xs font-mono-code">Live Feed</span>
            </div>
            <LoginActivityTable activities={activity} loading={loadingActivity} />
          </div>

        </main>
      </div>
    </div>
  );
}
