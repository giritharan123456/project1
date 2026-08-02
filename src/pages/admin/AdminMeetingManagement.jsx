import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiVideoCamera, HiCalendar, HiClock, HiUserGroup, HiXCircle, HiStop, HiEye, HiSearch, HiFilter } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const statusBadgeVariant = {
  upcoming: 'info',
  live: 'success',
  ended: 'default',
  cancelled: 'danger',
  completed: 'default',
  pending_approval: 'warning',
  rejected: 'danger',
};

export default function AdminMeetingManagement() {
  const { meetings, setMeetings, users, broadcastNotification, addActivityLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return meetings.filter(m => {
      const q = search.toLowerCase();
      const host = users.find(u => u.id === m.host);
      const hostName = host?.name || m.host;
      const matchesSearch = !q || m.title.toLowerCase().includes(q) || hostName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [meetings, search, statusFilter, users]);

  const stats = useMemo(() => ({
    total: meetings.length,
    live: meetings.filter(m => m.status === 'live').length,
    upcoming: meetings.filter(m => m.status === 'upcoming').length,
    ended: meetings.filter(m => m.status === 'ended' || m.status === 'completed').length,
    pending: meetings.filter(m => m.status === 'pending_approval').length,
  }), [meetings]);

  const handleEnd = (meeting) => {
    setMeetings(prev => prev.map(m => (m.id === meeting.id || m.meetingId === meeting.meetingId) ? { ...m, status: 'ended' } : m));
    toast.success(`"${meeting.title}" ended`);
    addActivityLog({ type: 'meeting', action: `Meeting ended by admin: ${meeting.title}`, user: 'Admin', role: 'admin' });
    broadcastNotification({ title: 'Meeting ended', message: `"${meeting.title}" has been ended by admin`, type: 'info', sender: 'Admin', senderRole: 'admin', targetRoles: ['admin'] });
  };

  const handleCancel = (meeting) => {
    setMeetings(prev => prev.map(m => (m.id === meeting.id || m.meetingId === meeting.meetingId) ? { ...m, status: 'cancelled' } : m));
    toast.success(`"${meeting.title}" cancelled`);
    addActivityLog({ type: 'meeting', action: `Meeting cancelled by admin: ${meeting.title}`, user: 'Admin', role: 'admin' });
    broadcastNotification({ title: 'Meeting cancelled', message: `"${meeting.title}" has been cancelled by admin`, type: 'warning', sender: 'Admin', senderRole: 'admin', targetUser: meeting.host });
  };

  const getHostName = (hostId) => {
    const user = users.find(u => u.id === hostId);
    return user?.name || hostId;
  };

  const getParticipantCount = (meeting) => meeting.participants?.length || 0;

  const statuses = ['all', 'upcoming', 'live', 'ended', 'cancelled', 'pending_approval', 'rejected'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Meeting Management - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Oversee all meetings across the organization</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><HiVideoCamera className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p><p className="text-xs text-gray-500 dark:text-slate-400">Total Meetings</p></div>
          </div>
        </Card>
        <Card className="p-5 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><HiVideoCamera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.live}</p><p className="text-xs text-gray-500 dark:text-slate-400">Live Now</p></div>
          </div>
        </Card>
        <Card className="p-5 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><HiCalendar className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p><p className="text-xs text-gray-500 dark:text-slate-400">Upcoming</p></div>
          </div>
        </Card>
        <Card className="p-5 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><HiClock className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ended}</p><p className="text-xs text-gray-500 dark:text-slate-400">Ended</p></div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by title or host..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HiFilter className="w-4 h-4 text-gray-400" />
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Title</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Host</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Date</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Time</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Status</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Participants</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filtered.map((meeting) => (
                <motion.tr key={meeting.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{meeting.title}</p>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-slate-400">{getHostName(meeting.host)}</td>
                  <td className="p-4 text-gray-600 dark:text-slate-400">{meeting.date}</td>
                  <td className="p-4 text-gray-600 dark:text-slate-400">{meeting.time}</td>
                  <td className="p-4">
                    <Badge variant={statusBadgeVariant[meeting.status] || 'default'} size="sm">{meeting.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <HiUserGroup className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-slate-400">{getParticipantCount(meeting)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(meeting.status === 'live' || meeting.status === 'upcoming') && (
                        <Button variant="danger" size="xs" icon={meeting.status === 'live' ? HiStop : HiXCircle}
                          onClick={() => meeting.status === 'live' ? handleEnd(meeting) : handleCancel(meeting)}>
                          {meeting.status === 'live' ? 'End' : 'Cancel'}
                        </Button>
                      )}
                      <Button variant="ghost" size="xs" icon={HiEye} onClick={() => navigate(`/app/meeting/${meeting.id}`)}>View</Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 dark:text-slate-500">
                    <HiVideoCamera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No meetings found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
