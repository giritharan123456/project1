import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiBell, HiClock, HiVideoCamera, HiMicrophone, HiDocumentText, HiChatAlt2, HiInformationCircle, HiVolumeUp, HiExclamation } from 'react-icons/hi';
import PropTypes from 'prop-types';

const iconMap = {
  meeting_reminder: { icon: HiClock, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  meeting_invitation: { icon: HiVideoCamera, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  recording_ready: { icon: HiMicrophone, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  file_shared: { icon: HiDocumentText, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  chat_notification: { icon: HiChatAlt2, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  system: { icon: HiInformationCircle, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30' },
  announcement: { icon: HiVolumeUp, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  urgent: { icon: HiExclamation, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
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

const NotificationCenter = memo(function NotificationCenter({ notifications = [], unreadCount = 0, onMarkRead, onMarkReadOne, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recent = notifications.slice(0, 5);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)} aria-label={`Notifications (${unreadCount} unread)`} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
        <HiBell className="w-5 h-5 text-gray-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={() => onMarkRead?.()} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <HiBell className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {recent.map((n) => {
                    const meta = iconMap[n.type] || { icon: HiBell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
                    const Icon = meta.icon;
                    return (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => { if (!n.read) onMarkReadOne?.(n.id); setOpen(false); }}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center ${meta.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${n.priority === 'urgent' ? 'text-red-600 dark:text-red-400 font-medium' : n.read ? 'text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-white font-medium'}`}>{n.title}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{formatRelativeTime(n.time)}</p>
                        </div>
                        {!n.read && <span className={`w-1.5 h-1.5 rounded-full ${n.priority === 'urgent' ? 'bg-red-500' : 'bg-primary-500'} flex-shrink-0 mt-1.5`} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <Link to="/app/notifications" onClick={() => setOpen(false)} className="block text-center text-sm font-medium text-primary-600 dark:text-primary-400 py-3 border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

NotificationCenter.propTypes = {
  notifications: PropTypes.array,
  unreadCount: PropTypes.number,
  onMarkRead: PropTypes.func,
  onMarkReadOne: PropTypes.func,
  className: PropTypes.string,
};

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
