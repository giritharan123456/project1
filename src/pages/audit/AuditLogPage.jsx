import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiClock, HiDownload, HiSearch,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const auditLogs = Array.from({ length: 25 }, (_, i) => ({
  id: `evt-${1000 + i}`,
  user: ['Sarah Chen', 'Marcus Rivera', 'Emily Nakamura', 'Alex Johnson', 'Lisa Park'][i % 5],
  role: ['Admin', 'Host', 'Employee', 'Manager', 'Executive'][i % 5],
  action: ['User logged in', 'Meeting created', 'Settings changed', 'User invited', 'Recording deleted', 'Password changed', '2FA enabled', 'User deactivated', 'Permission updated', 'Meeting recorded'][i % 10],
  target: ['sarah@connectly.com', 'meeting-234', 'Security settings', 'john@example.com', 'recording-567', '-', '-', 'user-890', 'Admin role', 'meeting-123'][i % 10],
  timestamp: Date.now() - i * 3600000 - Math.random() * 3600000,
  severity: ['info', 'warning', 'critical', 'info', 'info'][i % 5],
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AuditLogPage() {
  const { activityLog, users } = useApp();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const logs = useMemo(() => {
    const mapped = activityLog.map((entry, i) => {
      const actor = users.find((u) => u.id === entry.user)?.name || entry.user;
      return {
        id: entry.id || `evt-ctx-${i}`,
        user: actor,
        role: entry.role || 'system',
        action: entry.action || entry.type || 'event',
        target: '—',
        timestamp: entry.timestamp,
        severity: 'info',
      };
    });
    return [...mapped, ...auditLogs];
  }, [activityLog, users]);

  const filtered = logs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return log.user.toLowerCase().includes(q) || log.action.toLowerCase().includes(q) || log.target.toLowerCase().includes(q);
    }
    return true;
  });

  const severityColor = { info: 'default', warning: 'warning', critical: 'danger' };

  const handleExport = () => {
    const rows = [
      ['Timestamp', 'User', 'Role', 'Action', 'Target', 'Severity'],
      ...filtered.map((log) => [formatTime(log.timestamp), log.user, log.role, log.action, log.target, log.severity]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported as CSV');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Helmet>
        <title>Audit Log - AdzConnect</title>
        <meta name="description" content="View and export security audit logs for your AdzConnect enterprise account." />
      </Helmet>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <HiClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Track all security events and administrative actions</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" icon={HiDownload} onClick={handleExport}>
          Export Logs
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} icon={HiSearch} />
            </div>
            <div className="flex gap-2">
              {['all', 'info', 'warning', 'critical'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    severityFilter === s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Target</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatTime(log.timestamp)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{log.user}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">({log.role})</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-700 dark:text-slate-300">{log.action}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-slate-400 font-mono">{log.target}</td>
                    <td className="py-3 px-3">
                      <Badge variant={severityColor[log.severity]} size="sm">{log.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 text-center">{filtered.length} events found</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}
