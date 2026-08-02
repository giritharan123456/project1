import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiUserGroup, HiChartBar, HiCheckCircle, HiClock, HiClipboardList, HiTrendingUp } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function EmployeePerformance() {
  const { users, meetings, tasks, attendanceRecords, dashboardMetrics } = useApp();
  const [sortField, setSortField] = useState('avgRating');
  const [sortDir, setSortDir] = useState('desc');

  const employees = useMemo(() => {
    return users.map(u => {
      const hosted = meetings.filter(m => m.host === u.id);
      const participated = meetings.filter(m => m.participants?.includes(u.id));
      const assigned = tasks.filter(t => t.assignedTo === u.id || t.assignedTo === u.name);
      const done = assigned.filter(t => t.status === 'done' || t.status === 'completed').length;
      const records = attendanceRecords.filter(r => r.userId === u.id);
      const rating = records.length
        ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 5 * 10) / 10
        : dashboardMetrics.teamSatisfaction || 4.7;
      return {
        id: u.id,
        name: u.name,
        role: u.title || u.role,
        avatar: u.avatar || '',
        attendeeCount: participated.length,
        meetingsLed: hosted.length,
        tasksCompleted: done,
        avgRating: rating,
        department: u.department || 'General',
      };
    });
  }, [users, meetings, tasks, attendanceRecords, dashboardMetrics.teamSatisfaction]);

  const attendanceRecordsAll = useMemo(() => attendanceRecords.filter(r => r.status === 'present').length, [attendanceRecords]);
  const attendanceRate = useMemo(() => {
    const total = attendanceRecords.length;
    if (!total) return 87;
    return Math.round((attendanceRecordsAll / total) * 100);
  }, [attendanceRecords, attendanceRecordsAll]);

  const tasksTotal = useMemo(() => employees.reduce((sum, e) => sum + e.tasksCompleted, 0), [employees]);
  const avgRating = useMemo(() => {
    if (!employees.length) return '4.7';
    return (employees.reduce((sum, e) => sum + e.avgRating, 0) / employees.length).toFixed(1);
  }, [employees]);

  const sorted = useMemo(() => {
    return [...employees].sort((a, b) => {
      const va = a[sortField] ?? 0;
      const vb = b[sortField] ?? 0;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [employees, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Employee Performance - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Performance</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Track meeting participation, task completion, and engagement metrics</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center"><HiUserGroup className="w-5 h-5 text-primary-600" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Avg Attendance Rate</p><p className="text-xl font-bold text-gray-900 dark:text-white">{attendanceRate}%</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"><HiCheckCircle className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Tasks Completed</p><p className="text-xl font-bold text-gray-900 dark:text-white">{tasksTotal}</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center"><HiTrendingUp className="w-5 h-5 text-violet-600" /></div><div><p className="text-xs text-gray-500 dark:text-slate-400">Avg Rating</p><p className="text-xl font-bold text-gray-900 dark:text-white">{avgRating}</p></div></div></Card>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" onClick={() => toggleSort('name')}>Employee {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" onClick={() => toggleSort('department')}>Dept {sortField === 'department' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" onClick={() => toggleSort('attendeeCount')}>Meetings {sortField === 'attendeeCount' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" onClick={() => toggleSort('tasksCompleted')}>Tasks {sortField === 'tasksCompleted' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400 cursor-pointer" onClick={() => toggleSort('avgRating')}>Rating {sortField === 'avgRating' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {sorted.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={emp.name} size="sm" /><div><p className="font-medium text-gray-900 dark:text-white text-sm">{emp.name}</p><p className="text-xs text-gray-500 dark:text-slate-400">{emp.role}</p></div></div></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{emp.department}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><HiClock className="w-4 h-4 text-gray-400" /><span className="text-gray-900 dark:text-white">{emp.attendeeCount}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><HiClipboardList className="w-4 h-4 text-gray-400" /><span className="text-gray-900 dark:text-white">{emp.tasksCompleted}</span></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><HiChartBar className="w-4 h-4 text-amber-400" /><span className="font-semibold text-gray-900 dark:text-white">{emp.avgRating}</span></div></td>
                  <td className="px-4 py-3"><Badge variant="success" size="sm">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}