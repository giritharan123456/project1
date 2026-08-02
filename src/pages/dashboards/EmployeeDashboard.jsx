import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiCalendar, HiClock, HiUserGroup,
  HiCheckCircle, HiChartBar, HiStar,
  HiPlusCircle, HiViewGrid,
  HiArrowSmUp, HiArrowSmDown, HiDownload, HiOfficeBuilding,
  HiSparkles, HiUpload, HiDocument,
  HiQuestionMarkCircle, HiBadgeCheck, HiExclamationCircle,
  HiFolder, HiSearch, HiBell, HiChat, HiUsers, HiFilm,
  HiDocumentText, HiUser, HiCog, HiLogout, HiLightningBolt,
  HiExternalLink, HiChevronRight, HiClipboardCheck,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import AreaChartCard from '../../components/charts/AreaChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import ActivityFeed from '../../components/common/ActivityFeed';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import TodayBriefing from '../../components/dashboard/TodayBriefing';
import DashboardCalendarWidget from '../../components/dashboard/DashboardCalendarWidget';
import TaskListWidget from '../../components/dashboard/TaskListWidget';
import NotificationCenter from '../../components/common/NotificationCenter';
import MeetingCountdown from '../../components/dashboard/MeetingCountdown';
import SmartMeetingRecommendation from '../../components/meeting/SmartMeetingRecommendation';
import { generateMeetingInsights } from '../../utils/meetingInsights';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};



