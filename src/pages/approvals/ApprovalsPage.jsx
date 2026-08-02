import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiFlag, HiUser, HiOfficeBuilding, HiCalendar, HiVideoCamera } from 'react-icons/hi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const initialApprovals = [
  { id: 1, requester: 'Emily Davis', type: 'Time Off', details: 'Aug 15 - Aug 22 (7 days)', date: 'Today', status: 'pending', priority: 'high', department: 'Design' },
  { id: 2, requester: 'Alex Kim', type: 'Expense Reimbursement', details: '$1,200 - Team lunch venue', date: 'Today', status: 'pending', priority: 'medium', department: 'QA' },
  { id: 3, requester: 'Sarah Chen', type: 'Budget Allocation', details: '$5,000 for Q3 hiring', date: 'Yesterday', status: 'pending', priority: 'high', department: 'PM' },
  { id: 4, requester: 'John Park', type: 'Time Off', details: 'Sep 1 - Sep 5 (4 days)', date: '2 days ago', status: 'approved', priority: 'low', department: 'Engineering' },
  { id: 5, requester: 'Maria Lopez', type: 'Equipment Request', details: 'MacBook Pro for new hire', date: '3 days ago', status: 'rejected', priority: 'medium', department: 'Design' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ApprovalsPage() {
  const { meetings, setMeetings, users, broadcastNotification, addActivityLog } = useApp();
  const [approvals, setApprovals] = useState(initialApprovals);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? approvals : approvals.filter((a) => a.status === filter);
  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  const handleApprove = (id) => {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' } : a));
    toast.success('Request approved');
  };

  const handleReject = (id) => {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a));
    toast.error('Request rejected');
  };

  const pendingMeetings = useMemo(() => meetings.filter(m => m.status === 'pending_approval'), [meetings]);

  const handleApproveMeeting = (meetingId) => {
    setMeetings(prev => prev.map(m =>
      (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: 'upcoming' } : m
    ));
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    toast.success(`"${meeting?.title}" approved`);
    if (meeting) {
      addActivityLog({ type: 'approval', action: `Meeting approved: ${meeting.title}`, user: 'Admin', role: 'admin' });
      broadcastNotification({ title: 'Meeting approved', message: `"${meeting.title}" has been approved`, type: 'success', sender: 'Admin', senderRole: 'admin', targetUser: meeting.host });
    }
  };

  const handleRejectMeeting = (meetingId) => {
    setMeetings(prev => prev.map(m =>
      (m.id === meetingId || m.meetingId === meetingId) ? { ...m, status: 'rejected' } : m
    ));
    const meeting = meetings.find(m => m.id === meetingId || m.meetingId === meetingId);
    toast.error(`"${meeting?.title}" rejected`);
    if (meeting) {
      addActivityLog({ type: 'approval', action: `Meeting rejected: ${meeting.title}`, user: 'Admin', role: 'admin' });
      broadcastNotification({ title: 'Meeting rejected', message: `"${meeting.title}" was not approved`, type: 'error', sender: 'Admin', senderRole: 'admin', targetUser: meeting.host });
    }
  };

  const getHostName = (hostId) => {
    const user = users.find(u => u.id === hostId);
    return user?.name || hostId;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Approvals - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage team approval requests</p>
        </div>
        <Badge variant="warning" size="lg" dot>{pendingCount} pending</Badge>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${approvals.length})` : `(${approvals.filter((a) => a.status === f).length})`}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        {filtered.map((a) => (
          <motion.div key={a.id} variants={itemVariants}
            className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/30 dark:to-violet-900/30 flex items-center justify-center shrink-0">
              <HiUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.requester}</p>
                <Badge variant={a.status === 'pending' ? 'warning' : a.status === 'approved' ? 'success' : 'danger'} size="xs">{a.status}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 truncate">{a.type}: {a.details}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-slate-500">
                <span className="flex items-center gap-1"><HiCalendar className="w-3 h-3" />{a.date}</span>
                <span className="flex items-center gap-1"><HiOfficeBuilding className="w-3 h-3" />{a.department}</span>
                {a.priority === 'high' && <span className="flex items-center gap-1 text-red-500"><HiFlag className="w-3 h-3" />High Priority</span>}
              </div>
            </div>
            {a.status === 'pending' && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="success" size="sm" icon={HiCheckCircle} onClick={() => handleApprove(a.id)}>Approve</Button>
                <Button variant="danger" size="sm" icon={HiXCircle} onClick={() => handleReject(a.id)}>Reject</Button>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {pendingMeetings.length > 0 && (
        <>
          <motion.div variants={itemVariants} className="pt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiVideoCamera className="w-5 h-5" /> Meeting Approvals
              <Badge variant="warning" size="sm">{pendingMeetings.length} pending</Badge>
            </h2>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-3">
            {pendingMeetings.map((meeting) => (
              <motion.div key={meeting.id} variants={itemVariants}
                className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                  <HiVideoCamera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{meeting.title}</p>
                    <Badge variant="warning" size="xs">pending approval</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
                    Host: {getHostName(meeting.host)} &middot; {meeting.date} at {meeting.time}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{meeting.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="success" size="sm" icon={HiCheckCircle} onClick={() => handleApproveMeeting(meeting.id)}>Approve</Button>
                  <Button variant="danger" size="sm" icon={HiXCircle} onClick={() => handleRejectMeeting(meeting.id)}>Reject</Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}