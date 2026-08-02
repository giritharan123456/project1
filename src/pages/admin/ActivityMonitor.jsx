import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiFilter, HiDownload, HiRefresh, HiTrendingUp, HiServer, HiUsers, HiClock, HiChip, HiX } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const actionTypes = [
  'all', 'notification', 'meeting', 'attendance', 'approval',
  'registration', 'report', 'task', 'message', 'workspace',
];

const typeBadgeVariant = {
  notification: 'info',
  meeting: 'primary',
  attendance: 'success',
  approval: 'warning',
  registration: 'gradient-amber',
  report: 'gradient-emerald',
  task: 'default',
  message: 'info',
  workspace: 'primary',
};

const mockActions = {
  notification: ['System notification sent', 'New announcement published', 'Alert triggered'],
  meeting: ['Meeting started: Weekly Sync', 'Meeting ended: Sprint Review', 'Meeting scheduled: 1:1 with Manager'],
  attendance: ['Attendance recorded for standup', 'Attendance report generated', 'Late arrival logged'],
  approval: ['Admin approved registration', 'Admin rejected registration', 'Approval request submitted'],
  registration: ['New user registered', 'User re-registered', 'Pending registration updated'],
  report: ['Report generated: Monthly Analytics', 'Report exported: Q2 Summary', 'Scheduled report delivered'],
  task: ['Task created: Update documentation', 'Task completed: Review PR', 'Task assigned to team'],
  message: ['New message sent to #general', 'Direct message sent', 'Broadcast message delivered'],
  workspace: ['User joined workspace', 'Workspace settings updated', 'Workspace invitation sent'],
};

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ActivityMonitor() {
  const { activityLog, addActivityLog, dashboardMetrics, users } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const types = Object.keys(mockActions);
      const type = types[Math.floor(Math.random() * types.length)];
      const actions = mockActions[type];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const actor = users.length ? users[Math.floor(Math.random() * users.length)] : null;
      addActivityLog({ type, action, user: actor?.name || 'System', role: actor?.role || 'system' });
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, addActivityLog, users]);

  const filtered = useMemo(() => {
    return activityLog.filter((entry) => {
      const matchType = filterType === 'all' || entry.type === filterType;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (entry.user && entry.user.toLowerCase().includes(q)) ||
        (entry.action && entry.action.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [activityLog, filterType, search]);

  const healthCards = useMemo(() => [
    {
      label: 'CPU Usage',
      value: `${Math.min(100, Math.round(40 + Math.random() * 30))}%`,
      icon: HiChip,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/10',
      border: 'border-rose-200 dark:border-rose-800',
    },
    {
      label: 'Memory Usage',
      value: `${Math.min(100, Math.round(50 + Math.random() * 25))}%`,
      icon: HiServer,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/10',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      label: 'Active Sessions',
      value: dashboardMetrics.activeSessions,
      icon: HiUsers,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Response Time',
      value: `${dashboardMetrics.responseTime}ms`,
      icon: HiClock,
      color: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-900/10',
      border: 'border-sky-200 dark:border-sky-800',
    },
  ], [dashboardMetrics.activeSessions, dashboardMetrics.responseTime]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Activity Monitor - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Monitor</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Real-time system activity feed and health metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'primary' : 'outline'}
            size="sm"
            icon={HiRefresh}
            onClick={() => setAutoRefresh((p) => !p)}
          >
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" icon={HiDownload} onClick={() => {
            const logs = activityLog.length ? activityLog : [{ id: 1, type: 'system', action: 'No activity data', user: 'system', timestamp: new Date().toISOString() }];
            exportToCSV(logs, 'activity-logs.csv');
            toast.success('Activity logs exported');
          }}>
            Export
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthCards.map((card) => (
          <Card key={card.label} className={`p-4 ${card.bg} ${card.border}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <HiFilter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {actionTypes.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <Badge variant="default" size="md">{filtered.length} entries</Badge>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <HiClock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500 dark:text-slate-400 text-xs font-mono">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{entry.user}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300 text-sm max-w-[280px] truncate">
                    {entry.action}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={typeBadgeVariant[entry.type] || 'default'} size="sm">
                      {entry.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default" size="sm">{entry.role}</Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <HiTrendingUp className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                    <p className="text-gray-500 dark:text-slate-400">No activity entries found</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {activityLog.length === 0
                        ? 'Activity log is empty. Enable auto-refresh to generate mock entries.'
                        : 'Try adjusting your search or filter.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {filtered.length > 0 && (
        <motion.div variants={itemVariants} className="text-center text-xs text-gray-400 dark:text-slate-500">
          Showing {filtered.length} of {activityLog.length} total entries
        </motion.div>
      )}
    </motion.div>
  );
}