const formatMeetingTime = (t) => {
  if (!t) return '—';
  const parts = String(t).split(':');
  if (parts.length < 2) return t;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${m} ${ampm}`;
};

const formatMeetingDate = (d) => {
  if (!d) return '—';
  const today = new Date().toISOString().split('T')[0];
  if (d === today) return 'Today';
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (d === tomorrow) return 'Tomorrow';
  return new Date(`${d}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const relativeTime = (iso) => {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const recentActivityIconForType = (type) => {
  switch (type) {
    case 'meeting': return HiVideoCamera;
    case 'attendance': return HiCheckCircle;
    case 'task': return HiStar;
    case 'message': return HiOfficeBuilding;
    case 'report': return HiDocument;
    case 'notification':
    case 'announcement': return HiSparkles;
    case 'approval': return HiBadgeCheck;
    case 'registration': return HiUserGroup;
    default: return HiClock;
  }
};

let loginActivityLogged = false;

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [meetingRsvps, setMeetingRsvps] = useState({});
  const [qaQuestions, setQaQuestions] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-qa-questions');
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
    return [
      { id: 'q-seed-1', question: 'What is the ETA for the dashboard redesign?', status: 'answered', answer: 'Targeting next sprint — full details in the Product Roadmap doc.', time: '2026-07-29T14:00:00.000Z' },
      { id: 'q-seed-2', question: 'Can I get access to the analytics workspace?', status: 'pending', answer: '', time: '2026-07-30T10:30:00.000Z' },
    ];
  });
  const [showQaModal, setShowQaModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [sharedFiles, setSharedFiles] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-shared-files');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const newFile = {
      id: `f${Date.now()}`,
      name: file.name,
      size: sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`,
      uploadedAt: new Date().toLocaleString(),
      uploadedBy: user?.name || 'You',
    };
    setSharedFiles(prev => [newFile, ...prev]);
    addActivityLog({
      type: 'file',
      action: `File uploaded: ${file.name}`,
      user: user?.name || 'You',
      role: 'employee',
    });
    broadcastNotification({
      title: 'File shared',
      message: `"${file.name}" was shared by ${user?.name || 'You'}`,
      type: 'file_shared',
      sender: user?.name || 'You',
      senderRole: 'employee',
      targetRoles: ['host', 'manager'],
      link: '/app/files',
    });
    toast.success(`"${file.name}" uploaded successfully`);
  };
  const { user } = useAuth();
  const { logout } = useAuth();
  const { addActivityLog, broadcastNotification } = useApp();
  const { recordings, reports } = useApp();
  const [dashboardSearch, setDashboardSearch] = useState('');
  const { dashboardMetrics, createInstantMeeting, markNotificationRead, markAllNotificationsRead, userNotifications, unreadNotifications, meetings, attendanceRecords, users, activityLog, tasks, messages, respondToInvitation } = useApp();
  const navigate = useNavigate();

  const upcomingMeetings = useMemo(() => {
    return meetings
      .filter(m => (m.participants?.includes(user?.id) || m.host === user?.id) && ['live', 'upcoming'].includes(m.status))
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 4)
      .map(m => ({
        id: m.id,
        title: m.title,
        date: formatMeetingDate(m.date),
        time: formatMeetingTime(m.time),
        attendees: m.participants?.length || 0,
        host: users.find(u => u.id === m.host)?.name || 'Host',
      }));
  }, [meetings, user, users]);

  const recentActivity = useMemo(() => {
    return activityLog.slice(0, 5).map(entry => ({
      id: entry.id,
      action: entry.action || 'System event',
      target: entry.type || 'system',
      time: relativeTime(entry.timestamp),
      icon: recentActivityIconForType(entry.type),
      color: 'text-emerald-500',
    }));
  }, [activityLog]);

  const teamMembers = useMemo(() => {
    return users.filter(u => u.id !== user?.id).slice(0, 5).map(u => ({
      id: u.id,
      name: u.name,
      status: u.status === 'online' ? 'online' : u.status === 'away' ? 'away' : 'busy',
      role: u.title || u.role,
    }));
  }, [users, user]);

  const weeklyAttendance = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const userRecords = attendanceRecords.filter(r => r.userId === user?.id);
    if (userRecords.length > 0) {
      userRecords.forEach(r => {
        const d = new Date(r.joinTime);
        if (!Number.isNaN(d.getTime())) counts[d.getDay()] += 1;
      });
    } else {
      meetings
        .filter(m => m.participants?.includes(user?.id))
        .forEach(m => {
          const d = new Date(`${m.date}T${m.time || '00:00'}`);
          if (!Number.isNaN(d.getTime())) counts[d.getDay()] += 1;
        });
    }
    return days.map((label, i) => ({ label, value: counts[i] }));
  }, [attendanceRecords, meetings, user]);

  const taskDistribution = useMemo(() => {
    const categories = [
      { label: 'Design Tasks', tags: ['design'] },
      { label: 'Meetings', tags: ['meeting'] },
      { label: 'Development', tags: ['code', 'report', 'engineering'] },
      { label: 'Documentation', tags: ['docs', 'documentation'] },
      { label: 'Reviews', tags: ['review'] },
      { label: 'Email', tags: ['email'] },
    ];
    return categories
      .map(c => ({ label: c.label, value: tasks.filter(t => t.tags?.some(tag => c.tags.includes(tag.toLowerCase()))).length }))
      .filter(c => c.value > 0);
  }, [tasks]);

  // Sync qaQuestions to localStorage
  useEffect(() => {
    try { localStorage.setItem('connectly-qa-questions', JSON.stringify(qaQuestions)); } catch {}
  }, [qaQuestions]);

  // Sync sharedFiles to localStorage
  useEffect(() => {
    try { localStorage.setItem('connectly-shared-files', JSON.stringify(sharedFiles)); } catch {}
  }, [sharedFiles]);

  // Compute next upcoming meeting for the current user (nearest future one)
  const nextMeeting = useMemo(() => {
    const now = Date.now();
    return meetings
      .filter(m => m.participants?.includes(user?.id))
      .map(m => ({ meeting: m, target: new Date(`${m.date}T${m.time || '00:00'}`).getTime() }))
      .filter(m => !Number.isNaN(m.target))
      .sort((a, b) => a.target - b.target)
      .find(m => m.target >= now)?.meeting || null;
  }, [meetings, user]);

  // Any meeting in progress for the current user (used by the My Day fallback)
  const liveMeeting = useMemo(() => {
    return meetings.find(m => m.status === 'live' && m.participants?.includes(user?.id)) || null;
  }, [meetings, user]);

  // Compute attendance summary for current user
  const attendanceSummary = useMemo(() => {
    const userRecords = attendanceRecords.filter(r => r.userId === user?.id);
    const total = userRecords.length;
    const avgDuration = total > 0 ? Math.round(userRecords.reduce((s, r) => s + (r.duration || 0), 0) / total) : 0;
    const present = userRecords.filter(r => r.status === 'present').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, avgDuration, rate };
  }, [attendanceRecords, user]);

  const handleRsvp = (meetingId, status) => {
    setMeetingRsvps(prev => ({ ...prev, [meetingId]: status }));
    respondToInvitation(meetingId, status);
    toast.success(status === 'accepted' ? 'Meeting accepted — added to your calendar' : 'Meeting declined');
  };

  const pendingTaskCount = useMemo(() => tasks.filter(t => !t.completed && (t.assignedTo === user?.email || t.assignedTo === user?.id || t.assignedTo === 'You')).length, [tasks, user]);
  const myCompletedTasks = useMemo(() => tasks.filter(t => t.completed && (t.assignedTo === user?.email || t.assignedTo === user?.id || t.assignedTo === 'You')).length, [tasks, user]);
  const myMeetingsCount = useMemo(() => meetings.filter(m => m.participants?.includes(user?.id)).length, [meetings, user]);
  const myMessagesCount = useMemo(() => (Array.isArray(messages) ? messages.filter(m => m.from === user?.id).length : 0), [messages, user]);
  const myAttendanceRate = attendanceSummary.rate > 0 ? `${attendanceSummary.rate}%` : `${dashboardMetrics.avgAttendance}%`;
  const myFilesCount = sharedFiles.length;
  const recordingsCount = recordings.length;
  const reportsCount = reports.length || dashboardMetrics.reportsGenerated;

  // Latest completed meeting (for the current user) + AI insights derived from real meeting chat
  const aiSummary = useMemo(() => {
    const completed = meetings
      .filter(m => m.participants?.includes(user?.id) && ['ended', 'completed'].includes(m.status))
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));
    if (completed.length === 0) return null;
    const meeting = completed[0];
    return { meeting, insights: generateMeetingInsights(meeting, users, attendanceRecords) };
  }, [meetings, users, attendanceRecords, user]);

  const aiActionItems = aiSummary?.insights?.actionItems || [];

  const notifLink = (n) => {
    if (!n?.link) return null;
    return n.link.startsWith('/app') ? n.link : `/app${n.link}`;
  };

  const handleLogout = () => {
    toast.success('Signed out. See you soon!');
    logout();
    navigate('/auth/login');
  };

  const handleDashboardSearch = (e) => {
    e.preventDefault();
    navigate(`/app/search?q=${encodeURIComponent(dashboardSearch.trim())}`);
  };

  useEffect(() => {
    if (user && !loginActivityLogged) {
      loginActivityLogged = true;
      addActivityLog({ type: 'registration', action: `${user.name} signed in to the employee portal`, user: user.name, role: 'employee' });
    }
  }, [user, addActivityLog]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6" role="status" aria-label="Loading dashboard">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton variant="circle" width="3rem" height="3rem" />
          <div className="space-y-2">
            <Skeleton variant="text" width="12rem" />
            <Skeleton variant="text" width="8rem" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <span className="sr-only">Loading complete</span>
      </div>
    );
  }
  const statCards = [
    { label: 'Meetings This Week', value: `${myMeetingsCount || dashboardMetrics.meetingsThisWeek}`, icon: HiVideoCamera, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', change: '+12%', up: true, to: '/app/meetings' },
    { label: 'Messages Sent', value: `${myMessagesCount || dashboardMetrics.messagesSent}`, icon: HiClock, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10', change: '+8%', up: true, to: '/app/chat' },
    { label: 'Attendance Rate', value: myAttendanceRate, icon: HiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', change: '+3%', up: true, to: '/app/analytics/personal' },
    { label: 'Tasks Completed', value: `${myCompletedTasks || dashboardMetrics.tasksCompleted}`, icon: HiChartBar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', change: '+2%', up: true, to: '/app/tasks' },
  ];

  const handleStartMeeting = () => {
    if (meetings.filter(m => m.host === user.id && m.status === 'live').length >= 2) {
      toast.error('Maximum concurrent live meetings limit reached (2)');
      return;
    }
    const meeting = createInstantMeeting({ id: user.id, role: user.role });
    toast.success('Meeting started and broadcast to all users!');
    if (meeting) navigate(`/app/meeting/lobby/${meeting.id}`);
  };

  return (
    <>
    <Helmet>
      <title>Employee Dashboard - AdzConnect</title>
      <meta name="description" content="Your AdzConnect employee dashboard with meeting overview, upcoming meetings, and recent activity." />
    </Helmet>
    <ErrorBoundary title="Dashboard Error" message="Failed to load dashboard content. Please try again.">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
        <WelcomeBanner user={user} role="Employee" />
        <form onSubmit={handleDashboardSearch} className="w-full max-w-md order-last lg:order-none" role="search" aria-label="Search workspace">
          <div className="relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="search"
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              placeholder="Search meetings, people, files, reports..."
              aria-label="Search the workspace"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>
        <NotificationCenter
          notifications={userNotifications}
          unreadCount={unreadNotifications}
          onMarkRead={markAllNotificationsRead}
          onMarkReadOne={markNotificationRead}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(stat.to)}>
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.up ? <HiArrowSmUp className="w-3 h-3" /> : <HiArrowSmDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <TodayBriefing metrics={dashboardMetrics} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <HiClipboardCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Priorities</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Pending Tasks', value: pendingTaskCount || dashboardMetrics.tasksPending || 7, icon: HiClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', to: '/app/tasks', sub: 'View task list' },
            { label: 'Unread Notifications', value: unreadNotifications || 5, icon: HiBell, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', to: '/app/notifications', sub: 'Needs your attention' },
            { label: 'Meetings This Week', value: dashboardMetrics.meetingsThisWeek || upcomingMeetings.length || 8, icon: HiVideoCamera, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', to: '/app/meetings', sub: 'View my meetings' },
            { label: 'My Files', value: myFilesCount || dashboardMetrics.filesCount || 12, icon: HiDocument, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', to: '/app/files', sub: 'Shared & recent files' },
            { label: 'My Reports', value: reportsCount || dashboardMetrics.reportsGenerated || 45, icon: HiDocumentText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', to: '/app/analytics/personal', sub: 'My analytics & reports' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.to)}>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${item.bg}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <HiChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{item.label}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{item.sub}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <HiViewGrid className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Workspace</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Team Chat', sub: 'Message teammates', icon: HiChat, to: '/app/chat' },
            { label: 'Team Directory', sub: 'Find colleagues', icon: HiUsers, to: '/app/team' },
            { label: 'Meeting Recordings', sub: `${recordingsCount} available`, icon: HiFilm, to: '/app/recordings' },
            { label: 'Meeting History', sub: 'Past meetings', icon: HiClock, to: '/app/meeting-history' },
            { label: 'Personal Analytics', sub: 'My performance', icon: HiChartBar, to: '/app/analytics/personal' },
            { label: 'AI Assistant', sub: 'Summaries & insights', icon: HiLightningBolt, to: '/app/ai' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.to)}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{item.sub}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <div className="space-y-6">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2">
            <HiClock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">My Day</h2>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {nextMeeting ? (
              <div onClick={() => navigate('/app/calendar')} className="cursor-pointer">
                <MeetingCountdown targetDate={nextMeeting.date} targetTime={nextMeeting.time} label={`Next: ${nextMeeting.title}`} />
              </div>
            ) : liveMeeting ? (
              <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/app/meeting/lobby/${liveMeeting.id}`)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-wide opacity-90">Live now</span>
                </div>
                <p className="text-sm font-semibold truncate">{liveMeeting.title}</p>
                <p className="text-xs opacity-90 mt-1">Join the meeting that's currently in progress.</p>
                <Button variant="secondary" size="xs" className="mt-3" icon={HiVideoCamera} onClick={() => navigate(`/app/meeting/lobby/${liveMeeting.id}`)}>Join</Button>
              </Card>
            ) : (
              <Card className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/app/calendar')}>
                <div className="flex items-center gap-2 mb-2">
                  <HiCalendar className="w-4 h-4" />
                  <span className="text-xs font-medium opacity-90">My Day</span>
                </div>
                <p className="text-sm opacity-90">No upcoming meetings scheduled. Tap to check your calendar or schedule a new meeting.</p>
              </Card>
            )}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="primary" fullWidth icon={HiVideoCamera} size="md" onClick={handleStartMeeting}>Start Meeting</Button>
                <Button variant="outline" fullWidth icon={HiPlusCircle} size="md" onClick={() => navigate('/app/join')}>Join Meeting</Button>
                <Button variant="secondary" fullWidth icon={HiCalendar} size="md" onClick={() => navigate('/app/calendar')}>View Schedule</Button>
                <Button variant="ghost" fullWidth icon={HiQuestionMarkCircle} size="md" onClick={() => setShowQaModal(true)}>Ask Host a Question</Button>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/analytics/personal')}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Attendance</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{attendanceSummary.total}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Meetings</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{attendanceSummary.avgDuration}m</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Avg Duration</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{attendanceSummary.rate}%</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Rate</p>
                </div>
              </div>
            </Card>
            <TaskListWidget />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
              <Button variant="ghost" size="sm" icon={HiViewGrid} onClick={() => navigate('/app/meetings')}>View All</Button>
            </div>
            <div className="space-y-3">
               {upcomingMeetings.map((meeting, idx) => (
                 <motion.div
                   key={meeting.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   onClick={() => navigate(`/app/meeting/${meeting.id}`)}
                   className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                 >
                   <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                     <HiVideoCamera className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-gray-900 dark:text-white truncate">{meeting.title}</p>
                     <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                       <span className="flex items-center gap-1"><HiCalendar className="w-3 h-3" />{meeting.date}</span>
                       <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{meeting.time}</span>
                       <span className="flex items-center gap-1"><HiUserGroup className="w-3 h-3" />{meeting.attendees}</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <Badge variant="primary" size="sm">{meeting.host}</Badge>
                     {!meetingRsvps[meeting.id] ? (
                       <div className="flex gap-1">
                         <button onClick={(e) => { e.stopPropagation(); handleRsvp(meeting.id, 'accepted'); }} className="px-2 py-1 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors" aria-label={`Accept ${meeting.title}`}>Accept</button>
                         <button onClick={(e) => { e.stopPropagation(); handleRsvp(meeting.id, 'declined'); }} className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors" aria-label={`Decline ${meeting.title}`}>Decline</button>
                       </div>
                     ) : (
                       <Badge variant={meetingRsvps[meeting.id] === 'accepted' ? 'success' : 'danger'} size="sm">
                         {meetingRsvps[meeting.id] === 'accepted' ? 'Accepted' : 'Declined'}
                       </Badge>
                     )}
                     <Button variant="primary" size="xs" icon={HiVideoCamera} className={meetingRsvps[meeting.id] === 'declined' ? 'opacity-30 pointer-events-none' : ''} onClick={(e) => { e.stopPropagation(); navigate(`/app/meeting/lobby/${meeting.id}`); }}>Join</Button>
                   </div>
                 </motion.div>
               ))}
               {upcomingMeetings.length === 0 && (
                 <div className="text-center py-4">
                   <p className="text-sm text-gray-400 dark:text-slate-500 mb-2">No upcoming meetings</p>
                   <div className="space-y-2">
                     <Card className="p-3 text-left cursor-pointer hover:shadow-md transition-colors" onClick={() => navigate('/app/meeting/m1')}>
                       <div className="flex items-center gap-3">
                         <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"><HiVideoCamera className="w-4 h-4" /></div>
                         <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 dark:text-white truncate">Weekly Engineering Standup</p><p className="text-xs text-gray-400 dark:text-slate-500">Today, 09:00</p></div>
                         <Badge variant="primary" size="sm">Live</Badge>
                       </div>
                     </Card>
                     <Card className="p-3 text-left cursor-pointer hover:shadow-md transition-colors" onClick={() => navigate('/app/meeting/m2')}>
                       <div className="flex items-center gap-3">
                         <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"><HiVideoCamera className="w-4 h-4" /></div>
                         <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 dark:text-white truncate">Product Strategy Q3 Planning</p><p className="text-xs text-gray-400 dark:text-slate-500">Today, 14:00</p></div>
                         <Badge variant="warning" size="sm">Upcoming</Badge>
                       </div>
                     </Card>
                   </div>
                 </div>
               )}
            </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/meeting-history')}>View All</Button>
            </div>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-700" />
              <div className="space-y-4">
                 {recentActivity.map((activity, idx) => (
                   <motion.div
                     key={activity.id}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: idx * 0.05 }}
                     className="flex items-start gap-4 relative"
                   >
                     <div className={`p-1.5 rounded-full bg-white dark:bg-slate-800 ring-2 ring-gray-200 dark:ring-slate-700 z-10 ${activity.color}`}>
                       <activity.icon className="w-4 h-4" />
                     </div>
                     <div className="flex-1 min-w-0 pt-0.5">
                       <p className="text-sm text-gray-900 dark:text-white">
                         <span className="font-medium">{activity.action}</span>{' '}
                         <span className="text-gray-500 dark:text-slate-400">{activity.target}</span>
                       </p>
                       <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{activity.time}</p>
                     </div>
                   </motion.div>
                 ))}
                 {recentActivity.length === 0 && (
                   <div className="space-y-3">
                     <div className="flex items-start gap-4">
                       <div className="p-1.5 rounded-full bg-white dark:bg-slate-800 ring-2 ring-gray-200 dark:ring-slate-700 z-10 text-emerald-500"><HiCheckCircle className="w-4 h-4" /></div>
                       <div className="flex-1 min-w-0 pt-0.5">
                         <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Completed task</span>{' '}<span className="text-gray-500 dark:text-slate-400">Dashboard UI update</span></p>
                         <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Just now</p>
                       </div>
                     </div>
                     <div className="flex items-start gap-4">
                       <div className="p-1.5 rounded-full bg-white dark:bg-slate-800 ring-2 ring-gray-200 dark:ring-slate-700 z-10 text-blue-500"><HiChat className="w-4 h-4" /></div>
                       <div className="flex-1 min-w-0 pt-0.5">
                         <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Sent message</span>{' '}<span className="text-gray-500 dark:text-slate-400">Team Chat</span></p>
                         <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">5 min ago</p>
                       </div>
                     </div>
                     <div className="flex items-start gap-4">
                       <div className="p-1.5 rounded-full bg-white dark:bg-slate-800 ring-2 ring-gray-200 dark:ring-slate-700 z-10 text-violet-500"><HiVideoCamera className="w-4 h-4" /></div>
                       <div className="flex-1 min-w-0 pt-0.5">
                         <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Joined meeting</span>{' '}<span className="text-gray-500 dark:text-slate-400">Weekly Standup</span></p>
                         <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">1 hour ago</p>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </Card>

              <ActivityFeed />
            </div>
          </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2">
            <HiUserGroup className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">My Team</h2>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Online</h2>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} onClick={() => navigate(`/app/team?user=${member.id}`)} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Avatar name={member.name} size="sm" status={member.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-emerald-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'}`} />
                </div>
              ))}
            </div>
          </Card>

          <DashboardCalendarWidget />

          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2">
            <HiSparkles className="w-5 h-5 text-violet-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiLightningBolt className="w-5 h-5 text-violet-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
                </div>
                <Badge variant="primary" size="sm">Smart</Badge>
              </div>
            <div className="space-y-2">
              <button onClick={() => navigate(aiSummary?.meeting ? `/app/meeting/${aiSummary.meeting.id}/intelligence` : '/app/ai')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-500 shrink-0">
                  <HiDocumentText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">AI Meeting Summaries</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{aiSummary?.meeting ? `Latest: ${aiSummary.meeting.title}` : 'Key points from your meetings'}</p>
                </div>
                <HiExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
              </button>
              <button onClick={() => navigate('/app/ai')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-500 shrink-0">
                  <HiClipboardCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">AI Action Items</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{aiActionItems.length ? `${aiActionItems.length} action items from your recent meetings` : 'What to do after each meeting'}</p>
                </div>
                <HiExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
              </button>
              <button onClick={() => navigate('/app/ai')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-500 shrink-0">
                  <HiSparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">AI Insights & Recommendations</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Smarter ways to work</p>
                </div>
                <HiExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
              </button>
              {aiSummary?.insights?.ready && (
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10">
                  <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">AI SUMMARY — {aiSummary.meeting.title}</p>
                  <p className="text-xs text-violet-700/80 dark:text-violet-300/80 line-clamp-3">{aiSummary.insights.summary}</p>
                  {aiActionItems.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {aiActionItems.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs text-violet-700/80 dark:text-violet-300/80 flex items-start gap-1.5">
                          <HiCheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => navigate(`/app/meeting/${aiSummary.meeting.id}/intelligence`)} className="mt-2 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:underline">
                    View full summary →
                  </button>
                </div>
              )}
            </div>
          </Card>

            <Card>
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h2>
              </div>
              <SmartMeetingRecommendation />
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HiBell className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                </div>
              <div className="flex items-center gap-2">
                {unreadNotifications > 0 && <Badge variant="danger" size="sm">{unreadNotifications} unread</Badge>}
                <Button variant="ghost" size="xs" onClick={() => navigate('/app/notifications')}>View All</Button>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {userNotifications.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">You're all caught up</p>
              ) : (
                userNotifications.slice(0, 5).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      const link = notifLink(n);
                      if (link) navigate(link);
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-gray-300 dark:bg-slate-600' : n.priority === 'urgent' ? 'bg-rose-500' : n.priority === 'warning' ? 'bg-amber-500' : 'bg-primary-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{n.description}</p>
                      <p className={`text-xs mt-0.5 ${n.read ? 'text-gray-400 dark:text-slate-500' : 'text-primary-600 dark:text-primary-400'}`}>{relativeTime(n.time)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Questions</h2>
              {qaQuestions.length > 0 && <Badge variant="warning" size="sm">{qaQuestions.filter(q => q.status === 'pending').length} pending</Badge>}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {qaQuestions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400">No questions asked yet</p>
              ) : (
                qaQuestions.slice(-5).reverse().map((q) => (
                  <div key={q.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                    {q.status === 'answered' ? (
                      <HiBadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <HiExclamationCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{q.question}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="xs">{q.status}</Badge>
                        {q.answer && <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Answer: {q.answer}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2">
            <HiFolder className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Files & Reports</h2>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick File Upload</h2>
                <HiFolder className="w-5 h-5 text-amber-500" />
              </div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} aria-label="Choose a file to upload" />
            <Button variant="primary" fullWidth size="sm" icon={HiUpload} onClick={() => fileInputRef.current?.click()}>Upload File</Button>
            {sharedFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {sharedFiles.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                    <HiDocument className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{f.size} — {f.uploadedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </Card>
            <div onClick={() => navigate('/app/meetings')} className="cursor-pointer">
              <AreaChartCard
                data={weeklyAttendance}
                title="Weekly Meeting Attendance"
                badge="This Week"
                height={180}
              />
            </div>
            <div onClick={() => navigate('/app/tasks')} className="cursor-pointer">
              <DonutChartCard
                data={taskDistribution}
                title="Task Distribution"
                size={180}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Export your activity summary</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="primary" size="sm" icon={HiDownload} onClick={() => exportToCSV([...upcomingMeetings, { title: 'Meetings This Week', date: '-', time: '-', attendees: dashboardMetrics.meetingsThisWeek, host: 'System' }, { title: 'Messages Sent', date: '-', time: '-', attendees: dashboardMetrics.messagesSent, host: 'System' }, { title: 'Tasks Completed', date: '-', time: '-', attendees: dashboardMetrics.tasksCompleted, host: 'System' }, { title: 'Attendance Rate', date: '-', time: '-', attendees: `${dashboardMetrics.avgAttendance}%`, host: 'System' }], 'my-meetings.csv')}>Export CSV</Button>
              <Button variant="outline" size="sm" icon={HiDownload} onClick={() => exportToCSV([...recentActivity, { action: 'Meetings This Week', target: `${dashboardMetrics.meetingsThisWeek}`, time: 'System', icon: HiVideoCamera, color: 'text-emerald-500' }, { action: 'Messages Sent', target: `${dashboardMetrics.messagesSent}`, time: 'System', icon: HiCheckCircle, color: 'text-blue-500' }, { action: 'Tasks Completed', target: `${dashboardMetrics.tasksCompleted}`, time: 'System', icon: HiStar, color: 'text-amber-500' }, { action: 'Attendance Rate', target: `${dashboardMetrics.avgAttendance}%`, time: 'System', icon: HiVideoCamera, color: 'text-violet-500' }], 'my-activity.csv')}>Export Activity</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name} src={user?.avatar} size="lg" status="online" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Employee'}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{user?.title || user?.role || 'Employee'}{user?.department ? ` · ${user.department}` : ''}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" icon={HiUser} onClick={() => navigate('/app/profile')}>Profile</Button>
                <Button variant="secondary" size="sm" icon={HiCog} onClick={() => navigate('/app/settings')}>Settings</Button>
                <Button variant="ghost" size="sm" icon={HiQuestionMarkCircle} onClick={() => navigate('/app/help')}>Help Center</Button>
                <Button variant="danger" size="sm" icon={HiLogout} onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>

    <Modal isOpen={showQaModal} onClose={() => { setShowQaModal(false); setQuestionText(''); }} title="Ask the Host a Question" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Your Question</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question for the host..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
        <Button variant="secondary" size="sm" onClick={() => { setShowQaModal(false); setQuestionText(''); }}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={() => {
          if (!questionText.trim()) return;
          const newQ = {
            id: `q${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            employeeId: user?.id,
            employeeName: user?.name || 'Unknown',
            question: questionText.trim(),
            status: 'pending',
            answer: '',
            createdAt: new Date().toISOString(),
          };
          setQaQuestions(prev => [...prev, newQ]);
          toast.success('Your question has been sent to the host');
          setQuestionText('');
          setShowQaModal(false);
        }} disabled={!questionText.trim()}>Submit Question</Button>
      </div>
    </Modal>
    </ErrorBoundary>
    </>
  );
}
