import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiBell, HiCheck, HiX, HiClock, HiVideoCamera,
  HiMicrophone, HiDocumentText, HiChatAlt2, HiCog,
  HiUserAdd, HiCalendar, HiVolumeUp, HiInformationCircle, HiExclamation,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';

const iconMap = {
  meeting_reminder: { icon: HiClock, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  meeting_invitation: { icon: HiCalendar, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  recording_ready: { icon: HiMicrophone, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  file_shared: { icon: HiDocumentText, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  chat_notification: { icon: HiChatAlt2, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  missed_meeting: { icon: HiVideoCamera, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  system: { icon: HiInformationCircle, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  announcement: { icon: HiVolumeUp, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  urgent: { icon: HiExclamation, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  join_alert: { icon: HiUserAdd, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const typeCategoryMap = {
  meeting_reminder: 'meeting',
  meeting_invitation: 'meeting',
  recording_ready: 'files',
  file_shared: 'files',
  chat_notification: 'messages',
  missed_meeting: 'meeting',
  system: 'system',
  announcement: 'system',
  join_alert: 'meeting',
};

function formatRelativeTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead, getCurrentUser } = useApp();
  const [dismissed, setDismissed] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);

  const filteredNotifications = useMemo(() => {
    const currentUser = getCurrentUser();
    const role = currentUser?.role?.toLowerCase();
    const userId = currentUser?.id;
    let list = notifications.filter((n) => !dismissed.has(n.id));

    // Filter by targetRoles, targetUser, or userId targeting
    list = list.filter((n) => {
      if (n.targetRoles && Array.isArray(n.targetRoles)) {
        return n.targetRoles.includes(role);
      }
      if (n.targetUser) {
        return n.targetUser === currentUser?.email || n.targetUser === userId;
      }
      if (n.userId) {
        return n.userId === userId || n.userId === 'all';
      }
      return false;
    });

    const category = ['all', 'unread', 'meeting', 'files', 'messages', 'system'][activeTab];
    if (category === 'unread') list = list.filter((n) => !n.read);
    if (category !== 'all' && category !== 'unread') {
      list = list.filter((n) => typeCategoryMap[n.type] === category);
    }
    return list;
  }, [notifications, dismissed, activeTab, getCurrentUser]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleClick = (n) => {
    if (!n.read) markNotificationRead(n.id);
    if (n.link) {
      const link = n.link.startsWith('/app/') ? n.link : `/app/${n.link.replace(/^\//, '')}`;
      navigate(link);
    }
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    setDismissed((prev) => new Set([...prev, id]));
  };

  const tabs = [
    {
      key: 'all', label: 'All',
      content: (
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={HiBell} title="All caught up!" description="You have no notifications at the moment" />
          ) : (
            <motion.div key="all" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((n) => {
                const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      n.read
                        ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }${n.priority === 'urgent' ? ' ring-2 ring-red-500/40 border border-red-500/40' : ''}`}
                  >
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm truncate ${n.read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                            {n.title}
                          </h4>
                          {!n.read && <span className={`w-2 h-2 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0`} />}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600 dark:text-slate-300'}`}>
                        {n.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
    {
      key: 'unread', label: 'Unread',
      content: (
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={HiCheck} title="No unread notifications" description="You've read everything" />
          ) : (
            <motion.div key="unread" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((n) => {
                const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20${n.priority === 'urgent' ? ' ring-2 ring-red-500/40 border border-red-500/40' : ''}`}
                  >
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{n.title}</h4>
                          <span className={`w-2 h-2 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0`} />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5 text-gray-600 dark:text-slate-300">{n.description}</p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
    {
      key: 'meeting', label: 'Meeting',
      content: (
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={HiVideoCamera} title="No meeting notifications" description="Meeting updates will appear here" />
          ) : (
            <motion.div key="meeting" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((n) => {
                const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      n.read
                        ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }${n.priority === 'urgent' ? ' ring-2 ring-red-500/40 border border-red-500/40' : ''}`}
                  >
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm truncate ${n.read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                            {n.title}
                          </h4>
                          {!n.read && <span className={`w-2 h-2 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0`} />}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600 dark:text-slate-300'}`}>
                        {n.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
    {
      key: 'files', label: 'Files',
      content: (
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={HiDocumentText} title="No file notifications" description="File sharing updates will appear here" />
          ) : (
            <motion.div key="files" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((n) => {
                const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      n.read
                        ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }${n.priority === 'urgent' ? ' ring-2 ring-red-500/40 border border-red-500/40' : ''}`}
                  >
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm truncate ${n.read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                            {n.title}
                          </h4>
                          {!n.read && <span className={`w-2 h-2 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0`} />}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600 dark:text-slate-300'}`}>
                        {n.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
    {
      key: 'messages', label: 'Messages',
      content: (
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={HiChatAlt2} title="No message notifications" description="Chat notifications will appear here" />
          ) : (
            <motion.div key="messages" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((n) => {
                const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      n.read
                        ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }${n.priority === 'urgent' ? ' ring-2 ring-red-500/40 border border-red-500/40' : ''}`}
                  >
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm truncate ${n.read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                            {n.title}
                          </h4>
                          {!n.read && <span className={`w-2 h-2 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0`} />}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600 dark:text-slate-300'}`}>
                        {n.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
    {
      key: 'system', label: 'System',
      content: (
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <EmptyState icon={HiCog} title="No system notifications" description="System and announcement updates will appear here" />
          ) : (
            <motion.div key="system" variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((n) => {
                const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={n.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handleClick(n)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      n.read
                        ? 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        : 'bg-primary-50/50 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }${n.priority === 'urgent' ? ' ring-2 ring-red-500/40 border border-red-500/40' : ''}`}
                  >
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={`text-sm truncate ${n.read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                            {n.title}
                          </h4>
                          {!n.read && <span className={`w-2 h-2 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0`} />}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 ${n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-600 dark:text-slate-300'}`}>
                        {n.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDismiss(e, n.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Notifications - AdzConnect</title>
        <meta name="description" content="View and manage your AdzConnect notifications including meeting reminders, invitations, and updates." />
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <HiBell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={HiCheck} onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} defaultTab={0} onChange={(i) => setActiveTab(i)} />
    </motion.div>
  );
}
