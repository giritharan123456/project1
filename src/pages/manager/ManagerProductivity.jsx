import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiChartBar, HiStar, HiTrendingUp, HiDownload } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { exportToCSV } from '../../utils/export';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ManagerProductivity() {
  const { users, tasks, getCurrentUser, dashboardMetrics } = useApp();
  const currentUser = getCurrentUser();
  const [filter, setFilter] = useState('all');

  const teamMembers = users
    .filter((u) => u.role === 'employee' || u.role === 'host')
    .map((u) => {
      const userTasks = tasks.filter((t) => t.assignedTo === u.name || (t.assignedTo === 'You' && u.id === currentUser?.id));
      const tasksTotal = userTasks.length;
      const tasksCompleted = userTasks.filter((t) => t.completed).length;
      const attended = u.meetingsAttended || 0;
      const hosted = u.meetingsHosted || 0;
      const participation = attended + hosted > 0 ? Math.round((attended / (attended + hosted)) * 100) : 0;
      return {
        name: u.name,
        status: u.status === 'online' ? 'active' : u.status === 'busy' ? 'busy' : 'away',
        tasksCompleted,
        tasksTotal,
        utilization: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : participation,
        rating: tasksTotal > 0 ? Math.round((2.5 + (2.5 * tasksCompleted) / tasksTotal) * 10) / 10 : 4.0,
        progress: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
      };
    });

  const filtered = filter === 'all' ? teamMembers : teamMembers.filter((m) => m.status === filter);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Team Productivity - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Productivity</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Track team output, utilization, and goal progress</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
            <option value="all">All Members</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
          </select>
          <Button variant="outline" size="sm" icon={HiDownload} onClick={() => exportToCSV(teamMembers, 'team-productivity.csv')}>Export</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardMetrics.tasksCompleted}</p><p className="text-xs text-gray-500 dark:text-slate-400">Tasks Completed</p><p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+12% this week</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardMetrics.productivity}%</p><p className="text-xs text-gray-500 dark:text-slate-400">Avg Utilization</p><p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Healthy</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardMetrics.teamSatisfaction}</p><p className="text-xs text-gray-500 dark:text-slate-400">Avg Rating</p><p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+0.2 vs last week</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{teamMembers.length}</p><p className="text-xs text-gray-500 dark:text-slate-400">Active Members</p><p className="text-xs text-gray-400 dark:text-slate-500 mt-1">All engaged</p></Card>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Member</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Tasks</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Utilization</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Rating</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.map((m) => (
                <tr key={m.name} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3"><span className="font-medium text-gray-900 dark:text-white">{m.name}</span></td>
                  <td className="px-4 py-3"><Badge variant={m.status === 'active' ? 'success' : 'warning'} size="sm">{m.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{m.tasksCompleted}/{m.tasksTotal}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${m.utilization}%` }} /></div><span className="text-xs text-gray-500 dark:text-slate-400">{m.utilization}%</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><HiStar className="w-3 h-3 text-amber-400" /><span className="font-semibold text-gray-900 dark:text-white">{m.rating}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs">{m.tasksTotal > 0 && m.tasksCompleted >= m.tasksTotal * 0.8 ? <HiTrendingUp className="w-3 h-3 text-emerald-500" /> : <HiChartBar className="w-3 h-3 text-amber-500" />} {m.progress}%</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}