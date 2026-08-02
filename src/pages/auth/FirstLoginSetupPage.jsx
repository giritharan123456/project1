import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiSun, HiMoon, HiCamera, HiBell,
  HiMail, HiCalendar, HiMicrophone,
  HiVideoCamera, HiSparkles,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const preferences = [
  { id: 'emailNotifications', label: 'Email notifications', icon: HiMail, desc: 'Receive meeting summaries and updates via email' },
  { id: 'pushNotifications', label: 'Push notifications', icon: HiBell, desc: 'Get notified when someone starts a meeting' },
  { id: 'calendarSync', label: 'Calendar sync', icon: HiCalendar, desc: 'Auto-sync meetings with your calendar' },
  { id: 'micAutoJoin', label: 'Mic auto-join', icon: HiMicrophone, desc: 'Automatically mute microphone on join' },
  { id: 'camAutoJoin', label: 'Camera auto-join', icon: HiVideoCamera, desc: 'Automatically turn off camera on join' },
];

export default function FirstLoginSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAuthStep, AUTH_STEPS } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    calendarSync: false,
    micAutoJoin: true,
    camAutoJoin: false,
    meetingDuration: '30',
    defaultView: 'grid',
    recordingQuality: 'hd',
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (id) => setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectTheme = (value) => {
    setTheme(value);
    try {
      if (value === 'system') {
        localStorage.removeItem('connectly-theme');
      } else {
        localStorage.setItem('connectly-theme', value);
      }
    } catch {}
    if (value !== 'system') {
      if (isDark !== (value === 'dark')) toggleTheme();
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark !== prefersDark) toggleTheme();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setAuthStep(AUTH_STEPS.DASHBOARD);
      toast.success('Setup complete! Welcome to AdzConnect');
      navigate('/app/home');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <Helmet>
        <title>First Time Setup - AdzConnect</title>
        <meta name="description" content="Set up your AdzConnect account preferences, devices, and workspace settings for the first time." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <HiSparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">Welcome to Connectly!</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-slate-400">Let&apos;s get your workspace set up</p>
        </motion.div>

        <div className="space-y-8">
          {/* Avatar */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Your profile</h2>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <button
                  onClick={() => toast.success('Upload dialog opened')}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HiCamera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-slate-100">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email || 'user@company.com'}</p>
                <button onClick={() => toast.success('Upload dialog opened')} className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                  <HiCamera className="w-4 h-4" />
                  Upload photo
                </button>
              </div>
            </div>
          </motion.div>

          {/* Theme */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Appearance</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => selectTheme('light')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}`}
              >
                <HiSun className={`w-5 h-5 ${theme === 'light' ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-slate-300'}`}>Light</span>
              </button>
              <button
                onClick={() => selectTheme('dark')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}`}
              >
                <HiMoon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-slate-300'}`}>Dark</span>
              </button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Notifications</h2>
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <pref.icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{pref.label}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{pref.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(pref.id)}
                    className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${settings[pref.id] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                  >
                    <motion.div
                      animate={{ x: settings[pref.id] ? 18 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Meeting Preferences */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Meeting preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Default meeting duration</label>
                <select
                  value={settings.meetingDuration}
                  onChange={(e) => setSettings({ ...settings, meetingDuration: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Default gallery view</label>
                <select
                  value={settings.defaultView}
                  onChange={(e) => setSettings({ ...settings, defaultView: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="grid">Grid view</option>
                  <option value="speaker">Speaker view</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Recording quality</label>
                <select
                  value={settings.recordingQuality}
                  onChange={(e) => setSettings({ ...settings, recordingQuality: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="sd">Standard (480p)</option>
                  <option value="hd">HD (720p)</option>
                  <option value="fullHd">Full HD (1080p)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Next */}
          <motion.div variants={itemVariants}>
            <Button onClick={handleComplete} fullWidth loading={isLoading} size="lg">
              Complete Setup
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
