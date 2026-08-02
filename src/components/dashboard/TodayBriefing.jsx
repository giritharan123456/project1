import { motion } from 'framer-motion';
import { HiClock, HiUsers, HiVideoCamera, HiCheckCircle } from 'react-icons/hi';

export default function TodayBriefing({ metrics }) {
  const meetingsToday = metrics?.meetingsToday || 0;
  const activeUsers = metrics?.activeUsers || 0;
  const tasksCompleted = metrics?.tasksCompleted || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {[
        { label: 'Meetings Today', value: meetingsToday, icon: HiVideoCamera, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'Active Now', value: activeUsers, icon: HiUsers, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { label: 'Tasks Done', value: tasksCompleted, icon: HiCheckCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { label: 'Uptime', value: `${metrics?.systemUptime?.toFixed(1) || '99.9'}%`, icon: HiClock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className={`p-2 rounded-lg ${item.bg}`}>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{item.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}