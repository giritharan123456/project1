import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSave, HiCog, HiShieldCheck, HiVideoCamera, HiBell, HiDatabase, HiLink } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const timezoneOptions = [
  { value: 'utc', label: 'UTC (Coordinated Universal Time)' },
  { value: 'america/new_york', label: 'America/New_York (EST)' },
  { value: 'america/chicago', label: 'America/Chicago (CST)' },
  { value: 'america/denver', label: 'America/Denver (MST)' },
  { value: 'america/los_angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'europe/london', label: 'Europe/London (GMT)' },
  { value: 'europe/berlin', label: 'Europe/Berlin (CET)' },
  { value: 'asia/dubai', label: 'Asia/Dubai (GST)' },
  { value: 'asia/tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'asia/kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'australia/sydney', label: 'Australia/Sydney (AEST)' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const dateFormatOptions = [
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy' },
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd' },
  { value: 'dd.MM.yyyy', label: 'dd.MM.yyyy' },
  { value: 'MMM dd, yyyy', label: 'MMM dd, yyyy' },
];

const initialGeneral = { companyName: 'AdzConnect', timezone: 'utc', language: 'en', dateFormat: 'MM/dd/yyyy' };
const initialSecurity = { minPasswordLength: 8, passwordExpiryDays: 90, sessionTimeoutMinutes: 30, maxLoginAttempts: 5, enforce2FA: false, requireOTP: false };
const initialMeeting = { maxMeetingDuration: 60, defaultRecording: true, autoGenerateSummary: false, maxParticipants: 100, defaultBackgroundBlur: false };
const initialNotifications = { emailNotifications: true, pushNotifications: true, smsNotifications: false, digestEmails: false };
const initialStorage = { maxFileUploadSize: 25, storageLimit: 100, autoDeleteRecordings: false, autoDeleteDays: 30 };
const initialIntegrations = { googleCalendar: true, outlookCalendar: false, slack: true, zoom: false, webex: false, teams: true, salesforce: false, hubspot: false };

const STORAGE_KEY = 'connectly-platform-settings';

const defaultSettings = {
  general: initialGeneral,
  security: initialSecurity,
  meeting: initialMeeting,
  notifications: initialNotifications,
  storage: initialStorage,
  integrations: initialIntegrations,
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        general: { ...initialGeneral, ...parsed.general },
        security: { ...initialSecurity, ...parsed.security },
        meeting: { ...initialMeeting, ...parsed.meeting },
        notifications: { ...initialNotifications, ...parsed.notifications },
        storage: { ...initialStorage, ...parsed.storage },
        integrations: { ...initialIntegrations, ...parsed.integrations },
      };
    }
  } catch {}
  return defaultSettings;
}

