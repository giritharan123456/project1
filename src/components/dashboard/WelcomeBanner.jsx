import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

export default function WelcomeBanner({ user, role }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <Avatar name={user?.name || 'User'} size="lg" status="online" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-400 dark:to-primary-200">{user?.name || 'User'}</span>!
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>{today}</span>
            <Badge variant="primary" size="sm">{role}</Badge>
          </p>
        </div>
      </div>
    </motion.div>
  );
}