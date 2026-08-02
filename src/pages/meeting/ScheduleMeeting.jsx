import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiVideoCamera, HiCalendar, HiClock, HiUsers, HiLockClosed,
  HiX, HiChevronDown,
  HiArrowLeft, HiCheckCircle, HiTemplate,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import { loadTemplates, saveTemplate } from '../../utils/meetingTemplates';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const RECURRING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { users, scheduleMeeting, getCurrentUser } = useApp();

  const [templates, setTemplates] = useState(loadTemplates);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    recurring: 'none',
    password: '',
    requirePassword: false,
    waitingRoom: false,
    allowRecording: false,
  });

  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const applyTemplate = (tpl) => {
    setForm((prev) => ({
      ...prev,
      title: tpl.title || prev.title,
      description: tpl.description || prev.description,
      duration: tpl.duration || prev.duration,
      recurring: tpl.recurring || 'none',
      password: tpl.password || '',
      requirePassword: tpl.requirePassword || false,
      waitingRoom: tpl.waitingRoom || false,
      allowRecording: tpl.allowRecording || false,
    }));
    setSelectedParticipants(tpl.participantIds || []);
    toast.success(`Template "${tpl.name}" loaded`);
  };

  useEffect(() => {
    const tplId = searchParams.get('template');
    if (!tplId) return;
    const tpl = loadTemplates().find((t) => t.id === tplId);
    if (tpl) applyTemplate(tpl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const availableUsers = users.filter(
    (u) => !selectedParticipants.includes(u.id) && u.name.toLowerCase().includes(participantSearch.toLowerCase()),
  );

  const handleSubmit = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.time) errs.time = 'Time is required';
    if (form.requirePassword && !form.password.trim()) errs.password = 'Password is required for a password-protected meeting';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const currentUser = getCurrentUser();
    const { requirePassword: _requirePassword, ...meetingData } = form;
    scheduleMeeting({
      ...meetingData,
      type: form.recurring !== 'none' ? 'recurring' : 'scheduled',
      participants: selectedParticipants,
    }, { id: currentUser?.id, role: currentUser?.role, name: currentUser?.name });

    if (saveAsTemplate) {
      const next = saveTemplate({
        name: templateName.trim() || form.title.trim(),
        title: form.title.trim(),
        description: form.description,
        duration: form.duration,
        recurring: form.recurring,
        password: form.password,
        requirePassword: form.requirePassword,
        waitingRoom: form.waitingRoom,
        allowRecording: form.allowRecording,
        participantIds: selectedParticipants,
      });
      setTemplates(next);
      toast.success('Meeting saved as a template');
    }

    setSubmitted(true);
    setTimeout(() => navigate('/app/meetings'), 2000);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meeting Scheduled!</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6">Your meeting has been created successfully.</p>
        <Badge variant="success" size="lg">{form.title}</Badge>
        <div className="mt-8">
          <Button onClick={() => navigate('/app/meetings')}>Go to Meetings</Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <title>Schedule Meeting - AdzConnect</title>
      <meta name="description" content="Schedule a new AdzConnect meeting. Set the title, date, time, participants, and meeting options." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => navigate('/app/meetings')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors mb-4"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Meetings
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/20 dark:to-violet-900/20 flex items-center justify-center">
            <HiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule a Meeting</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Set up your meeting details</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <div className="space-y-6">
            {/* Template */}
            {templates.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Start from a Template</label>
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      const tpl = templates.find((t) => t.id === e.target.value);
                      if (tpl) applyTemplate(tpl);
                    }}
                    className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a template…</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <HiTemplate className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Title */}
            <Input
              label="Meeting Title"
              placeholder="Enter meeting title"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
              icon={HiVideoCamera}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Add a meeting description..."
                rows={3}
                className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
              />
            </div>

            {/* Date, Time, Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                error={errors.date}
                icon={HiCalendar}
              />
              <Input
                label="Time"
                type="time"
                value={form.time}
                onChange={(e) => updateField('time', e.target.value)}
                error={errors.time}
                icon={HiClock}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Duration</label>
                <div className="relative">
                  <select
                    value={form.duration}
                    onChange={(e) => updateField('duration', parseInt(e.target.value))}
                    className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Recurring */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Recurring</label>
              <div className="flex gap-2">
                {RECURRING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('recurring', opt.value)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                      form.recurring === opt.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Participants</label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedParticipants.map((pid) => {
                    const u = users.find((usr) => usr.id === pid);
                    return u ? (
                      <span key={pid} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm">
                        <Avatar src={u.avatar} name={u.name} size="xs" />
                        {u.name}
                        <button onClick={() => setSelectedParticipants((prev) => prev.filter((p) => p !== pid))} className="hover:text-primary-900 dark:hover:text-primary-100">
                          <HiX className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Search participants..."
                    value={participantSearch}
                    onChange={(e) => { setParticipantSearch(e.target.value); setShowParticipantDropdown(true); }}
                    onFocus={() => setShowParticipantDropdown(true)}
                    icon={HiUsers}
                  />
                  {showParticipantDropdown && participantSearch && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {availableUsers.length > 0 ? availableUsers.slice(0, 6).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { setSelectedParticipants((prev) => [...prev, u.id]); setParticipantSearch(''); setShowParticipantDropdown(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Avatar src={u.avatar} name={u.name} size="xs" />
                          <div className="text-left">
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{u.email}</p>
                          </div>
                        </button>
                      )) : (
                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">No users found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-6" />

            {/* Password */}
            <div className="space-y-3">
              <Toggle
                enabled={form.requirePassword}
                onChange={(v) => {
                  updateField('requirePassword', v);
                  if (!v) updateField('password', '');
                }}
                label="Require Meeting Password"
              />
              {form.requirePassword && (
                <Input
                  type="text"
                  placeholder="Enter meeting password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={errors.password}
                  icon={HiLockClosed}
                />
              )}
            </div>

            {/* Waiting Room */}
            <Toggle
              enabled={form.waitingRoom}
              onChange={(v) => updateField('waitingRoom', v)}
              label="Enable Waiting Room"
            />

            {/* Allow Recording */}
            <Toggle
              enabled={form.allowRecording}
              onChange={(v) => updateField('allowRecording', v)}
              label="Allow Recording"
            />

            {/* Save as Template */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5">
              <Toggle
                enabled={saveAsTemplate}
                onChange={(v) => { setSaveAsTemplate(v); if (!v) setTemplateName(''); }}
                label="Save as a Reusable Template"
              />
              {saveAsTemplate && (
                <div className="mt-3">
                  <Input
                    icon={HiTemplate}
                    placeholder="Template name (defaults to meeting title)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => navigate('/app/meetings')}>Cancel</Button>
              <Button icon={HiCalendar} onClick={handleSubmit}>Schedule Meeting</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </>
  );
}