export default function PlatformSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const update = (section, patch) => setSettings((p) => ({ ...p, [section]: { ...p[section], ...patch } }));

  const handleSave = (section, label) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist platform settings', e);
    }
    toast.success(`${label} saved successfully`);
  };

  const renderSectionHeader = (icon, title, color) => {
    const colorClasses = {
      primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    };
    const Icon = icon;
    return (
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color] || colorClasses.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Configure {title.toLowerCase()}</p>
        </div>
      </div>
    );
  };

  const renderSaveButton = (section, label) => (
    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700/50 mt-6">
      <Button variant="primary" icon={HiSave} onClick={() => handleSave(section, label)}>Save {label}</Button>
    </div>
  );

  const { general, security, meeting, notifications, storage, integrations } = settings;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Platform Settings - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your enterprise platform configuration</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="space-y-6">
          {renderSectionHeader(HiCog, 'General Settings', 'primary')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Company Name" value={general.companyName} onChange={(e) => update('general', { companyName: e.target.value })} />
            <Select label="Timezone" value={general.timezone} onChange={(e) => update('general', { timezone: e.target.value })} options={timezoneOptions} />
            <Select label="Language" value={general.language} onChange={(e) => update('general', { language: e.target.value })} options={languageOptions} />
            <Select label="Date Format" value={general.dateFormat} onChange={(e) => update('general', { dateFormat: e.target.value })} options={dateFormatOptions} />
          </div>
          {renderSaveButton('general', 'General Settings')}
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="space-y-6">
          {renderSectionHeader(HiShieldCheck, 'Security Settings', 'violet')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Min Password Length" type="number" value={security.minPasswordLength} onChange={(e) => update('security', { minPasswordLength: Number(e.target.value) })} />
            <Input label="Password Expiry (days)" type="number" value={security.passwordExpiryDays} onChange={(e) => update('security', { passwordExpiryDays: Number(e.target.value) })} />
            <Input label="Session Timeout (minutes)" type="number" value={security.sessionTimeoutMinutes} onChange={(e) => update('security', { sessionTimeoutMinutes: Number(e.target.value) })} />
            <Input label="Max Login Attempts" type="number" value={security.maxLoginAttempts} onChange={(e) => update('security', { maxLoginAttempts: Number(e.target.value) })} />
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <Toggle enabled={security.enforce2FA} onChange={(v) => update('security', { enforce2FA: v })} label="Enforce 2FA" />
            <Toggle enabled={security.requireOTP} onChange={(v) => update('security', { requireOTP: v })} label="Require OTP" />
          </div>
          {renderSaveButton('security', 'Security Settings')}
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="space-y-6">
          {renderSectionHeader(HiVideoCamera, 'Meeting Settings', 'emerald')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input label="Max Meeting Duration (min)" type="number" value={meeting.maxMeetingDuration} onChange={(e) => update('meeting', { maxMeetingDuration: Number(e.target.value) })} />
            <Input label="Max Participants" type="number" value={meeting.maxParticipants} onChange={(e) => update('meeting', { maxParticipants: Number(e.target.value) })} />
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <Toggle enabled={meeting.defaultRecording} onChange={(v) => update('meeting', { defaultRecording: v })} label="Default Recording" />
            <Toggle enabled={meeting.autoGenerateSummary} onChange={(v) => update('meeting', { autoGenerateSummary: v })} label="Auto-Generate Summary" />
            <Toggle enabled={meeting.defaultBackgroundBlur} onChange={(v) => update('meeting', { defaultBackgroundBlur: v })} label="Default Background Blur" />
          </div>
          {renderSaveButton('meeting', 'Meeting Settings')}
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="space-y-6">
          {renderSectionHeader(HiBell, 'Notification Settings', 'amber')}
          <div className="flex flex-wrap gap-6">
            <Toggle enabled={notifications.emailNotifications} onChange={(v) => update('notifications', { emailNotifications: v })} label="Email Notifications" />
            <Toggle enabled={notifications.pushNotifications} onChange={(v) => update('notifications', { pushNotifications: v })} label="Push Notifications" />
            <Toggle enabled={notifications.smsNotifications} onChange={(v) => update('notifications', { smsNotifications: v })} label="SMS Notifications" />
            <Toggle enabled={notifications.digestEmails} onChange={(v) => update('notifications', { digestEmails: v })} label="Digest Emails" />
          </div>
          {renderSaveButton('notifications', 'Notification Settings')}
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="space-y-6">
          {renderSectionHeader(HiDatabase, 'Storage Settings', 'sky')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Max File Upload Size (MB)" type="number" value={storage.maxFileUploadSize} onChange={(e) => update('storage', { maxFileUploadSize: Number(e.target.value) })} />
            <Input label="Storage Limit (GB)" type="number" value={storage.storageLimit} onChange={(e) => update('storage', { storageLimit: Number(e.target.value) })} />
            <div className="flex items-end pb-2.5">
              <Toggle enabled={storage.autoDeleteRecordings} onChange={(v) => update('storage', { autoDeleteRecordings: v })} label="Auto-Delete Recordings" />
            </div>
          </div>
          {storage.autoDeleteRecordings && (
            <div className="ml-1">
              <Input label="Auto-Delete After (days)" type="number" value={storage.autoDeleteDays} onChange={(e) => update('storage', { autoDeleteDays: Number(e.target.value) })} />
            </div>
          )}
          {renderSaveButton('storage', 'Storage Settings')}
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="space-y-6">
          {renderSectionHeader(HiLink, 'Integrations', 'indigo')}
          <div className="flex flex-wrap gap-6">
            <Toggle enabled={integrations.googleCalendar} onChange={(v) => update('integrations', { googleCalendar: v })} label="Google Calendar" />
            <Toggle enabled={integrations.outlookCalendar} onChange={(v) => update('integrations', { outlookCalendar: v })} label="Outlook Calendar" />
            <Toggle enabled={integrations.slack} onChange={(v) => update('integrations', { slack: v })} label="Slack" />
            <Toggle enabled={integrations.zoom} onChange={(v) => update('integrations', { zoom: v })} label="Zoom" />
            <Toggle enabled={integrations.webex} onChange={(v) => update('integrations', { webex: v })} label="Cisco Webex" />
            <Toggle enabled={integrations.teams} onChange={(v) => update('integrations', { teams: v })} label="Microsoft Teams" />
            <Toggle enabled={integrations.salesforce} onChange={(v) => update('integrations', { salesforce: v })} label="Salesforce" />
            <Toggle enabled={integrations.hubspot} onChange={(v) => update('integrations', { hubspot: v })} label="HubSpot" />
          </div>
          {renderSaveButton('integrations', 'Integrations')}
        </Card>
      </motion.div>
    </motion.div>
  );
}
