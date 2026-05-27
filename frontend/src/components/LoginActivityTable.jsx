import React from 'react';
import { Monitor, Smartphone, Globe, CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * LoginActivityTable
 * Displays a list of recent login events.
 *
 * Props:
 *   activities — array of activity objects (see shape below)
 *   loading    — boolean
 *
 * Activity shape:
 * {
 *   id:        string | number,
 *   user:      string,
 *   ip:        string,
 *   location:  string,
 *   device:    'desktop' | 'mobile' | 'unknown',
 *   status:    'success' | 'failed' | 'pending',
 *   timestamp: string,
 * }
 */
export default function LoginActivityTable({ activities = [], loading = false }) {
  const deviceIcon = (device) => {
    if (device === 'desktop') return <Monitor size={14} className="text-cyber-blue" />;
    if (device === 'mobile')  return <Smartphone size={14} className="text-cyber-accent" />;
    return <Globe size={14} className="text-cyber-muted" />;
  };

  const statusBadge = (status) => {
    if (status === 'success')
      return <span className="badge-green"><CheckCircle size={10} /> Success</span>;
    if (status === 'failed')
      return <span className="badge-red"><XCircle size={10} /> Failed</span>;
    return <span className="badge-yellow"><Clock size={10} /> Pending</span>;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-cyber-surface/60 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-10 text-cyber-muted">
        <Globe size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No login activity recorded.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyber-border/50">
            {['User', 'IP Address', 'Location', 'Device', 'Status', 'Time'].map((h) => (
              <th
                key={h}
                className="pb-3 pr-4 text-left text-xs font-semibold text-cyber-muted tracking-widest uppercase font-mono-code"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cyber-border/30">
          {activities.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-cyber-blue/5 transition-colors duration-150"
            >
              <td className="py-3 pr-4 text-cyber-bright font-medium">{a.user}</td>
              <td className="py-3 pr-4 font-mono-code text-cyber-blue text-xs">{a.ip}</td>
              <td className="py-3 pr-4 text-cyber-text">{a.location}</td>
              <td className="py-3 pr-4">
                <span className="flex items-center gap-1.5">
                  {deviceIcon(a.device)}
                  <span className="text-cyber-muted capitalize">{a.device}</span>
                </span>
              </td>
              <td className="py-3 pr-4">{statusBadge(a.status)}</td>
              <td className="py-3 text-cyber-muted text-xs font-mono-code whitespace-nowrap">{a.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
