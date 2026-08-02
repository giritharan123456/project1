import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiPlus, HiCalendar, HiClock, HiUsers,
  HiLink, HiTrash, HiPlay, HiSearch,
  HiRefresh, HiFolder, HiTemplate,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { loadTemplates, deleteTemplate } from '../../utils/meetingTemplates';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const statusConfig = {
  live: { label: 'Live', variant: 'success', dot: true },
  upcoming: { label: 'Upcoming', variant: 'info', dot: true },
  pending_approval: { label: 'Pending Approval', variant: 'warning', dot: true },
  completed: { label: 'Completed', variant: 'default', dot: false },
  ended: { label: 'Ended', variant: 'default', dot: false },
  cancelled: { label: 'Cancelled', variant: 'danger', dot: false },
  scheduled: { label: 'Scheduled', variant: 'primary', dot: false },
  recurring: { label: 'Recurring', variant: 'warning', dot: false },
  instant: { label: 'Instant', variant: 'info', dot: false },
};

function formatDateTime(dateStr, timeStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const date = isNaN(d) ? (dateStr || '') : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const t = new Date(`2000-01-01T${timeStr}`);
  const time = isNaN(t) ? (timeStr || '') : t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { date, time };
}

function formatDuration(minutes) {
  if (!minutes) return 'Ongoing';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
  return `${m} min`;
}

