import React, { useState, useEffect } from 'react';
import {
  Users, ShieldAlert, Lock, Activity,
  AlertTriangle, RefreshCw, ChevronRight,
} from 'lucide-react';
import Navbar         from '../components/Navbar.jsx';
import Sidebar        from '../components/Sidebar.jsx';
import SecurityCard   from '../components/SecurityCard.jsx';
import AlertBanner    from '../components/AlertBanner.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { adminApi }   from '../services/api.js';

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_STATS = { totalUsers: 142, failedLogins: 18, lockedAccounts: 3, activeSessions: 57 };

const MOCK_LOGS = [
  { id: 1, event: 'LOGIN_FAILED',   user: 'attacker@evil.io',  ip: '203.0.113.42',  time: '14:32:01', severity: 'high' },
  { id: 2, event: 'ACCOUNT_LOCKED', user: 'bob@corp.io',       ip: '10.0.0.17',     time: '14:28:45', severity: 'medium' },
  { id: 3, event: 'LOGIN_SUCCESS',  user: 'alice@corp.io',     ip: '192.168.1.42',  time: '14:15:22', severity: 'low' },
  { id: 4, event: 'LOGIN_FAILED',   user: 'hacker@proxy.net',  ip: '198.51.100.7',  time: '13:55:10', severity: 'high' },
  { id: 5, event: 'LOGOUT',         user: 'diana@corp.io',     ip: '172.16.0.88',   time: '13:40:33', severity: 'low' },
  { id: 6, event: 'LOGIN_FAILED',   user: 'scan@botnet.ru',    ip: '198.51.100.99', time: '13:22:11', severity: 'critical' },
];

const MOCK_LOCKED = [
  { id: 1, username: 'bob@corp.io',        reason: 'Too many failed attempts', lockedAt: '2024-12-28 14:28:45' },
  { id: 2, username: 'frank@corp.io',      reason: 'Suspicious IP activity',   lockedAt: '2024-12-28 12:10:00' },
  { id: 3, username: 'grace@corp.io',      reason: 'Too many failed attempts', lockedAt: '2024-12-28 10:05:33' },
];

const SEVERITY_BADGE = {
  critical: 'badge-red',
  high:     'badge-red',
  medium:   'badge-yellow',
  low:      'badge-blue',
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebar] = useState(false);
  const [stats, setStats]         = useState(null);
  const [logs, setLogs]           = useState([]);
  const [locked, setLocked]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, logsRes, lockedRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getLogs(),
        adminApi.getLockedAccounts(),
      ]);
      setStats(statsRes.status === 'fulfilled'  ? statsRes.value.data  : MOCK_STATS);
      setLogs(logsRes.status === 'fulfilled'    ? (logsRes.value.data.logs || logsRes.value.data) : MOCK_LOGS);
      setLocked(lockedRes.status === 'fulfilled'? (lockedRes.value.data.accounts || lockedRes.value.data) : MOCK_LOCKED);
    } catch {
      setStats(MOCK_STATS);
      setLogs(MOCK_LOGS);
      setLocked(MOCK_LOCKED);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="flex h-screen bg-cyber-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebar(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebar((v) => !v)} sidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 space-y-6 animate-fade-in">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-bold text-cyber-bright">
                Admin <span className="neon-text">Control Panel</span>
              </h1>
              <p className="text-cyber-muted text-sm mt-0.5 font-mono-code">
                System-wide security analytics and management
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="btn-cyber gap-2 text-xs py-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Top alert */}
          <AlertBanner
            type="danger"
            title="6 High-Severity Events in the Last Hour"
            message="Immediate review recommended. Multiple brute-force attempts detected from external IPs."
          />

          {/* Stats cards */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner message="Loading admin data…" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <SecurityCard
                icon={<Users size={20} />}
                label="Total Users"
                value={stats?.totalUsers ?? '—'}
                sub="Registered accounts"
                accent="blue"
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
                icon={<Lock size={20} />}
                label="Locked Accounts"
                value={stats?.lockedAccounts ?? '—'}
                sub="Pending review"
                accent="yellow"
              />
              <SecurityCard
                icon={<Activity size={20} />}
                label="Active Sessions"
                value={stats?.activeSessions ?? '—'}
                sub="Currently authenticated"
                accent="green"
              />
            </div>
          )}

          {/* Two-column layout: logs + locked */}
          {!loading && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Security Event Logs — 2/3 width */}
              <div className="xl:col-span-2 glass-card border border-cyber-border/60 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle size={18} className="text-cyber-red" />
                  <h2 className="text-base font-semibold text-cyber-bright">Security Event Logs</h2>
                  <span className="ml-auto badge-red font-mono-code text-xs">
                    {logs.filter((l) => l.severity === 'high' || l.severity === 'critical').length} critical
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-cyber-border/50">
                        {['Event', 'User', 'IP', 'Time', 'Severity'].map((h) => (
                          <th key={h} className="pb-3 pr-4 text-left text-xs font-semibold text-cyber-muted tracking-widest uppercase font-mono-code">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border/30">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-cyber-blue/5 transition-colors">
                          <td className="py-3 pr-4 font-mono-code text-xs text-cyber-accent">{log.event}</td>
                          <td className="py-3 pr-4 text-cyber-text text-xs max-w-[140px] truncate">{log.user}</td>
                          <td className="py-3 pr-4 font-mono-code text-cyber-blue text-xs">{log.ip}</td>
                          <td className="py-3 pr-4 text-cyber-muted text-xs font-mono-code">{log.time}</td>
                          <td className="py-3">
                            <span className={SEVERITY_BADGE[log.severity] || 'badge-blue'}>
                              {log.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Locked Accounts — 1/3 width */}
              <div className="glass-card border border-cyber-yellow/30 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock size={18} className="text-cyber-yellow" />
                  <h2 className="text-base font-semibold text-cyber-bright">Locked Accounts</h2>
                </div>

                {locked.length === 0 ? (
                  <p className="text-center text-cyber-muted text-sm py-8">No locked accounts.</p>
                ) : (
                  <div className="space-y-3">
                    {locked.map((acc) => (
                      <div
                        key={acc.id}
                        className="rounded-lg border border-cyber-border/50 bg-cyber-surface/60 px-4 py-3
                                   hover:border-cyber-yellow/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-cyber-bright text-sm font-medium truncate">{acc.username}</p>
                          <ChevronRight size={14} className="text-cyber-muted flex-shrink-0" />
                        </div>
                        <p className="text-cyber-muted text-xs">{acc.reason}</p>
                        <p className="text-cyber-muted text-xs font-mono-code mt-1">{acc.lockedAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
