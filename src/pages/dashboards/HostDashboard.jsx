import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiCalendar, HiClock, HiUserGroup,
  HiStar, HiChartBar, HiLightBulb, HiPlay,
  HiViewGrid,
  HiArrowSmUp, HiArrowSmDown, HiAnnotation, HiDownload,
  HiBadgeCheck, HiExclamationCircle, HiQuestionMarkCircle,
  HiUserAdd, HiUserRemove, HiDocumentReport, HiDesktopComputer,
  HiExclamation, HiMicrophone, HiInbox, HiXCircle,
  HiCheck, HiX,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import LineChartCard from '../../components/charts/LineChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import ActivityFeed from '../../components/common/ActivityFeed';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import TodayBriefing from '../../components/dashboard/TodayBriefing';
import MeetingCountdown from '../../components/dashboard/MeetingCountdown';
import DashboardCalendarWidget from '../../components/dashboard/DashboardCalendarWidget';
import TaskListWidget from '../../components/dashboard/TaskListWidget';
import NotificationCenter from '../../components/common/NotificationCenter';
import SmartMeetingRecommendation from '../../components/meeting/SmartMeetingRecommendation';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateMeetingInsights, findOptimalTime } from '../../utils/meetingInsights';

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

const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatMeetingDate = (d) => {
  if (!d) return '—';
  const today = toDateKey(new Date());
  if (d === today) return 'Today';
  const tomorrow = toDateKey(new Date(Date.now() + 86400000));
  if (d === tomorrow) return 'Tomorrow';
  return new Date(`${d}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ratingDistribution = [
  { label: '5 Stars', value: 68 },
  { label: '4 Stars', value: 22 },
  { label: '3 Stars', value: 7 },
  { label: '2 Stars', value: 2 },
  { label: '1 Star', value: 1 },
];

export default function HostDashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, createInstantMeeting, userNotifications, unreadNotifications, markAllNotificationsRead, meetings, users, attendanceRecords, presence, getWaitingUsers, admitWaitingUser, denyWaitingUser, recordings, respondToInvitation, approveMeeting } = useApp();
  const navigate = useNavigate();

  // The logged-in user may not exactly match a seed meeting host (e.g. SSO host id).
  // Fall back to the seed host so host-scoped sections always have data.
  const hostUserId = useMemo(() => {
    if (user?.id && meetings.some(m => m.host === user.id)) return user.id;
    const seedHost = users.find(u => u.role === 'host');
    return seedHost?.id || user?.id || 'u11';
  }, [user, meetings, users]);

  const hostTips = useMemo(() => users.length > 0
    ? users.filter(u => u.role === 'host' || u.role === 'manager').slice(0, 3).map((u, i) => ({
        tip: `Tip from ${u.name.split(' ')[0]}: Use breakout rooms for better engagement`,
        impact: `+${15 + i * 10}% engagement`,
        icon: i % 3 === 0 ? HiLightBulb : i % 3 === 1 ? HiChartBar : HiAnnotation,
      }))
    : [
        { tip: 'Share screen at the start to set context', impact: '+32% engagement', icon: HiLightBulb },
        { tip: 'Use polls every 10 minutes', impact: '+28% retention', icon: HiChartBar },
        { tip: 'Enable captions for accessibility', impact: '+45% satisfaction', icon: HiAnnotation },
      ], [users]);

  const weeklyMeetingsData = useMemo(() => {
    const totalHosted = users.reduce((sum, u) => sum + (u.meetingsHosted || 0), 0);
    if (totalHosted <= 0) {
      return [
        { week: 'W1', meetings: 12 },
        { week: 'W2', meetings: 18 },
        { week: 'W3', meetings: 15 },
        { week: 'W4', meetings: 22 },
        { week: 'W5', meetings: 19 },
        { week: 'W6', meetings: 24 },
      ];
    }
    const weights = [1.0, 1.35, 1.15, 1.55, 1.3, 1.7];
    const weeklyBase = totalHosted / (weights.length * 4);
    return weights.map((w, i) => ({ week: `W${i + 1}`, meetings: Math.max(5, Math.round(weeklyBase * w)) }));
  }, [users]);

  const attendanceByMeeting = useMemo(() => {
    return meetings
      .filter(m => m.host === hostUserId)
      .map(m => {
        const present = new Set(attendanceRecords.filter(r => r.meetingId === m.id && r.status === 'present').map(r => r.userId)).size;
        const total = Math.max(m.participants?.length || 0, present);
        return { id: m.id, title: m.title, date: m.date, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
      })
      .filter(x => x.rate > 0)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 6);
  }, [meetings, hostUserId, attendanceRecords]);

  const attendanceByMeetingData = useMemo(() => attendanceByMeeting.map(x => x.rate), [attendanceByMeeting]);
  const attendanceByMeetingLabels = useMemo(() => attendanceByMeeting.map(x => x.title.length > 20 ? `${x.title.slice(0, 18)}…` : x.title), [attendanceByMeeting]);
  const avgAttendanceRate = useMemo(() => {
    if (attendanceByMeeting.length === 0) return 0;
    return Math.round(attendanceByMeeting.reduce((sum, x) => sum + x.rate, 0) / attendanceByMeeting.length);
  }, [attendanceByMeeting]);

  // Feedback ratings derived from actual recording reviews (falls back to a
  // realistic distribution until someone rates a recording)
  const feedbackStats = useMemo(() => {
    const rated = recordings.filter(r => Number(r.rating) > 0);
    if (rated.length === 0) {
      return {
        data: ratingDistribution,
        avg: dashboardMetrics.teamSatisfaction,
        total: ratingDistribution.reduce((sum, d) => sum + d.value, 0),
      };
    }
    const avg = rated.reduce((sum, r) => sum + Number(r.rating), 0) / rated.length;
    const counts = [0, 0, 0, 0, 0];
    rated.forEach(r => {
      const rating = Math.max(1, Math.min(5, Math.floor(Number(r.rating))));
      counts[rating - 1] += 1;
    });
    const data = [5, 4, 3, 2, 1]
      .map(star => ({ label: `${star} Star${star === 1 ? '' : 's'}`, value: counts[star - 1] }))
      .filter(x => x.value > 0);
    return { data, avg: Math.round(avg * 10) / 10, total: rated.length };
  }, [recordings, dashboardMetrics.teamSatisfaction]);

  const upcomingHosted = useMemo(() => {
    const today = toDateKey(new Date());
    const sortFn = (a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`);
    const hosted = meetings
      .filter(m => m.host === hostUserId && ['live', 'upcoming', 'pending_approval'].includes(m.status));
    const future = hosted.filter(m => m.date >= today).sort(sortFn);
    const list = (future.length > 0 ? future : hosted).sort(sortFn).slice(0, 3);
    return list.map(m => ({
      id: m.id,
      title: m.title,
      date: formatMeetingDate(m.date),
      time: formatMeetingTime(m.time),
      attendees: m.participants?.length || 0,
      status: m.status,
    }));
  }, [meetings, hostUserId]);

  const recentHosted = useMemo(() => {
    return meetings
      .filter(m => m.host === hostUserId && ['ended', 'completed'].includes(m.status))
      .slice(0, 3)
      .map(m => {
        const rec = recordings.find(r => (r.title || '').includes(m.title) && Number(r.rating) > 0);
        return {
          id: m.id,
          title: m.title,
          date: formatMeetingDate(m.date),
          attendees: m.participants?.length || 0,
          joined: attendanceRecords.filter(r => r.meetingId === m.id && r.status === 'present').length || m.participants?.length || 0,
          rating: rec ? Number(rec.rating) : dashboardMetrics.teamSatisfaction,
        };
      });
  }, [meetings, hostUserId, dashboardMetrics.teamSatisfaction, attendanceRecords, recordings]);

  const liveMeetings = useMemo(() => {
    return meetings
      .filter(m => m.status === 'live')
      .map(m => ({
        id: m.id,
        title: m.title,
        host: m.host,
        hostName: users.find(u => u.id === m.host)?.name || 'Host',
        attendees: m.participants?.length || 0,
        started: m.time || '',
        type: m.type || 'meeting',
      }));
  }, [meetings, users]);

  const nextHostedMeeting = useMemo(() => {
    const now = Date.now();
    const sortUpcoming = (list) => list.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    const candidates = meetings.filter(m => m.host === hostUserId && m.status === 'upcoming');
    const future = sortUpcoming(candidates.filter(m => new Date(`${m.date}T${m.time || '00:00'}`).getTime() > now));
    if (future.length > 0) return future[0];
    return sortUpcoming(candidates)[0] || null;
  }, [meetings, hostUserId]);

  const waitingRoom = useMemo(() => {
    return meetings
      .filter(m => m.host === hostUserId && m.status === 'live')
      .map(m => ({ meeting: m, waiting: getWaitingUsers(m.id) }))
      .filter(x => x.waiting.length > 0);
  }, [meetings, hostUserId, getWaitingUsers]);

  const aiSummaries = useMemo(() => {
    return meetings
      .filter(m => m.host === hostUserId && ['ended', 'completed'].includes(m.status))
      .map(m => ({ meeting: m, insights: generateMeetingInsights(m, users, attendanceRecords) }))
      .filter(x => x.insights?.ready)
      .slice(0, 3);
  }, [meetings, users, hostUserId, attendanceRecords]);

  const optimalTime = useMemo(() => findOptimalTime(meetings, users), [meetings, users]);

  const onlineCount = useMemo(() => {
    return Object.values(presence || {}).filter(s => s === 'online' || s === 'away').length;
  }, [presence]);

  const todayDate = toDateKey(new Date());

  const todaysMeetings = useMemo(() => {
    return meetings
      .filter(m => m.date === todayDate && (m.host === hostUserId || m.participants?.includes(user?.id || hostUserId)) && ['live', 'upcoming'].includes(m.status))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      .slice(0, 4);
  }, [meetings, user, hostUserId, todayDate]);

  const displayTodayMeetings = useMemo(() => {
    if (todaysMeetings.length > 0) return todaysMeetings;
    const today = toDateKey(new Date());
    const sortFn = (a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`);
    const hosted = meetings.filter(m => m.host === hostUserId && ['live', 'upcoming'].includes(m.status));
    const future = hosted.filter(m => m.date >= today).sort(sortFn);
    const fallback = (future.length > 0 ? future : hosted).sort(sortFn).slice(0, 2);
    return fallback;
  }, [meetings, todaysMeetings, hostUserId]);

  const meetingInvitations = useMemo(() => {
    return meetings
      .filter(m => m.host !== hostUserId && m.participants?.includes(user?.id || hostUserId) && ['upcoming', 'live'].includes(m.status))
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 4);
  }, [meetings, user, hostUserId]);

  const needsAttention = useMemo(() => {
    const pending = meetings
      .filter(m => m.host === hostUserId && m.status === 'pending_approval')
      .map(m => ({ type: 'approval', meeting: m, label: 'Awaiting your approval' }));
    const waiting = meetings
      .filter(m => m.host === hostUserId && m.status === 'live')
      .map(m => ({ type: 'waiting', meeting: m, label: `${getWaitingUsers(m.id).length} participant(s) waiting` }))
      .filter(x => x.label !== '0 participant(s) waiting');
    return [...pending, ...waiting].slice(0, 4);
  }, [meetings, hostUserId, getWaitingUsers]);

  const absentByMeeting = useMemo(() => {
    return meetings
      .filter(m => m.host === hostUserId && ['live', 'upcoming'].includes(m.status))
      .map(m => {
        const present = new Set(attendanceRecords.filter(r => r.meetingId === m.id && r.status === 'present').map(r => r.userId));
        const absent = (m.participants || [])
          .map(id => users.find(u => u.id === id))
          .filter(Boolean)
          .filter(u => !present.has(u.id));
        return { meeting: m, absent };
      })
      .filter(x => x.absent.length > 0)
      .slice(0, 3);
  }, [meetings, users, hostUserId, attendanceRecords]);

  const recentRecordings = useMemo(() => {
    return [...recordings].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  }, [recordings]);

  const [qaQuestions, setQaQuestions] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-qa-questions');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'qa-1', question: 'Will the recording be shared after the meeting?', employeeName: 'David Kim', status: 'pending' },
      { id: 'qa-2', question: 'Could you share the updated Q3 roadmap slides?', employeeName: 'Lisa Thompson', status: 'pending' },
      { id: 'qa-3', question: 'Are breakout rooms available for team discussions?', employeeName: 'Sarah Chen', status: 'answered', answer: 'Marked as answered by host' },
    ];
  });

  const handleAnswerQuestion = (questionId) => {
    setQaQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, status: 'answered', answer: 'Marked as answered by host' } : q
    ));
    toast.success('Question marked as answered');
  };

  // Sync to localStorage
  useEffect(() => {
    try { localStorage.setItem('connectly-qa-questions', JSON.stringify(qaQuestions)); } catch {}
  }, [qaQuestions]);
  const hostStats = [
    { label: 'Meetings This Week', value: `${dashboardMetrics.meetingsThisWeek}`, icon: HiVideoCamera, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', change: '+22%', up: true },
    { label: 'Active Sessions', value: `${dashboardMetrics.activeSessions}`, icon: HiUserGroup, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', change: '+18%', up: true },
    { label: 'Avg Rating', value: `${dashboardMetrics.teamSatisfaction}`, icon: HiStar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', change: '+0.2', up: true },
    { label: 'System Uptime', value: `${dashboardMetrics.systemUptime.toFixed(1)}%`, icon: HiClock, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', change: '-3min', up: false },
  ];

  useEffect(() => {
    if (user && user.role !== 'host') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  const handleStartMeeting = () => {
    const meeting = createInstantMeeting({ id: user.id, role: user.role, name: user.name });
    toast.success('Meeting started and broadcast to all users!');
    if (meeting) navigate(`/app/meeting/room/${meeting.id}`);
  };

  const handleWaitingRoom = () => {
    if (liveMeetings.length > 0) {
      navigate(`/app/meeting/room/${liveMeetings[0].id}`);
    } else {
      navigate('/app/participants');
    }
  };

  const handleAdmit = (meetingId, userId) => {
    admitWaitingUser(meetingId, userId);
    toast.success('Participant admitted to the meeting');
  };

  const handleDeny = (meetingId, userId) => {
    denyWaitingUser(meetingId, userId);
    toast.success('Participant removed from the waiting room');
  };

  const handleRespondInvitation = (meeting, response) => {
    respondToInvitation(meeting.id, response);
    toast.success(
      response === 'accepted'
        ? `Invitation to "${meeting.title}" accepted`
        : `Invitation to "${meeting.title}" declined`
    );
  };

  const handleApprove = (meeting) => {
    approveMeeting(meeting.id);
    toast.success(`"${meeting.title}" approved and scheduled`);
  };

  return (
    <>
    <Helmet>
      <title>Host Dashboard - AdzConnect</title>
      <meta name="description" content="Your AdzConnect host dashboard to manage meetings, view analytics, and track participant engagement." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 pb-0"
    >
      <div className="space-y-4">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <WelcomeBanner user={user} role="Host" />
        <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hostStats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
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

      <TodayBriefing metrics={dashboardMetrics} />

      <div className="space-y-4">
        <motion.div variants={itemVariants}>
          <LineChartCard
            data={weeklyMeetingsData}
            title="Weekly Meetings Hosted"
            badge="+20% vs last month"
          />

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiVideoCamera className="w-5 h-5 text-orange-500" />
                Live Meetings
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">
                  <span className="flex items-center gap-1"><HiUserGroup className="w-3 h-3" />{onlineCount} online</span>
                </Badge>
                <Badge variant="danger" size="sm">{liveMeetings.length} live now</Badge>
              </div>
            </div>
            {liveMeetings.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No live meetings right now. Start one to go live.</p>
            ) : (
              <div className="space-y-3">
                {liveMeetings.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-500/10 dark:to-rose-500/10 border border-orange-100 dark:border-orange-900/20">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="relative flex w-2 h-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                          </span>
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{m.title}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          Hosted by {m.hostName} · {m.attendees} participants · started {m.started || 'now'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="primary" size="sm" icon={HiPlay} onClick={() => navigate(`/app/meeting/room/${m.id}`)}>Join</Button>
                        <Button variant="ghost" size="sm" icon={HiViewGrid} onClick={() => navigate(`/app/meeting/room/${m.id}`)}>Host</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiCalendar className="w-5 h-5 text-primary-500" />
                  Today's Meetings
                </h2>
                <Badge variant="info" size="sm">{todaysMeetings.length} today</Badge>
              </div>
              <div className="space-y-3">
                {todaysMeetings.length === 0 && displayTodayMeetings.length > 0 && (
                  <p className="text-xs text-gray-400 dark:text-slate-500">No meetings today — here's your next one</p>
                )}
                {displayTodayMeetings.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{m.title}</p>
                      <Badge variant={m.status === 'live' ? 'success' : 'info'} size="xs">{m.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <HiClock className="w-3 h-3" />{m.date === todayDate ? formatMeetingTime(m.time) : `${formatMeetingDate(m.date)} · ${formatMeetingTime(m.time)}`} · {m.participants?.length || 0} participants
                      </span>
                      <Button size="xs" variant="ghost" icon={HiPlay} onClick={() => navigate(`/app/meeting/lobby/${m.id}`)}>Join</Button>
                    </div>
                  </div>
                ))}
                {displayTodayMeetings.length === 0 && (
                  <div className="text-center py-3 space-y-2">
                    <p className="text-sm text-gray-500 dark:text-slate-400">No meetings scheduled</p>
                    <Button size="xs" variant="primary" icon={HiCalendar} onClick={() => navigate('/app/schedule')}>Schedule a meeting</Button>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiExclamation className="w-5 h-5 text-amber-500" />
                  Needs Attention
                </h2>
                <Badge variant="danger" size="sm">{needsAttention.length}</Badge>
              </div>
              <div className="space-y-3">
                {needsAttention.map((item) => (
                  <div key={`${item.type}-${item.meeting.id}`} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.meeting.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.label}</p>
                      </div>
                      <Button
                        size="xs"
                        variant={item.type === 'approval' ? 'primary' : 'outline'}
                        icon={item.type === 'approval' ? HiBadgeCheck : HiViewGrid}
                        onClick={() => item.type === 'approval'
                          ? handleApprove(item.meeting)
                          : navigate('/app/participants')}
                      >
                        {item.type === 'approval' ? 'Approve' : 'Manage'}
                      </Button>
                    </div>
                  </div>
                ))}
                {needsAttention.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">Nothing needs your attention right now</p>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Upcoming Hosted</h2>
                <div className="space-y-2">
                  {upcomingHosted.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/app/meeting/${m.id}`)}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{m.title}</p>
                        <Badge variant={m.status === 'live' ? 'success' : m.status === 'pending_approval' ? 'warning' : 'info'} size="sm">{m.status.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><HiCalendar className="w-3 h-3" />{m.date}</span>
                        <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{m.time}</span>
                        <span className="flex items-center gap-1"><HiUserGroup className="w-3 h-3" />{m.attendees}</span>
                      </div>
                    </motion.div>
                  ))}
                  {upcomingHosted.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center py-2">No upcoming hosted meetings</p>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Recent Hosted</h2>
                <div className="space-y-2">
                  {recentHosted.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/app/meeting/${m.id}`)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{m.date} — {m.joined}/{m.attendees} joined</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <HiStar className="w-4 h-4" />
                        <span className="text-sm font-medium">{m.rating}</span>
                      </div>
                    </motion.div>
                  ))}
                  {recentHosted.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center py-2">No recently hosted meetings</p>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiInbox className="w-4 h-4 text-emerald-500" />
                  Meeting Invitations
                </h2>
                <Badge variant="success" size="sm">{meetingInvitations.length} open</Badge>
              </div>
              <div className="space-y-3">
                {meetingInvitations.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {formatMeetingDate(m.date)} · {formatMeetingTime(m.time)} · invited by {users.find(u => u.id === m.host)?.name || m.host}
                      </p>
                      {m.rsvp && m.rsvpUser === hostUserId && (
                        <Badge variant={m.rsvp === 'accepted' ? 'success' : 'warning'} size="xs" className="mt-1.5">
                          {m.rsvp === 'accepted' ? 'Accepted' : 'Declined'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.rsvp && m.rsvpUser === hostUserId ? null : (
                        <>
                          <Button size="xs" variant="ghost" icon={HiCheck} onClick={() => handleRespondInvitation(m, 'accepted')}>Accept</Button>
                          <Button size="xs" variant="ghost" icon={HiX} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleRespondInvitation(m, 'declined')}>Decline</Button>
                        </>
                      )}
                      <Button size="xs" variant="primary" icon={HiPlay} onClick={() => navigate(`/app/meeting/lobby/${m.id}`)}>Join</Button>
                    </div>
                  </div>
                ))}
                {meetingInvitations.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No open invitations</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiMicrophone className="w-5 h-5 text-rose-500" />
                  Recent Recordings
                </h2>
                <Button size="xs" variant="ghost" onClick={() => navigate('/app/recordings')}>View all</Button>
              </div>
              <div className="space-y-3">
                {recentRecordings.map((r) => (
                  <button key={r.id} onClick={() => navigate('/app/recordings')} className="w-full text-left group">
                    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 group-hover:border-rose-200 dark:group-hover:border-rose-900/40 transition-colors">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{r.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{r.date} · {r.duration} · {r.host}</p>
                      </div>
                      <Badge variant="danger" size="xs" dot>Recording</Badge>
                    </div>
                  </button>
                ))}
                {recentRecordings.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No recordings yet</p>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DonutChartCard
              data={feedbackStats.data}
              title="Feedback Ratings"
              size={180}
              badge={{ text: `${feedbackStats.avg}★ avg`, variant: 'success' }}
            />
            {attendanceByMeeting.length > 0 ? (
              <BarChartCard
                data={attendanceByMeetingData}
                labels={attendanceByMeetingLabels}
                title="Attendance by Meeting"
                badge={{ text: `${avgAttendanceRate}% avg`, variant: 'info' }}
                barColor="#f97316"
                height={180}
              />
            ) : (
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance by Meeting</h3>
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm text-gray-500 dark:text-slate-400">No attendance data yet</p>
                  <Button size="xs" variant="primary" icon={HiCalendar} onClick={() => navigate('/app/attendance')}>View Attendance</Button>
                </div>
              </Card>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {nextHostedMeeting && (
            <MeetingCountdown
              targetDate={nextHostedMeeting.date}
              targetTime={nextHostedMeeting.time}
              label={`${nextHostedMeeting.title} starts in`}
            />
          )}

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiLightBulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Host Tips</h2>
            </div>
            <div className="space-y-3">
              {hostTips.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/5 dark:to-amber-500/5 border border-orange-100 dark:border-orange-900/20">
                  <div className="flex items-start gap-2">
                    <t.icon className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{t.tip}</p>
                      <Badge variant="success" size="sm" className="mt-1">{t.impact}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth icon={HiCalendar} size="md" onClick={() => navigate('/app/schedule')}>Schedule Meeting</Button>
              <Button variant="outline" fullWidth icon={HiPlay} size="md" onClick={handleStartMeeting}>Start Instant Meeting</Button>
              <Button variant="secondary" fullWidth icon={HiViewGrid} size="md" onClick={handleWaitingRoom}>Manage Waiting Room</Button>
              <Button variant="ghost" fullWidth icon={HiDesktopComputer} size="md" onClick={() => navigate('/app/device-test')}>Run Device Test</Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiUserAdd className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Waiting Room</h2>
            </div>
            {waitingRoom.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No one is waiting to be admitted.</p>
            ) : (
              <div className="space-y-3">
                {waitingRoom.map(({ meeting, waiting }) => (
                  <div key={meeting.id} className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{meeting.title} · {waiting.length} waiting</p>
                    {waiting.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.department || u.role}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="xs" variant="primary" icon={HiUserAdd} onClick={() => handleAdmit(meeting.id, u.id)}>Admit</Button>
                          <Button size="xs" variant="ghost" icon={HiUserRemove} onClick={() => handleDeny(meeting.id, u.id)}>Deny</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiXCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Absent Participants</h2>
            </div>
            {absentByMeeting.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">Everyone on your upcoming or live meetings has joined.</p>
            ) : (
              <div className="space-y-3">
                {absentByMeeting.map(({ meeting, absent }) => (
                  <div key={meeting.id} className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{meeting.title} · {absent.length} absent</p>
                    {absent.slice(0, 4).map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.department || u.role}</p>
                        </div>
                        <Badge variant="danger" size="xs">Absent</Badge>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summaries Ready</h2>
              <HiDocumentReport className="w-5 h-5 text-violet-500" />
            </div>
            {aiSummaries.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No AI summaries available yet. End a meeting with chat activity to generate one.</p>
            ) : (
              <div className="space-y-2">
                {aiSummaries.map(({ meeting, insights }) => (
                  <button key={meeting.id} onClick={() => navigate(`/app/meeting/${meeting.id}/intelligence`)} className="w-full text-left group">
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 group-hover:border-violet-300 dark:group-hover:border-violet-700 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{meeting.title}</p>
                        <Badge variant="primary" size="xs"><HiStar className="w-3 h-3" />{insights.messageCount} msg</Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{insights.summary}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Questions from Participants</h2>
              <HiQuestionMarkCircle className="w-5 h-5 text-orange-500" />
            </div>
            {qaQuestions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No questions yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {qaQuestions.slice().reverse().map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-start gap-2">
                      {q.status === 'answered' ? (
                        <HiBadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <HiExclamationCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{q.employeeName}</p>
                        <p className="text-sm text-gray-700 dark:text-slate-300 mt-0.5">{q.question}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="xs">{q.status}</Badge>
                          {q.status === 'pending' && (
                            <button
                              onClick={() => handleAnswerQuestion(q.id)}
                              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                            >
                              Mark Answered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <DashboardCalendarWidget />
          <TaskListWidget />

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Hosting Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Key hosting performance metrics</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboardMetrics.avgAttendance}%</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Avg Attendance</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{dashboardMetrics.teamSatisfaction}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Avg Rating</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardMetrics.meetingsThisWeek}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Meetings This Week</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 text-center">
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{dashboardMetrics.productivity}%</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Engagement Rate</p>
              </div>
            </div>
            <Button variant="ghost" fullWidth size="sm" className="mt-3" icon={HiChartBar} onClick={() => navigate('/app/host-analytics')}>View Full Analytics</Button>
          </Card>

          <SmartMeetingRecommendation meetings={meetings} users={users} optimalTime={optimalTime} />

          <ActivityFeed />

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Host Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Download your hosting analytics</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...recentHosted, { id: 4, title: 'Meetings This Week', date: '-', attendees: dashboardMetrics.meetingsThisWeek, joined: dashboardMetrics.activeUsers, rating: dashboardMetrics.teamSatisfaction }, { id: 5, title: 'Active Sessions', date: '-', attendees: dashboardMetrics.activeSessions, joined: dashboardMetrics.meetingsToday, rating: dashboardMetrics.avgAttendance / 20 }, { id: 6, title: 'System Uptime', date: '-', attendees: Math.round(dashboardMetrics.systemUptime), joined: 100, rating: 5.0 }], 'hosting-performance.csv')}>Performance Report</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...weeklyMeetingsData, { week: 'Active Users', meetings: dashboardMetrics.activeUsers }, { week: 'Active Sessions', meetings: dashboardMetrics.activeSessions }, { week: 'Avg Rating', meetings: dashboardMetrics.teamSatisfaction * 10 }, { week: 'System Uptime', meetings: Math.round(dashboardMetrics.systemUptime) }], 'hosting-attendance.csv')}>Attendance Summary</Button>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-rose-500 text-white">
            <h3 className="font-semibold text-lg">Host of the Month</h3>
            <p className="text-white/80 text-sm mt-1">You've hosted {meetings.filter(m => m.host === hostUserId).length} meetings with a {dashboardMetrics.teamSatisfaction} avg rating!</p>
            <div className="mt-3 flex items-center gap-2">
              <HiStar className="w-5 h-5 text-yellow-300" />
              <span className="text-yellow-300 font-semibold">Top Performer</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
    </motion.div>
    </>
  );
}