export default function MeetingsDashboard() {
  const navigate = useNavigate();
  const { meetings, users, joinMeeting, setMeetings, startMeeting, endMeeting, cancelMeeting } = useApp();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const getUser = (id) => users.find((u) => u.id === id);

  const filteredMeetings = useMemo(() => {
    let list = [...meetings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q) || m.meetingId?.toLowerCase().includes(q));
    }
    return list;
  }, [meetings, searchQuery]);

  const handleDelete = (meeting) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    setDeleteConfirm(null);
  };

  const handleCopyLink = async (meeting) => {
    const url = meeting.joinUrl || `${window.location.origin}/app/meeting/lobby/${meeting.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Meeting link copied');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
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
        toast.success('Meeting link copied');
      } else {
        toast.error('Could not copy the meeting link');
      }
    }
  };

  const handleJoin = (meeting) => {
    joinMeeting(meeting.id);
    navigate(`/app/meeting/lobby/${meeting.id}`);
  };

  const handleCardClick = (meeting) => {
    navigate(`/app/meeting/${meeting.id}`);
  };

  const handleStart = (meeting) => {
    startMeeting(meeting.id);
    toast.success('Meeting started');
  };

  const handleEnd = (meeting) => {
    endMeeting(meeting.id);
    toast.success('Meeting ended');
  };

  const handleCancel = (meeting) => {
    cancelMeeting(meeting.id);
    toast.success('Meeting cancelled');
  };

  const isHost = (meeting) => meeting.host === user?.id;

  const renderMeetingCard = (meeting) => {
    const host = getUser(meeting.host);
    const dt = formatDateTime(meeting.date, meeting.time);
    const cfg = statusConfig[meeting.status] || statusConfig.upcoming;
    const participantUsers = meeting.participants.slice(0, 5);

    return (
      <motion.div key={meeting.id} variants={itemVariants}>
        <Card hover className="group relative overflow-hidden" onClick={() => handleCardClick(meeting)}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/20 dark:to-violet-900/20 flex items-center justify-center">
              <HiVideoCamera className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{meeting.title}</h3>
                <Badge variant={cfg.variant} size="sm" dot={cfg.dot}>{cfg.label}</Badge>
                {meeting.type === 'recurring' && (
                  <Badge variant="warning" size="sm">
                    <HiRefresh className="w-3 h-3" />
                    Recurring
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HiCalendar className="w-3.5 h-3.5" />
                  {dt.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiClock className="w-3.5 h-3.5" />
                  {dt.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiClock className="w-3.5 h-3.5" />
                  {formatDuration(meeting.duration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiUsers className="w-3.5 h-3.5" />
                  {meeting.participants.length} participants
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center -space-x-2 mr-2">
              {participantUsers.map((pid) => {
                const u = getUser(pid);
                return u ? (
                  <Avatar key={pid} src={u.avatar} name={u.name} size="sm" className="ring-2 ring-white dark:ring-slate-800" />
                ) : null;
              })}
              {meeting.participants.length > 5 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400">
                  +{meeting.participants.length - 5}
                </div>
              )}
            </div>
          </div>
          {/* Action buttons - shown on hover */}
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {(meeting.status === 'live' || meeting.status === 'upcoming') && (
              <Button size="xs" variant="primary" icon={HiPlay} onClick={(e) => { e.stopPropagation(); handleJoin(meeting); }}>
                Join
              </Button>
            )}
            {isHost(meeting) && ['upcoming', 'pending_approval'].includes(meeting.status) && (
              <Button size="xs" variant="primary" icon={HiPlay} onClick={(e) => { e.stopPropagation(); handleStart(meeting); }}>
                Start
              </Button>
            )}
            {isHost(meeting) && meeting.status === 'live' && (
              <Button size="xs" variant="secondary" icon={HiClock} onClick={(e) => { e.stopPropagation(); handleEnd(meeting); }}>
                End
              </Button>
            )}
            {isHost(meeting) && ['upcoming', 'pending_approval'].includes(meeting.status) && (
              <Button size="xs" variant="ghost" icon={HiTrash} onClick={(e) => { e.stopPropagation(); handleCancel(meeting); }} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                Cancel
              </Button>
            )}
            <Button size="xs" variant="ghost" icon={HiLink} onClick={(e) => { e.stopPropagation(); handleCopyLink(meeting); }} />
            <Button size="xs" variant="ghost" icon={HiTrash} onClick={(e) => { e.stopPropagation(); setDeleteConfirm(meeting); }} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              {host && <Avatar src={host.avatar} name={host.name} size="xs" />}
              {host?.name || 'Unknown'}
            </span>
            {meeting.password && (
              <Badge variant="warning" size="sm">Password protected</Badge>
            )}
            {meeting.recording && (
              <Badge variant="danger" size="sm" dot>Recording</Badge>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const tabContent = (meetingList) => {
    if (meetingList.length === 0) {
      return <EmptyState icon={HiVideoCamera} title="No meetings found" description="Schedule or start a new meeting to get started" />;
    }
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
        {meetingList.map(renderMeetingCard)}
      </motion.div>
    );
  };

  const tabs = [
    {
      label: 'All',
      icon: <HiVideoCamera className="w-4 h-4" />,
      key: 'all',
      content: tabContent(filteredMeetings),
    },
    {
      label: 'Live',
      icon: <HiPlay className="w-4 h-4" />,
      key: 'live',
      content: tabContent(filteredMeetings.filter((m) => m.status === 'live')),
    },
    {
      label: 'Scheduled',
      icon: <HiCalendar className="w-4 h-4" />,
      key: 'scheduled',
      content: tabContent(filteredMeetings.filter((m) => m.status === 'upcoming' && m.type !== 'recurring')),
    },
    {
      label: 'Templates',
      icon: <HiTemplate className="w-4 h-4" />,
      key: 'templates',
      content: templates.length === 0
        ? <EmptyState icon={HiTemplate} title="No templates yet" description="Save a meeting as a reusable template from the Schedule page, then start future meetings from it in one click" />
        : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {templates.map((t) => (
              <Card key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
                    <HiTemplate className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {t.duration || 30} min · {t.recurring && t.recurring !== 'none' ? `Recurs ${t.recurring}` : 'One-time'} · {t.participantIds?.length || 0} participants
                      {t.description ? ` · ${t.description}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="primary" icon={HiPlus} onClick={() => navigate(`/app/schedule?template=${t.id}`)}>
                    Use Template
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={HiTrash}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => { setTemplates(deleteTemplate(t.id)); toast.success('Template deleted'); }}
                    title="Delete template"
                  />
                </div>
              </Card>
            ))}
          </motion.div>
        ),
    },
    {
      label: 'Pending Approval',
      icon: <HiClock className="w-4 h-4" />,
      key: 'pending_approval',
      content: tabContent(filteredMeetings.filter((m) => m.status === 'pending_approval')),
    },
    {
      label: 'Recurring',
      icon: <HiRefresh className="w-4 h-4" />,
      key: 'recurring',
      content: tabContent(filteredMeetings.filter((m) => m.type === 'recurring')),
    },
    {
      label: 'Instant',
      icon: <HiPlay className="w-4 h-4" />,
      key: 'instant',
      content: tabContent(filteredMeetings.filter((m) => m.type === 'instant')),
    },
    {
      label: 'Completed',
      icon: <HiFolder className="w-4 h-4" />,
      key: 'completed',
      content: tabContent(filteredMeetings.filter((m) => m.status === 'completed' || m.status === 'ended')),
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {meetings.length} total meetings · {meetings.filter((m) => m.status === 'live').length} live now · {meetings.filter((m) => m.status === 'pending_approval').length} awaiting approval
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={HiPlus} size="md" onClick={() => navigate('/app/schedule')}>
            New Meeting
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Input
          icon={HiSearch}
          placeholder="Search meetings by title or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs tabs={tabs} defaultTab={0} />
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Meeting"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" icon={HiTrash} onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deleteConfirm?.title}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </motion.div>
  );
}
