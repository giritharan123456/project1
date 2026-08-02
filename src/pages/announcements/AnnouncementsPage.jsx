import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSpeakerphone, HiPlus, HiBell, HiCalendar, HiClock } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { broadcastAnnouncement, notifications } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('info');

  const announcements = notifications.filter(n => n.type === 'announcement');

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message required'); return; }
    broadcastAnnouncement({ title, message, priority });
    setTitle('');
    setMessage('');
    setShowModal(false);
    toast.success('Announcement sent to all users!');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Announcements - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Company-wide announcements and broadcasts</p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={HiPlus} onClick={() => setShowModal(true)}>New Announcement</Button>
        )}
      </motion.div>

      {announcements.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <HiSpeakerphone className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 dark:text-slate-400">No announcements yet</h3>
          {isAdmin && <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Create your first company announcement</p>}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <motion.div key={a.id} variants={itemVariants}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-500/10">
                    <HiSpeakerphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                      <Badge variant="primary" size="xs">New</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{a.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                      <span className="flex items-center gap-1"><HiCalendar className="w-3 h-3" /> {new Date(a.time).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><HiClock className="w-3 h-3" /> {new Date(a.time).toLocaleTimeString()}</span>
                      <span className="flex items-center gap-1"><HiBell className="w-3 h-3" /> {a.sender || 'System'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Announcement" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your announcement..." rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <Button variant="primary" fullWidth onClick={handleSubmit}>Send Announcement</Button>
        </div>
      </Modal>
    </motion.div>
  );
}