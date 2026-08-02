import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiVideoCamera, HiUserGroup, HiDownload, HiSearch, HiSparkles, HiChevronRight } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function MeetingHistory() {
  const { meetings, users } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const canViewAttendance = ['hr', 'admin', 'manager'].includes(user?.role);

  const filtered = meetings
    .filter((m) => {
      const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase()) || m.meetingId?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all'
        || filterStatus === 'ended'
          ? ['ended', 'completed'].includes(m.status)
          : m.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'duration') return (b.duration || 0) - (a.duration || 0);
      return 0;
    });

  const stats = {
    total: meetings.length,
    live: meetings.filter((m) => m.status === 'live').length,
    ended: meetings.filter((m) => m.status === 'ended' || m.status === 'completed').length,
    upcoming: meetings.filter((m) => m.status === 'upcoming').length,
    totalDuration: meetings.reduce((sum, m) => sum + (m.duration || 0), 0),
  };

  const statusBadgeVariant = (status) => {
    if (status === 'live') return 'success';
    if (status === 'ended' || status === 'completed') return 'default';
    if (status === 'upcoming') return 'info';
    if (status === 'pending_approval') return 'warning';
    if (status === 'cancelled') return 'danger';
    return 'primary';
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Meeting History - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting History</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Past meetings, recordings, and attendance records</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500 dark:text-slate-400">Total Meetings</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 dark:text-slate-400">Live</p><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.live}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 dark:text-slate-400">Ended</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ended}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 dark:text-slate-400">Total Duration</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDuration}m</p></Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <Input placeholder="Search meetings..." value={search} onChange={(e) => setSearch(e.target.value)} icon={HiSearch} className="max-w-xs" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="all">All Status</option>
          <option value="live">Live</option>
          <option value="ended">Ended / Completed</option>
          <option value="upcoming">Upcoming</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="date">Sort by Date</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Meeting</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Duration</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Host</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => navigate(`/app/meeting/${m.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <HiVideoCamera className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(m.status)} size="sm">{m.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{m.date || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{m.duration || 0}m</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{users.find(u => u.id === m.host)?.name || m.host}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="xs" icon={HiDownload} onClick={() => navigate('/app/recordings')}>Recording</Button>
                      {canViewAttendance && <Button variant="ghost" size="xs" icon={HiUserGroup} onClick={() => navigate('/app/attendance')}>Attendance</Button>}
                      <Button variant="ghost" size="xs" icon={HiSparkles} onClick={() => navigate(`/app/meeting/${m.id}/intelligence`)}>Insights</Button>
                      <Button variant="ghost" size="xs" icon={HiChevronRight} onClick={() => navigate(`/app/meeting/${m.id}`)}>Details</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">No meetings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}