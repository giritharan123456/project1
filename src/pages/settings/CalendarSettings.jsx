import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSave } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const defaultViews = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const durations = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
];

const timeZones = [
  '(UTC-8:00) Pacific Time',
  '(UTC-7:00) Mountain Time',
  '(UTC-6:00) Central Time',
  '(UTC-5:00) Eastern Time',
  '(UTC+0:00) UTC',
  '(UTC+1:00) Central European Time',
  '(UTC+5:30) India Standard Time',
  '(UTC+8:00) China Standard Time',
  '(UTC+9:00) Japan Standard Time',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const STORAGE_KEY = 'connectly-calendar-settings';

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    defaultView: 'week',
    workStart: '09:00',
    workEnd: '17:00',
    workingDays: [true, true, true, true, true, false, false],
    defaultDuration: '30',
    timeZone: '(UTC-5:00) Eastern Time',
    syncGoogle: false,
    syncOutlook: false,
  };
}

export default function CalendarSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const update = (patch) => setSettings((p) => ({ ...p, ...patch }));

  const toggleDay = (index) => {
    setSettings((prev) => ({ ...prev, workingDays: prev.workingDays.map((d, i) => (i === index ? !d : d)) }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist calendar settings', e);
    }
    toast.success('Calendar settings saved successfully');
  };

  const { defaultView, workStart, workEnd, workingDays, defaultDuration, timeZone, syncGoogle, syncOutlook } = settings;

  return (
    <>
      <Helmet>
        <title>Calendar Settings - AdzConnect</title>
        <meta name="description" content="Configure your calendar integration preferences on AdzConnect." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Calendar Settings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your calendar integration preferences</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Default View</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Choose your default calendar view</p>
            <div className="flex gap-3">
              {defaultViews.map((v) => (
                <button
                  key={v.id}
                  onClick={() => update({ defaultView: v.id })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    defaultView === v.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Working Hours</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Set your availability for meetings</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => update({ workStart: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">End Time</label>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => update({ workEnd: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Working Days</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Select your working days</p>
            <div className="flex flex-wrap gap-3">
              {daysOfWeek.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    workingDays[i]
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Default Meeting Duration</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Set the default length for new meetings</p>
            <select
              value={defaultDuration}
              onChange={(e) => update({ defaultDuration: e.target.value })}
              className="block w-full max-w-xs rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {durations.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Time Zone</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Select your preferred time zone</p>
            <select
              value={timeZone}
              onChange={(e) => update({ timeZone: e.target.value })}
              className="block w-full max-w-md rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Sync Calendars</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Connect your external calendars</p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Toggle enabled={syncGoogle} onChange={(v) => update({ syncGoogle: v })} label="Google Calendar" />
              </div>
              <div className="flex items-center justify-between">
                <Toggle enabled={syncOutlook} onChange={(v) => update({ syncOutlook: v })} label="Outlook Calendar" />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button icon={HiSave} onClick={handleSave}>Save Changes</Button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
