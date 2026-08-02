import { motion } from 'framer-motion';
import { HiBell, HiUser, HiVideoCamera, HiChatAlt2, HiClock } from 'react-icons/hi';
import { useApp } from '../../context/AppContext';
import Badge from '../ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ActivityFeed() {
  const { activityLog } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'notification': return HiBell;
      case 'message': return HiChatAlt2;
      case 'meeting': return HiVideoCamera;
      default: return HiUser;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'notification': return 'text-primary-500 bg-primary-50 dark:bg-primary-500/10';
      case 'message': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'meeting': return 'text-violet-500 bg-violet-50 dark:bg-violet-500/10';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Activity</h3>
        <Badge variant="info" size="sm">{activityLog.length} updates</Badge>
      </div>
      
      {activityLog.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          <HiBell className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-3 max-h-96 overflow-y-auto"
        >
          {activityLog.slice(0, 10).map((activity) => {
            const Icon = getIcon(activity.type);
            const colorClass = getColor(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {activity.user}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">
                      {activity.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <HiClock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
