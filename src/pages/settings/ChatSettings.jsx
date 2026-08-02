import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSave } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';

const retentionOptions = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: 'forever', label: 'Forever' },
];

const themeOptions = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

const fontSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const STORAGE_KEY = 'connectly-chat-settings';

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    messageRetention: '90',
    typingIndicators: true,
    readReceipts: true,
    notificationSounds: true,
    enterToSend: true,
    chatTheme: 'system',
    fontSize: 'medium',
  };
}

export default function ChatSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const update = (patch) => setSettings((p) => ({ ...p, ...patch }));

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist chat settings', e);
    }
    toast.success('Chat settings saved successfully');
  };

  return (
    <>
      <Helmet>
        <title>Chat Settings - AdzConnect</title>
        <meta name="description" content="Configure your chat and messaging preferences on AdzConnect." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Chat Settings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your chat and messaging preferences</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Message Retention</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Choose how long messages are kept</p>
            <select
              value={settings.messageRetention}
              onChange={(e) => update({ messageRetention: e.target.value })}
              className="block w-full max-w-xs rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {retentionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Chat Behavior</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Toggle enabled={settings.typingIndicators} onChange={(v) => update({ typingIndicators: v })} label="Show typing indicators" />
              </div>
              <div className="flex items-center justify-between">
                <Toggle enabled={settings.readReceipts} onChange={(v) => update({ readReceipts: v })} label="Send read receipts" />
              </div>
              <div className="flex items-center justify-between">
                <Toggle enabled={settings.notificationSounds} onChange={(v) => update({ notificationSounds: v })} label="Notification sounds" />
              </div>
              <div className="flex items-center justify-between">
                <Toggle enabled={settings.enterToSend} onChange={(v) => update({ enterToSend: v })} label="Press Enter to send" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Choose your chat appearance</p>
            <div className="flex gap-3">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update({ chatTheme: t.id })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.chatTheme === t.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Font Size</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Adjust message text size</p>
            <div className="flex gap-3">
              {fontSizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => update({ fontSize: s.value })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    settings.fontSize === s.value
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
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
