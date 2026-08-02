import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiQuestionMarkCircle, HiSearch, HiChevronDown, HiChat,
  HiDocumentText, HiStatusOnline, HiSupport, HiLightBulb,
  HiShieldCheck, HiBookOpen,
} from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const faqItems = [
  { q: 'How do I start a meeting?', a: 'Click "New Meeting" from the dashboard or use the schedule feature to plan ahead.' },
  { q: 'How do I admit participants from the waiting room?', a: 'Open the Waiting Room from the meeting room toolbar (or the Participants page) and click Admit next to each waiting participant. Denied participants are removed from the invite list.' },
  { q: 'Can I record meetings?', a: 'Yes, hosts can record meetings. Press K in the meeting room or use the Record button. Recordings are saved and available in the Recordings page.' },
  { q: 'How many participants can join?', a: 'Free plans support up to 100 participants. Premium plans support up to 1,000.' },
  { q: 'Where do my meeting reports and analytics live?', a: 'Reports are available under Reports, and hosting analytics under Analytics. You can also export the Host Report CSV from the Host Dashboard.' },
  { q: 'Is my data encrypted?', a: 'All meetings are end-to-end encrypted. Data in transit uses TLS 1.3.' },
  { q: 'How do I run a device check?', a: 'Open Settings → Devices for camera, microphone, and speaker tests, or use the Device Test page from your Profile.' },
];

const helpModalContent = {
  docs: {
    title: 'Documentation',
    body: [
      ['Getting Started', 'Learn the basics of AdzConnect — join your first meeting, set up your profile, and invite teammates.'],
      ['Meetings & Scheduling', 'Schedule, join, and manage meetings. Discover recording, transcription, and live captions.'],
      ['Collaboration', 'Use chat, whiteboard, file sharing, and AI Assistant to work together in real time.'],
      ['Account & Billing', 'Manage your profile, security, SSO, and connected devices from Settings.'],
    ],
  },
  status: {
    title: 'System Status',
    body: [
      ['Video & Audio Service', 'Operational', 'All systems normal'],
      ['Messaging & Collaboration', 'Operational', 'All systems normal'],
      ['Recordings & Storage', 'Operational', 'Serving normally'],
      ['AI Assistant', 'Operational', 'All systems normal'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [['Terms of Service', 'This is a demonstration application. The Terms of Service describe the rules and guidelines for using AdzConnect. By continuing to use the application you agree to use it responsibly and lawfully. This demo does not collect, store, or transmit any personal data to a server.']],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [['Privacy Policy', 'AdzConnect values your privacy. This demo application stores your settings and preferences locally in your browser only. No personal data is sent to external servers. You can clear all locally stored data at any time by clearing your browser site data.']],
  },
};

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [modalKey, setModalKey] = useState(null);
  const [feedback, setFeedback] = useState('');

  const filteredFaqs = faqItems.filter(f =>
    f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  const modal = modalKey ? helpModalContent[modalKey] : null;

  const openHelpModal = (key) => setModalKey(key);

  const submitFeedback = () => {
    if (!feedback.trim()) {
      toast.error('Please describe the issue or feature request');
      return;
    }
    try {
      const stored = localStorage.getItem('connectly-help-feedback');
      const list = stored ? JSON.parse(stored) : [];
      list.push({ id: Date.now(), message: feedback.trim(), date: new Date().toISOString() });
      localStorage.setItem('connectly-help-feedback', JSON.stringify(list));
    } catch {}
    setFeedback('');
    setModalKey(null);
    toast.success('Thank you! Your feedback has been submitted.');
  };

  const supportLinks = [
    { label: 'Contact Support', icon: HiSupport, onClick: () => navigate('/app/chat') },
    { label: 'Documentation', icon: HiDocumentText, onClick: () => openHelpModal('docs') },
    { label: 'System Status', icon: HiStatusOnline, onClick: () => openHelpModal('status') },
    { label: 'Report a Problem', icon: HiLightBulb, onClick: () => openHelpModal('feedback') },
    { label: 'Terms of Service', icon: HiBookOpen, onClick: () => openHelpModal('terms') },
    { label: 'Privacy Policy', icon: HiShieldCheck, onClick: () => openHelpModal('privacy') },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Helmet><title>Help Center - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
          <HiQuestionMarkCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Help Center</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">How can we help you today?</p>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-md mx-auto">
        <Input icon={HiSearch} placeholder="Search help articles..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {supportLinks.map(link => (
          <button key={link.label} onClick={link.onClick} className="text-left group">
            <Card hover className="h-full">
              <link.icon className="w-5 h-5 text-primary-500 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</p>
            </Card>
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Frequently asked questions</h2>
        <div className="space-y-2">
          {filteredFaqs.length === 0 && (
            <Card className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">No articles found for "{query}"</Card>
          )}
          {filteredFaqs.map(f => (
            <Card key={f.q}>
              <button onClick={() => setOpenFaq(openFaq === f.q ? null : f.q)} className="w-full flex items-center justify-between gap-3 text-left">
                <span className="font-medium text-gray-900 dark:text-white">{f.q}</span>
                <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === f.q ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === f.q && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <p className="text-sm text-gray-600 dark:text-slate-300 pt-3">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center">
        <Button variant="outline" icon={HiChat} onClick={() => navigate('/app/chat')}>Still need help? Chat with us</Button>
      </motion.div>

      <Modal isOpen={!!modal} onClose={() => setModalKey(null)} title={modal?.title} size="md">
        {modalKey === 'feedback' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-slate-300">Report a problem or request a feature. Feedback is stored locally in this demo.</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Describe the issue or feature request..."
              className="w-full bg-gray-50 dark:bg-slate-700 text-sm text-gray-900 dark:text-white rounded-xl px-3 py-2 border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalKey(null)}>Cancel</Button>
              <Button variant="primary" onClick={submitFeedback}>Submit Feedback</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {modal?.body.map(([title, status, note]) => (
              <div key={title} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{status}{note ? ` — ${note}` : ''}</p>
              </div>
            ))}
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setModalKey(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
