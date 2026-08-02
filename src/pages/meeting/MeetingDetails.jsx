import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiCalendar, HiClock, HiUsers, HiLink,
  HiPencil, HiTrash, HiShare, HiPlay, HiLockClosed,
  HiDotsHorizontal, HiCheckCircle, HiArrowLeft,
  HiBadgeCheck, HiChartBar, HiMicrophone,
  HiChat, HiDocumentText, HiLightningBolt,
  HiUserGroup, HiDownload, HiChevronDown,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Toggle from '../../components/ui/Toggle';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import ProgressBar from '../../components/ui/ProgressBar';
import { useApp } from '../../context/AppContext';
import { generateMeetingInsights } from '../../utils/meetingInsights';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusConfig = {
  live: { label: 'Live', variant: 'success', dot: true },
  upcoming: { label: 'Upcoming', variant: 'info', dot: false },
  completed: { label: 'Completed', variant: 'default', dot: false },
  scheduled: { label: 'Scheduled', variant: 'primary', dot: false },
};

function formatDuration(minutes) {
  if (!minutes) return 'Ongoing';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
  return `${m} min`;
}

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, users, joinMeeting, setMeetings, recordings, attendanceRecords, getCurrentUser } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailTab, setDetailTab] = useState('attendance');
  const [showPlayer, setShowPlayer] = useState(false);
  const [playingRecording, setPlayingRecording] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
  });

  const meeting = meetings.find((m) => m.id === id || m.meetingId === id);
  const host = meeting ? users.find((u) => u.id === meeting.host) : null;
  const cfg = meeting ? statusConfig[meeting.status] || statusConfig.upcoming : null;
  const currentUser = getCurrentUser();
  const isHost = currentUser?.id === meeting?.host;

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
          <HiVideoCamera className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Meeting not found</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">The meeting you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/app/meetings')} icon={HiArrowLeft}>Back to Meetings</Button>
      </div>
    );
  }

  const dateStr = (() => {
    const d = new Date(meeting.date + 'T12:00:00');
    return isNaN(d) ? (meeting.date || '') : d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  })();
  const timeStr = (() => {
    const t = new Date(`2000-01-01T${meeting.time}`);
    return isNaN(t) ? (meeting.time || '') : t.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  })();

  const handleCopyLink = async () => {
    const url = meeting.joinUrl || `${window.location.origin}/app/meeting/lobby/${meeting.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    setShowDeleteConfirm(false);
    navigate('/app/meetings');
  };

  const handleEdit = () => {
    setEditForm({
      title: meeting.title || '',
      description: meeting.description || '',
      date: meeting.date || '',
      time: meeting.time || '',
      duration: meeting.duration || 30,
    });
    setEditErrors({});
    setShowMoreMenu(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const errs = {};
    if (!editForm.title.trim()) errs.title = 'Title is required';
    if (!editForm.date) errs.date = 'Date is required';
    if (!editForm.time) errs.time = 'Time is required';
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setMeetings((prev) => prev.map((m) =>
      (m.id === meeting.id || m.meetingId === meeting.id)
        ? { ...m, ...editForm, title: editForm.title.trim() }
        : m
    ));
    toast.success('Meeting updated successfully');
    setShowEditModal(false);
  };

  const handleDownloadRecording = async (rec) => {
    try {
      const toastId = toast.loading('Preparing recording download...');
      const res = await fetch(rec.url);
      if (!res.ok) throw new Error('download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${(rec.title || 'meeting-recording').replace(/\s+/g, '-')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      toast.success('Recording downloaded', { id: toastId });
    } catch {
      window.open(rec.url, '_blank', 'noopener,noreferrer');
      toast('Recording opened in a new tab — use your browser to save it', { icon: '📹' });
    }
    setShowPlayer(false);
    setPlayingRecording(null);
  };

  const handleJoin = () => {
    joinMeeting(meeting.id);
    navigate(`/app/meeting/lobby/${meeting.id}`);
  };

  const participantUsers = meeting.participants.map((pid) => users.find((u) => u.id === pid)).filter(Boolean);

  const attendanceRecordsForMeeting = attendanceRecords.filter((r) => r.meetingId === meeting.id);

  const attendanceRows = attendanceRecordsForMeeting.length > 0
    ? attendanceRecordsForMeeting.map((r) => {
        const u = users.find((x) => x.id === r.userId);
        return {
          id: r.id || `${r.userId}-${r.joinTime}`,
          name: r.userName || u?.name || 'Unknown',
          role: r.userId === meeting.host ? 'Host' : 'Participant',
          joined: r.joinTime ? new Date(r.joinTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—',
          left: r.leaveTime ? new Date(r.leaveTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—',
          duration: r.duration ? `${r.duration} min` : '—',
          status: r.status || 'present',
        };
      })
    : participantUsers.length > 0
      ? participantUsers.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.id === meeting.host ? 'Host' : 'Participant',
          joined: '—',
          left: '—',
          duration: meeting.duration ? `${meeting.duration} min` : '—',
          status: 'pending',
        }))
      : [];

  const mockRecordings = [
    { id: 1, title: 'Meeting Recording', duration: '43:12', size: '1.2 GB', date: meeting.date, url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  ];

  const meetingRecordings = recordings.filter((r) => r.title.includes(meeting.title));
  const recordingsToShow = meetingRecordings.length > 0 ? meetingRecordings : mockRecordings;

  const handlePlay = (rec) => {
    setPlayingRecording(rec);
    setShowPlayer(true);
  };

  const handleExportAttendance = () => {
    const rows = [
      ['Name', 'Role', 'Joined', 'Left', 'Duration', 'Status'],
      ...attendanceRows.map((a) => [a.name, a.role, a.joined, a.left, a.duration, a.status]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance-${meeting.meetingId || meeting.id}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Attendance report exported');
  };

  const meetingChat = (() => {
    try {
      const stored = localStorage.getItem(`connectly-meeting-chat-${meeting.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  })();

  const mockPolls = [
    { id: 1, question: 'Which feature should we prioritize?', options: ['Virtual Backgrounds', 'Real-time Translation', 'Recording Transcriptions'], votes: [12, 8, 5], totalVotes: 25 },
    { id: 2, question: 'Meeting frequency preference', options: ['Weekly', 'Bi-weekly', 'Monthly'], votes: [15, 7, 3], totalVotes: 25 },
  ];

  const insights = generateMeetingInsights(meeting, users, attendanceRecords);
  const aiSummary = {
    keyPoints: insights?.ready
      ? insights.highlights
      : ['No AI summary available yet for this meeting. Attend the meeting and exchange chat messages to build one.'],
    decisions: insights?.decisions?.length
      ? insights.decisions.map((d) => d.text)
      : ['No formal decisions captured yet for this meeting.'],
    actionItems: insights?.actionItems?.length
      ? insights.actionItems.map((task, i) => ({
          owner: insights.participantsList?.[i % Math.max(1, insights.participantsList.length)] || 'Unassigned',
          task,
          due: new Date(Date.now() + (7 + i * 3) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }))
      : [],
    sentiment: insights?.ready && insights.messageCount > 0 ? 'positive' : 'neutral',
  };

  return (
    <>
    <Helmet>
      <title>Meeting Details - AdzConnect</title>
      <meta name="description" content="View details, agenda, participants, and recordings for your AdzConnect meeting." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Back Navigation */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => navigate('/app/meetings')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Meetings
        </button>
      </motion.div>

      {/* Header Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/20 dark:to-violet-900/20 flex items-center justify-center flex-shrink-0">
                <HiVideoCamera className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{meeting.title}</h1>
                  {cfg && <Badge variant={cfg.variant} size="md" dot={cfg.dot}>{cfg.label}</Badge>}
                  {meeting.type === 'recurring' && (
                    <Badge variant="warning" size="md">Recurring</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-mono">
                  ID: {meeting.meetingId}
                </p>
                {host && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar src={host.avatar} name={host.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Hosted by {host.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{host.title}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 relative">
              {(meeting.status === 'live' || meeting.status === 'upcoming') && (
                <Button icon={HiPlay} onClick={handleJoin}>Join</Button>
              )}
              {isHost && <Button variant="outline" icon={HiPencil} onClick={handleEdit}>Edit</Button>}
              <Button variant="ghost" icon={HiDotsHorizontal} aria-label="More options" onClick={() => setShowMoreMenu((v) => !v)} />
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 top-12 z-30 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5">
                    {isHost && (
                      <button onClick={() => { handleEdit(); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <HiPencil className="w-4 h-4 text-gray-400" />
                        Edit Meeting
                      </button>
                    )}
                    <button onClick={() => { setShowMoreMenu(false); handleCopyLink(); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left">
                      <HiLink className="w-4 h-4 text-gray-400" />
                      Copy Join Link
                    </button>
                    {isHost && (
                      <>
                        <div className="my-1 border-t border-gray-100 dark:border-slate-700" />
                        <button onClick={() => { setShowMoreMenu(false); setShowDeleteConfirm(true); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                          <HiTrash className="w-4 h-4" />
                          Delete Meeting
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              <HiCalendar className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-slate-400">Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{dateStr}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              <HiClock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-slate-400">Time</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{timeStr}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              <HiClock className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-slate-400">Duration</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{formatDuration(meeting.duration)}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              <HiUsers className="w-4 h-4 text-violet-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-slate-400">Participants</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{meeting.participants.length}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Description & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                {meeting.description || 'No description provided.'}
              </p>
            </Card>
          </motion.div>

          {/* Participants */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HiUsers className="w-4 h-4 text-primary-500" />
                  Participants ({participantUsers.length})
                </h3>
              </div>
              <div className="space-y-2">
                {participantUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" status={u.status} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{u.title}</p>
                      </div>
                    </div>
                    {u.id === meeting.host && (
                      <Badge variant="primary" size="xs">
                        <HiBadgeCheck className="w-3 h-3" />
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
          {/* Detail Tabs: Attendance, Recordings, Chat, Polls, AI Summary */}
          <motion.div variants={itemVariants}>
            <Card padding={false}>
              <div className="p-4 pb-0">
                <Tabs
                  tabs={[
                    { id: 'attendance', label: 'Attendance', icon: HiUserGroup },
                    { id: 'recordings', label: 'Recordings', icon: HiMicrophone },
                    { id: 'chat', label: 'Chat History', icon: HiChat },
                    { id: 'polls', label: 'Polls', icon: HiChartBar },
                    { id: 'ai', label: 'AI Summary', icon: HiLightningBolt },
                  ]}
                  activeTab={detailTab}
                  onChange={(i) => setDetailTab(['attendance', 'recordings', 'chat', 'polls', 'ai'][i])}
                />
              </div>
              <div className="p-4">
                {detailTab === 'attendance' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-slate-700">
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Name</th>
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Role</th>
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Joined</th>
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Left</th>
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Duration</th>
                          <th className="text-left pb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRows.map((a, i) => (
                          <tr key={a.id || i} className="border-b border-gray-50 dark:border-slate-700/50">
                            <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{a.name}</td>
                            <td className="py-3 text-sm text-gray-600 dark:text-slate-400">{a.role}</td>
                            <td className="py-3 text-sm text-gray-600 dark:text-slate-400">{a.joined}</td>
                            <td className="py-3 text-sm text-gray-600 dark:text-slate-400">{a.left}</td>
                            <td className="py-3 text-sm text-gray-600 dark:text-slate-400">{a.duration}</td>
                            <td className="py-3">
                              <Badge variant={a.status === 'present' ? 'success' : a.status === 'left-early' ? 'warning' : a.status === 'absent' ? 'danger' : a.status === 'pending' ? 'default' : 'info'} size="xs">
                                {a.status === 'present' ? 'Present' : a.status === 'left-early' ? 'Left Early' : a.status === 'absent' ? 'Absent' : a.status === 'pending' ? 'Pending' : 'Joined Late'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {attendanceRows.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">
                              No attendance recorded for this meeting yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-sm">
                      <span className="text-gray-500 dark:text-slate-400">Total Attendance: {attendanceRows.length}</span>
                      <Button variant="ghost" size="xs" icon={HiDownload} onClick={handleExportAttendance}>Export</Button>
                    </div>
                  </div>
                )}

                {detailTab === 'recordings' && (
                  <div className="space-y-3">
                    {recordingsToShow.length > 0 ? recordingsToShow.map((rec) => (
                      <div key={rec.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                        <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                          <HiVideoCamera className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.title}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{rec.duration} · {rec.size} · {rec.date}</p>
                        </div>
                        <Button size="xs" variant="primary" icon={HiPlay} onClick={() => handlePlay(rec)}>
                          Play
                        </Button>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <HiMicrophone className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400">No recordings for this meeting</p>
                      </div>
                    )}
                  </div>
                )}

                {detailTab === 'chat' && (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {meetingChat.length === 0 && (
                      <div className="text-center py-10">
                        <HiChat className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400">No chat messages yet for this meeting</p>
                      </div>
                    )}
                    {meetingChat.map((msg) => {
                      const sender = users.find((u) => u.id === msg.userId || u.id === msg.from);
                      const senderName = msg.fromName || sender?.name || msg.from || 'User';
                      return (
                        <div key={msg.id || msg.timestamp} className="flex gap-3 p-3 rounded-xl">
                          <Avatar name={senderName} size="xs" className="mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{senderName}</span>
                              <span className="text-xs text-gray-400 dark:text-slate-500">{msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '')}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-slate-300 mt-0.5">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {detailTab === 'polls' && (
                  <div className="space-y-5">
                    {mockPolls.map((poll) => {
                      const maxVotes = Math.max(...poll.votes, 1);
                      return (
                        <div key={poll.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{poll.question}</p>
                          <div className="space-y-2">
                            {poll.options.map((opt, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700 dark:text-slate-300">{opt}</span>
                                  <span className="text-xs text-gray-500 dark:text-slate-400">{poll.votes[idx]} votes ({Math.round((poll.votes[idx] / poll.totalVotes) * 100)}%)</span>
                                </div>
                                <ProgressBar value={(poll.votes[idx] / maxVotes) * 100} variant="primary" size="sm" />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">{poll.totalVotes} total votes</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {detailTab === 'ai' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <HiLightningBolt className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Meeting Summary</span>
                      <Badge variant="warning" size="xs">Powered by AI</Badge>
                    </div>
                    <Card variant="glass" padding="sm">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Key Points</h4>
                      <ul className="space-y-2">
                        {aiSummary.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                            <HiCheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card variant="glass" padding="sm">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Decisions</h4>
                      <ul className="space-y-2">
                        {aiSummary.decisions.map((dec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                            <HiBadgeCheck className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                            {dec}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card variant="glass" padding="sm">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Action Items</h4>
                      <div className="space-y-2">
                        {aiSummary.actionItems.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.task}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Assignee: {item.owner}</p>
                            </div>
                            <Badge variant="info" size="xs">Due: {item.due}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-400 dark:text-slate-500">Sentiment: {aiSummary.sentiment === 'positive' ? 'Positive' : 'Neutral'}</span>
                      <Button variant="ghost" size="xs" icon={HiDocumentText} onClick={() => navigate(`/app/meeting/${meeting.id}/intelligence`)}>Full AI Report</Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="primary"
                  icon={copied ? HiCheckCircle : HiLink}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Link Copied!' : 'Copy Join Link'}
                </Button>
                <Button fullWidth variant="outline" icon={HiShare} onClick={handleCopyLink}>Share Meeting</Button>
                <Button fullWidth variant="secondary" icon={HiPencil} onClick={handleEdit}>Edit Meeting</Button>
                <Button
                  fullWidth
                  variant="danger"
                  icon={HiTrash}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Meeting
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
              <div className="space-y-4">
                <Toggle
                  enabled={!!meeting.recording}
                  onChange={(v) => {
                    setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, recording: v } : m)));
                    toast.success(v ? 'Recording enabled for this meeting' : 'Recording disabled for this meeting');
                  }}
                  label="Allow Recording"
                />
                {meeting.password && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 mb-1">
                      <HiLockClosed className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Password</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">{meeting.password}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText?.(meeting.password);
                          toast.success('Meeting password copied');
                        }}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Meeting"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" icon={HiTrash} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{meeting.title}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Recording Player Modal */}
      <Modal
        isOpen={showPlayer}
        onClose={() => { setShowPlayer(false); setPlayingRecording(null); }}
        title={playingRecording?.title || 'Recording'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowPlayer(false); setPlayingRecording(null); }}>Close</Button>
            <Button variant="primary" icon={HiDownload} onClick={() => handleDownloadRecording(playingRecording)}>Download</Button>
          </>
        }
      >
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          {playingRecording?.url ? (
            <ReactPlayer url={playingRecording.url} width="100%" height="100%" controls />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiPlay className="w-12 h-12 text-gray-600" />
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Meeting Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Meeting"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" icon={HiPencil} onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Meeting Title"
            placeholder="Enter meeting title"
            value={editForm.title}
            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
            error={editErrors.title}
            icon={HiVideoCamera}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description (optional)</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Add a meeting description..."
              rows={3}
              className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
              error={editErrors.date}
              icon={HiCalendar}
            />
            <Input
              label="Time"
              type="time"
              value={editForm.time}
              onChange={(e) => setEditForm((prev) => ({ ...prev, time: e.target.value }))}
              error={editErrors.time}
              icon={HiClock}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Duration</label>
              <div className="relative">
                <select
                  value={editForm.duration}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
    </>
  );
}
