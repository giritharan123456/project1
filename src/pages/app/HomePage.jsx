import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiPlus, HiLogin, HiCalendar, HiShare, HiClock,
  HiUsers, HiMicrophone, HiFolder, HiChat, HiDotsHorizontal, HiPlay,
  HiArrowRight, HiStar, HiLink, HiViewGrid, HiSpeakerphone, HiCheckCircle,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

// Reminder utilities
const REMINDER_STORAGE_KEY = 'connectly-meeting-reminders';

function getReminders() {
  try {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveReminders(reminders) {
  try { localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders)); } catch {}
}

function addReminder(meeting, remindAt) {
  const reminders = getReminders();
  const reminder = {
    id: `rem-${Date.now()}`,
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    meetingDate: meeting.date,
    meetingTime: meeting.time,
    remindAt: remindAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
  reminders.push(reminder);
  saveReminders(reminders);
}

function getDueReminders() {
  const now = new Date();
  return getReminders().filter(r => new Date(r.remindAt) <= now);
}

function clearDueReminders() {
  const now = new Date();
  const reminders = getReminders().filter(r => new Date(r.remindAt) > now);
  saveReminders(reminders);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const statusConfig = {
  live: { label: 'Live', variant: 'success', dot: true },
  upcoming: { label: 'Upcoming', variant: 'info', dot: false },
  completed: { label: 'Completed', variant: 'default', dot: false },
  ended: { label: 'Ended', variant: 'default', dot: false },
  pending_approval: { label: 'Pending Approval', variant: 'warning', dot: false },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTimeRange(start, duration) {
  const [h, m] = start.split(':').map(Number);
  const startDate = new Date(2026, 0, 1, h, m);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  const fmt = (date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(startDate)} - ${fmt(endDate)}`;
}

const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayStr = toDateKey(new Date());

const quickLinks = [
  { label: 'Calendar', icon: HiCalendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/app/calendar' },
  { label: 'Chat', icon: HiChat, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', href: '/app/chat' },
  { label: 'Files', icon: HiFolder, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', href: '/app/files' },
  { label: 'Recordings', icon: HiMicrophone, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/app/recordings' },
];

const motivationalMessages = [
  'Great teams are built on great conversations.',
  'Every meeting is an opportunity to inspire.',
  'Stay connected, stay productive.',
  'Your next big idea starts with a conversation.',
  'Collaboration is the key to innovation.',
];

export default function HomePage() {
  const navigate = useNavigate();
  const {
    meetings, users, getCurrentUser, createInstantMeeting,
    joinMeeting, scheduleMeeting, getWaitingUsers, activityLog, userNotifications,
  } = useApp();
  const currentUser = getCurrentUser();
  const isEmployee = currentUser?.role === 'employee';
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingCode, setMeetingCode] = useState('');
  const [scheduleForm, setScheduleForm] = useState({ title: '', date: '', time: '', duration: 30, description: '' });
  const [showAllToday, setShowAllToday] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  const greeting = getGreeting();
  const message = useMemo(() => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)], []);

  const myMeetings = useMemo(
    () => (isEmployee
      ? meetings.filter((m) => m.participants?.includes(currentUser?.id) || m.host === currentUser?.id)
      : meetings),
    [meetings, isEmployee, currentUser],
  );
  const todayMeetings = useMemo(
    () => myMeetings.filter((m) => m.date === todayStr).sort((a, b) => a.time.localeCompare(b.time)),
    [myMeetings],
  );
  const fallbackTodayMeetings = useMemo(() => {
    if (todayMeetings.length > 0) return todayMeetings;
    const today = toDateKey(new Date());
    const sortFn = (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    const upcoming = myMeetings.filter((m) => m.status === 'upcoming');
    const future = upcoming.filter((m) => m.date >= today).sort(sortFn);
    return (future.length > 0 ? future : upcoming).sort(sortFn).slice(0, 3);
  }, [myMeetings, todayMeetings]);
  const liveMeetings = useMemo(() => myMeetings.filter((m) => m.status === 'live'), [myMeetings]);
  const upcomingMeetings = useMemo(
    () => myMeetings.filter((m) => m.status === 'upcoming' && m.date !== todayStr).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [myMeetings],
  );
  const recentMeetings = useMemo(
    () => myMeetings.filter((m) => m.status === 'completed').sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)),
    [myMeetings],
  );

  const getUser = (id) => users.find((u) => u.id === id);
  const totalMeetings = meetings.length;
  const totalHours = meetings.reduce((acc, m) => acc + m.duration, 0);
  const totalParticipants = [...new Set(meetings.flatMap((m) => m.participants))].length;
  const totalRecordings = meetings.filter((m) => m.recording).length;

  const kpiCards = isEmployee
    ? [
        { label: 'My Meetings', value: myMeetings.length, icon: HiVideoCamera, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', change: '+12%', href: '/app/meetings' },
        { label: 'My Meeting Hours', value: myMeetings.reduce((acc, m) => acc + m.duration, 0), icon: HiClock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', suffix: 'min', change: '+8%', href: '/app/meetings' },
        { label: 'Teammates Met', value: [...new Set(myMeetings.flatMap((m) => m.participants || []).filter((id) => id !== currentUser?.id))].length, icon: HiUsers, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', change: '+24%', href: '/app/team' },
        { label: 'My Recordings', value: myMeetings.filter((m) => m.recording).length, icon: HiMicrophone, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', change: '+3', href: '/app/recordings' },
      ]
    : [
        { label: 'Total Meetings', value: totalMeetings, icon: HiVideoCamera, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', change: '+12%', href: '/app/meetings' },
        { label: 'Hours Spent', value: totalHours, icon: HiClock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', suffix: 'min', change: '+8%', href: '/app/meetings' },
        { label: 'Participants Met', value: totalParticipants, icon: HiUsers, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', change: '+24%', href: '/app/participants' },
        { label: 'Recordings', value: totalRecordings, icon: HiMicrophone, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', change: '+3', href: '/app/recordings' },
      ];

  const teamMembers = useMemo(() => {
    const order = { online: 0, away: 1, offline: 2 };
    const pool = isEmployee && currentUser?.department
      ? users.filter((u) => u.department === currentUser.department && u.id !== currentUser.id)
      : users;
    return [...pool].sort((a, b) => order[a.status] - order[b.status]);
  }, [users, isEmployee, currentUser]);

  const activities = useMemo(() => {
    const items = [];
    myMeetings.forEach((m) => {
      if (m.status === 'completed') {
        items.push({ type: 'meeting_ended', text: `"${m.title}" ended`, time: `${m.date} ${m.time}`, user: m.host });
      }
      if (m.status === 'upcoming') {
        items.push({ type: 'meeting_scheduled', text: `"${m.title}" scheduled`, time: `${m.date} ${m.time}`, user: m.host });
      }
    });
    items.sort((a, b) => b.time.localeCompare(a.time));
    return items.slice(0, 8);
  }, [myMeetings]);

  // Real activity feed (messages, meetings, tasks, approvals, announcements)
  const activityFeed = useMemo(() => {
    const fromLog = (activityLog || []).slice(0, 8).map((a) => ({
      type: a.type,
      text: a.action,
      time: a.timestamp ? new Date(a.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '',
      user: a.user,
    }));
    if (fromLog.length > 0) return fromLog;
    return activities;
  }, [activityLog, activities]);

  const announcements = useMemo(
    () => (userNotifications || []).filter((n) => n.type === 'announcement').slice(0, 4),
    [userNotifications],
  );

  const isHostRole = currentUser?.role === 'host';
  const hostId = useMemo(() => {
    if (currentUser?.role === 'host' && currentUser?.id && meetings.some(m => m.host === currentUser.id)) return currentUser.id;
    if (currentUser?.role === 'host' || !currentUser) return users.find(u => u.role === 'host')?.id || 'u11';
    return currentUser.id;
  }, [currentUser, meetings, users]);
  const hostedMeetings = useMemo(
    () => meetings.filter((m) => m.host === hostId),
    [meetings, hostId],
  );
  const hostOverview = useMemo(() => {
    const live = hostedMeetings.filter((m) => m.status === 'live');
    return {
      total: hostedMeetings.length,
      live: live.length,
      pending: hostedMeetings.filter((m) => m.status === 'pending_approval').length,
      waiting: live.reduce((acc, m) => acc + (getWaitingUsers ? getWaitingUsers(m.id).length : 0), 0),
    };
  }, [hostedMeetings, getWaitingUsers]);

  const nextHosted = useMemo(() => {
    const today = toDateKey(new Date());
    const sortFn = (a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || '');
    const candidates = hostedMeetings.filter((m) => ['live', 'upcoming', 'pending_approval'].includes(m.status) && (m.date || '') >= today);
    return candidates.sort(sortFn)[0] || null;
  }, [hostedMeetings]);

  const handleStartMeeting = () => {
    const meeting = createInstantMeeting(currentUser);
    if (meeting) {
      navigate(`/app/meeting/lobby/${meeting.id}`);
    }
  };

  const handleJoinMeeting = () => {
    if (!meetingCode.trim()) return;
    const code = meetingCode.trim().match(/con-[\w-]+/)?.[0] || meetingCode.trim();
    const meeting = joinMeeting(code);
    if (meeting) {
      setShowJoinModal(false);
      setMeetingCode('');
      navigate(`/app/meeting/lobby/${meeting.id}`);
    } else {
      toast.error('Meeting not found. Please check the code and try again.');
    }
  };

  const handleSchedule = () => {
    if (scheduleForm.title && scheduleForm.date && scheduleForm.time) {
      scheduleMeeting(scheduleForm, currentUser);
      setShowScheduleModal(false);
      setScheduleForm({ title: '', date: '', time: '', duration: 30, description: '' });
      toast.success('Meeting scheduled and sent for approval');
    }
  };

  const handleShare = async () => {
    const shareData = { title: 'AdzConnect', text: 'Join me on AdzConnect', url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareData.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {}
      document.body.removeChild(ta);
      if (copied) {
        toast.success('Link copied to clipboard');
      } else {
        toast.error('Could not copy link');
      }
    }
  };

  const renderMeetingCard = (meeting) => {
    const host = getUser(meeting.host);
    const cfg = statusConfig[meeting.status];
    return (
      <div key={meeting.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 group">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/20 dark:to-violet-900/20 flex items-center justify-center">
          <HiVideoCamera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{meeting.title}</h4>
            <Badge variant={cfg.variant} size="sm" dot={cfg.dot}>{cfg.label}</Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
            <span>{formatTimeRange(meeting.time, meeting.duration)}</span>
            {host && (
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                {host.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
              {meeting.participants.length} participants
            </span>
          </div>
        </div>
            <div className="flex-shrink-0 flex items-center gap-1.5">
          {meeting.status === 'live' && (
            <Button size="sm" icon={HiPlay} onClick={() => navigate(`/app/meeting/lobby/${meeting.id}`)}>Join</Button>
          )}
          {meeting.status === 'upcoming' && (
            <Button size="sm" variant="outline" icon={HiArrowRight} onClick={() => navigate(`/app/meeting/${meeting.id}`)}>Details</Button>
          )}
          {meeting.status === 'completed' && (
            <Button size="sm" variant="ghost" icon={HiDotsHorizontal} onClick={() => navigate(`/app/meeting/${meeting.id}`)} />
          )}
        </div>
      </div>
    );
  };

  // Check for due reminders on mount
  useEffect(() => {
    const due = getDueReminders();
    due.forEach(r => {
      toast(`⏰ Reminder: "${r.meetingTitle}" starts at ${new Date(r.meetingDate + 'T' + r.meetingTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`, { icon: '⏰', duration: 10000 });
    });
    if (due.length > 0) clearDueReminders();
  }, []);

  return (
    <>
    <Helmet>
      <title>Home - AdzConnect</title>
      <meta name="description" content="Your AdzConnect home dashboard with meeting overview, quick actions, and recent activity." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0"
    >
      <div className="space-y-4">
      {/* 1. Welcome Greeting Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-800" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-primary-100 text-xs">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-white/80 text-xs max-w-xs italic line-clamp-1">"{message}"</p>
              {isEmployee && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white/90 text-xs font-medium">
                  <HiStar className="w-3 h-3" />
                  {currentUser?.title || 'Employee'} · {currentUser?.department || 'Workspace'}
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {isEmployee && (
                <Button
                  size="md"
                  variant="secondary"
                  icon={HiViewGrid}
                  onClick={() => navigate('/app/dashboard/employee')}
                  className="flex-shrink-0 bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm shadow-lg h-9 text-xs"
                >
                  My Dashboard
                </Button>
              )}
              <Button
                size="md"
                variant="secondary"
                icon={HiVideoCamera}
                onClick={handleStartMeeting}
                className="flex-shrink-0 bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm shadow-lg h-9 text-xs"
              >
                Start Meeting
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 2. Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={handleStartMeeting}
            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <HiPlus className="w-4 h-4" />
            <span className="font-semibold text-xs">New</span>
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <HiLogin className="w-4 h-4 text-primary-500" />
            <span className="font-semibold text-xs">Join</span>
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <HiCalendar className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-xs">Schedule</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <HiShare className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-xs">Share</span>
          </button>
        </div>
      </motion.div>

      {/* 3. KPI Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} padding={false} className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" onClick={() => kpi.href && navigate(kpi.href)}>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${kpi.bg}`}>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                      {kpi.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {kpi.value}{kpi.suffix ? <span className="text-xs font-normal text-gray-500 dark:text-slate-400 ml-0.5">{kpi.suffix}</span> : null}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{kpi.label}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

        {/* 4. Today's Meetings */}
        <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <HiCalendar className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Today's Meetings</h3>
              <Badge variant="primary" size="sm">{todayMeetings.length}</Badge>
            </div>
            {todayMeetings.length > 3 && (
              <button
                onClick={() => setShowAllToday(!showAllToday)}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showAllToday ? 'Show less' : 'View all'}
              </button>
            )}
          </div>
              <div className="space-y-1">
                {todayMeetings.length > 0 ? (
                  (showAllToday ? todayMeetings : todayMeetings.slice(0, 3)).map(renderMeetingCard)
                ) : fallbackTodayMeetings.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 dark:text-slate-500 px-4 pt-1">No meetings today — here's what's next</p>
                    {fallbackTodayMeetings.slice(0, 3).map(renderMeetingCard)}
                  </>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-gray-500 dark:text-slate-400 text-sm">No meetings scheduled</p>
                    <Button size="sm" variant="primary" icon={HiPlus} onClick={() => setShowScheduleModal(true)}>Schedule a meeting</Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 5. Upcoming Meetings */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <HiClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h3>
                  <Badge variant="warning" size="sm">{upcomingMeetings.length}</Badge>
                </div>
                {upcomingMeetings.length > 3 && (
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {showAllUpcoming ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {(showAllUpcoming ? upcomingMeetings : upcomingMeetings.slice(0, 3)).length > 0 ? (
                  (showAllUpcoming ? upcomingMeetings : upcomingMeetings.slice(0, 3)).map((meeting) => (
                    <div key={meeting.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-none">
                          {new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric' })}
                        </span>
                        <span className="text-[8px] font-medium text-amber-600 dark:text-amber-400 leading-none mt-0.5">
                          {new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{meeting.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1">
                          <span>{formatTimeRange(meeting.time, meeting.duration)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                          <span>{getUser(meeting.host)?.name}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" icon={HiCalendar} onClick={() => {
                          const remindAt = new Date(meeting.date + 'T' + meeting.time);
                          remindAt.setMinutes(remindAt.getMinutes() - 15); // 15 min before
                          addReminder(meeting, remindAt);
                          toast.success(`Reminder set for "${meeting.title}" 15 min before`);
                        }}>Remind</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400 text-sm">
                    No upcoming meetings
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 7. Recent Meetings */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700">
                    <HiVideoCamera className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Meetings</h3>
                  <Badge variant="default" size="sm">{recentMeetings.length}</Badge>
                </div>
                {recentMeetings.length > 3 && (
                  <button
                    onClick={() => setShowAllRecent(!showAllRecent)}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {showAllRecent ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {(showAllRecent ? recentMeetings : recentMeetings.slice(0, 3)).length > 0 ? (
                  (showAllRecent ? recentMeetings : recentMeetings.slice(0, 3)).map(renderMeetingCard)
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400 text-sm">
                    No recent meetings
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

        <motion.div variants={itemVariants}>
          {(isHostRole || hostedMeetings.length > 0) && (
            /* 5b. Host Overview (host role only) */
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                    <HiVideoCamera className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Host Overview</h3>
                  <Badge variant="info" size="sm" className="ml-auto">{hostOverview.total} hosted</Badge>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button onClick={() => navigate('/app/meetings')} className="text-left p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{hostOverview.total}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Hosted Meetings</p>
                  </button>
                  <button onClick={() => navigate('/app/meetings')} className="text-left p-3 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{hostOverview.live}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Live Now</p>
                  </button>
                  <button onClick={() => navigate('/app/meetings')} className="text-left p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{hostOverview.pending}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Awaiting Approval</p>
                  </button>
                  <button onClick={() => navigate('/app/participants')} className="text-left p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{hostOverview.waiting}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">In Waiting Room</p>
                  </button>
                </div>
                {nextHosted && (
                  <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-violet-100 dark:border-violet-900/30">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Next hosted meeting</p>
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{nextHosted.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {new Date(`${nextHosted.date}T12:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTimeRange(nextHosted.time || '09:00', nextHosted.duration || 30)}
                      </p>
                    </div>
                    <Button size="xs" variant="primary" icon={HiPlay} onClick={() => navigate(`/app/meeting/${nextHosted.id}`)}>Open</Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* 6. Live Meetings Indicator */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <HiVideoCamera className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Live Now</h3>
                {liveMeetings.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <span className="relative flex w-2 h-2">
                      <span className="animate-ping absolute inset-0 rounded-full bg-red-500 opacity-75" />
                      <span className="relative rounded-full w-2 h-2 bg-red-600" />
                    </span>
                    {liveMeetings.length} active
                  </span>
                )}
              </div>
              {liveMeetings.length > 0 ? (
                <div className="space-y-3">
                  {liveMeetings.map((meeting) => {
                    const host = getUser(meeting.host);
                    const participantAvatars = meeting.participants.slice(0, 4);
                    return (
                      <div key={meeting.id} className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border border-red-100 dark:border-red-900/30">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                  <span className="relative flex w-1.5 h-1.5">
                                <span className="animate-ping absolute inset-0 rounded-full bg-red-500 opacity-75" />
                                <span className="relative rounded-full w-2 h-2 bg-red-600" />
                              </span>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{meeting.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              Hosted by {host?.name}
                            </p>
                          </div>
                          <Button size="xs" variant="danger" icon={HiPlay} onClick={() => navigate(`/app/meeting/lobby/${meeting.id}`)}>Join</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {participantAvatars.map((pid) => {
                              const u = getUser(pid);
                              return u ? (
                                <Avatar key={pid} src={u.avatar} name={u.name} size="sm" className="ring-2 ring-white dark:ring-slate-800" />
                              ) : null;
                            })}
                            {meeting.participants.length > 4 && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400">
                                +{meeting.participants.length - 4}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {meeting.duration > 0 ? `${meeting.duration} min` : 'Ongoing'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <HiVideoCamera className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">No live meetings right now</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Start one to get started</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* 7b. Announcements */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <HiSpeakerphone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Announcements</h3>
                  {announcements.length > 0 && <Badge variant="warning" size="sm">{announcements.length}</Badge>}
                </div>
                <button
                  onClick={() => navigate('/app/announcements')}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                </button>
              </div>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.title}</p>
                        {a.read && <HiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2">{a.message}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                        {a.time ? new Date(a.time).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400">No announcements right now</p>
              )}
            </Card>
          </motion.div>

          {/* 8. Team Availability */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <HiUsers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Availability</h3>
                </div>
                <button
                  onClick={() => navigate('/app/team')}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const statusColors = { online: 'bg-emerald-500', away: 'bg-amber-500', offline: 'bg-gray-400' };
                  const statusLabels = { online: 'Online', away: 'Away', offline: 'Offline' };
                  return (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <Avatar src={member.avatar} name={member.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{member.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${statusColors[member.status]}`} />
                        <span className="text-xs text-gray-500 dark:text-slate-400">{statusLabels[member.status]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* 9. Quick Links */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                  <HiStar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.label}
                      onClick={() => navigate(link.href)}
                      className={`flex items-center gap-3 p-3 rounded-xl ${link.bg} hover:shadow-sm transition-all duration-200 group text-left cursor-pointer`}
                    >
                      <Icon className={`w-5 h-5 ${link.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {link.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* 10. Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <HiClock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="space-y-0">
                {activityFeed.map((activity, idx) => {
                  const u = typeof activity.user === 'string' ? getUser(activity.user) : null;
                  const isLast = idx === activityFeed.length - 1;
                  return (
                    <div key={`${activity.type}-${idx}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary-500 ring-2 ring-primary-100 dark:ring-primary-900/30" />
                        {!isLast && <div className="w-px flex-1 bg-gray-200 dark:bg-slate-700 my-1" />}
                      </div>
                      <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.user && typeof activity.user === 'string' && u ? (
                            <>{u.name} </>
                          ) : activity.user && typeof activity.user === 'string' ? (
                            <span className="font-medium text-gray-900 dark:text-white">{activity.user} </span>
                          ) : null}
                          <span className="text-gray-500 dark:text-slate-400">{activity.text}</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

        </motion.div>

        {/* Join Meeting Modal */}
      <Modal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); setMeetingCode(''); }} title="Join Meeting" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowJoinModal(false); setMeetingCode(''); }}>Cancel</Button>
            <Button icon={HiLogin} onClick={handleJoinMeeting} disabled={!meetingCode.trim()}>Join</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
            <HiLink className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-slate-300">Enter a meeting code or link to join</p>
          </div>
          <Input
            label="Meeting Code or Link"
            placeholder="Enter code (e.g. con-xxxx-xxxx)"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
            icon={HiVideoCamera}
            autoFocus
          />
        </div>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setScheduleForm({ title: '', date: '', time: '', duration: 30, description: '' }); }}
        title="Schedule Meeting"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowScheduleModal(false); setScheduleForm({ title: '', date: '', time: '', duration: 30, description: '' }); }}>Cancel</Button>
            <Button icon={HiCalendar} onClick={handleSchedule} disabled={!scheduleForm.title || !scheduleForm.date || !scheduleForm.time}>Schedule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Meeting Title"
            placeholder="Enter meeting title"
            value={scheduleForm.title}
            onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Duration (minutes)</label>
            <select
              value={scheduleForm.duration}
              onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
              className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[15, 30, 45, 60, 90, 120].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
          <Input
            label="Description (optional)"
            placeholder="Add a description"
            value={scheduleForm.description}
            onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
          />
        </div>
      </Modal>
      </div>
    </motion.div>
    </>
  );
}
