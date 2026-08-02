import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiSpeakerphone, HiChat, HiTemplate, HiBell, HiPaperAirplane,
  HiOutlineMail, HiDocumentText,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TEMPLATE_SEED = [
  { id: 't1', title: 'Welcome to the Team', category: 'Onboarding', body: 'We are delighted to welcome you to Connectly. Your onboarding checklist is ready — complete your profile and join the orientation session.', usage: 12 },
  { id: 't2', title: 'Policy Update Notice', category: 'Announcement', body: 'Please review the updated company policy that takes effect next Monday. Reach out to HR with any questions.', usage: 8 },
  { id: 't3', title: 'Leave Approval', category: 'Leave', body: 'Your leave request has been approved. Enjoy your time off and we look forward to seeing you back on [date].', usage: 15 },
  { id: 't4', title: 'Performance Review Invite', category: 'Performance', body: 'Your quarterly performance review is scheduled. Please add your self-assessment before the meeting.', usage: 6 },
  { id: 't5', title: 'Company Announcement', category: 'Announcement', body: 'Connectly update: [title]. [Summary of the update and any action required].', usage: 21 },
];

export default function HRCommunication() {
  const { users, announcements, broadcastAnnouncement, messages, userNotifications } = useApp();
  const [active, setActive] = useHRTab('announcements');
  const [broadcast, setBroadcast] = useState({ title: '', message: '', priority: 'info' });

  const userMap = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => { map[u.id] = u.name; });
    return map;
  }, [users]);

  const templates = TEMPLATE_SEED;

  const tabs = [
    { key: 'announcements', label: 'Announcements', icon: HiSpeakerphone },
    { key: 'broadcast', label: 'Broadcast', icon: HiPaperAirplane },
    { key: 'team', label: 'Team Messages', icon: HiChat },
    { key: 'templates', label: 'Templates', icon: HiTemplate },
    { key: 'notifications', label: 'Notifications', icon: HiBell },
  ];

  const teamMessages = useMemo(
    () => (messages || []).slice(0, 8).map((m) => ({
      id: m.id,
      sender: userMap[m.from] || m.from || 'Team',
      text: m.text,
      time: m.timestamp ? new Date(m.timestamp).toLocaleString() : '',
    })),
    [messages, userMap]
  );

  const handleBroadcast = () => {
    if (!broadcast.title.trim() || !broadcast.message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    broadcastAnnouncement({ title: broadcast.title, message: broadcast.message, priority: broadcast.priority });
    toast.success('Broadcast sent to all employees');
    setBroadcast({ title: '', message: '', priority: 'info' });
  };

  const renderContent = () => {
    if (active === 'announcements') {
      const list = announcements.length > 0
        ? announcements
        : [
            { id: 'a-demo-1', title: 'Office Hours Update', message: 'Engineering office hours move to 10:00 AM starting Monday.', priority: 'info', createdAt: '2026-07-30T09:00:00.000Z' },
            { id: 'a-demo-2', title: 'New Benefits Package', message: 'Review the updated health & wellness benefits before the enrollment deadline.', priority: 'important', createdAt: '2026-07-29T14:00:00.000Z' },
          ];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    <HiSpeakerphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                </div>
                <Badge variant={a.priority === 'critical' ? 'danger' : a.priority === 'important' ? 'warning' : 'info'} size="xs">{a.priority || 'info'}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-3">{a.message}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</p>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'broadcast') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send Broadcast</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                <input type="text" value={broadcast.title} onChange={(e) => setBroadcast((prev) => ({ ...prev, title: e.target.value }))} placeholder="Broadcast title" className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message</label>
                <textarea value={broadcast.message} onChange={(e) => setBroadcast((prev) => ({ ...prev, message: e.target.value }))} rows={5} placeholder="Write your announcement..." className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
                <select value={broadcast.priority} onChange={(e) => setBroadcast((prev) => ({ ...prev, priority: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="info">Info</option>
                  <option value="important">Important</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <Button variant="primary" fullWidth icon={HiPaperAirplane} onClick={handleBroadcast}>Send Broadcast</Button>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sent Broadcasts</h2>
            <div className="space-y-3">
              {(announcements.length > 0 ? announcements : []).map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                    <Badge variant={a.priority === 'critical' ? 'danger' : a.priority === 'important' ? 'warning' : 'info'} size="xs">{a.priority}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{a.message}</p>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No broadcasts sent yet</p>}
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'team') {
      return (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Team Messages</h2>
          <div className="space-y-3">
            {teamMessages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No messages yet</p>
            ) : teamMessages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <Avatar name={m.sender || 'Team'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.sender || 'Team'}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{m.time || m.createdAt || ''}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">{m.text || m.message || m.content || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (active === 'templates') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                  {t.category === 'Onboarding' || t.category === 'Announcement' ? <HiOutlineMail className="w-5 h-5" /> : <HiDocumentText className="w-5 h-5" />}
                </div>
                <Badge variant="info" size="xs">{t.category}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{t.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 line-clamp-3">{t.body}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-slate-400">Used {t.usage} times</span>
                <Button variant="ghost" size="xs">Use Template</Button>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
        <div className="space-y-3">
          {(userNotifications || []).slice(0, 10).map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                <HiBell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">{n.message}</p>
              </div>
              <Badge variant={n.read ? 'default' : 'primary'} size="xs">{n.read ? 'Read' : 'New'}</Badge>
            </div>
          ))}
          {(userNotifications || []).length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No notifications</p>}
        </div>
      </Card>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Communication - AdzConnect HR</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Announcements, broadcasts, team messages, and templates</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{announcements.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Announcements</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{templates.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Templates</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{(messages || []).length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Team Messages</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-violet-600">{(userNotifications || []).filter((n) => !n.read).length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Unread Notifications</p></Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HRSectionTabs tabs={tabs} active={active} onChange={setActive} />
      </motion.div>

      <motion.div variants={itemVariants} key={active}>
        {renderContent()}
      </motion.div>
    </motion.div>
  );
}
