import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiSearch, HiDownload } from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import { useApp } from '../../context/AppContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const logTypes = ['notification', 'meeting', 'attendance', 'approval', 'registration', 'report', 'task', 'message', 'workspace', 'announcement', 'alert'];

export default function AccessLogs() {
  const { activityLog, users } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const logs = useMemo(() => {
    return activityLog.map((entry, i) => {
      const actor = users.find((u) => u.id === entry.user)?.name || entry.user;
      return {
        id: entry.id || i,
        user: actor,
        action: entry.action || entry.type || 'event',
        type: entry.type || 'system',
        role: entry.role || 'system',
        ip: '—',
        timestamp: new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'success',
      };
    });
  }, [activityLog, users]);

  const filtered = logs.filter((l) => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || l.type === filterType;
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Access Logs - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Logs</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Audit trail of all user actions and system events</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} icon={HiSearch} className="max-w-xs" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="all">All Actions</option>
          {logTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <Button variant="outline" size="sm" icon={HiDownload} onClick={() => { exportToCSV(filtered, 'access-logs.csv'); toast.success('Logs exported successfully'); }}>Export</Button>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">IP Address</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><HiUser className="w-4 h-4 text-gray-400" /><span className="font-medium text-gray-900 dark:text-white text-sm">{log.user}</span></div></td>
                  <td className="px-4 py-3"><Badge variant="info" size="sm">{log.action}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 capitalize">{log.role}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 font-mono text-xs">{log.ip}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">{log.timestamp}</td>
                  <td className="px-4 py-3"><Badge variant={log.status === 'success' ? 'success' : 'danger'} size="sm">{log.status}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">No logs found matching your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}