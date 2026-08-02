import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiPencilAlt, HiChat, HiFolder, HiBookOpen, HiChartBar,
  HiMicrophone, HiSparkles, HiUsers, HiPlay, HiVideoCamera,
  HiDocumentText,
} from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const tools = [
  { label: 'Whiteboard', icon: HiPencilAlt, path: '/app/whiteboard', desc: 'Draw, annotate, and brainstorm live', color: 'from-violet-500 to-purple-600' },
  { label: 'Chat', icon: HiChat, path: '/app/chat', desc: 'Direct and channel messaging', color: 'from-sky-500 to-blue-600' },
  { label: 'Files', icon: HiFolder, path: '/app/files', desc: 'Upload and organize shared files', color: 'from-amber-500 to-orange-600' },
  { label: 'Meeting Notes', icon: HiBookOpen, path: '/app/meeting-notes', desc: 'Capture notes and share them', color: 'from-emerald-500 to-green-600' },
  { label: 'Polls & Engagement', icon: HiChartBar, path: '/app/polls', desc: 'Launch polls and measure engagement', color: 'from-rose-500 to-pink-600' },
  { label: 'Recordings', icon: HiMicrophone, path: '/app/recordings', desc: 'Browse recorded sessions', color: 'from-cyan-500 to-teal-600' },
  { label: 'AI Assistant', icon: HiSparkles, path: '/app/ai', desc: 'Summaries, action items, and insights', color: 'from-indigo-500 to-violet-600' },
  { label: 'Team Directory', icon: HiUsers, path: '/app/team', desc: 'Find teammates and their availability', color: 'from-fuchsia-500 to-purple-600' },
];

export default function CollaborationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { meetings, recordings, messages, activityLog } = useApp();

  const liveMeetings = useMemo(() => meetings.filter(m => m.status === 'live'), [meetings]);
  const myLive = useMemo(() => liveMeetings.find(m => m.host === user?.id) || liveMeetings[0] || null, [liveMeetings, user]);

  const recentActivity = useMemo(() => activityLog
    .filter(a => ['message', 'meeting', 'task', 'report', 'notification'].includes(a.type))
    .slice(0, 6), [activityLog]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Helmet><title>Collaboration - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Collaboration</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Your complete meeting collaboration workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            <Badge variant="primary" size="sm">{recordings.length} recordings</Badge>
            <Badge variant="success" size="sm" className="ml-2">{messages.length} messages</Badge>
          </div>
        </div>
      </motion.div>

      {myLive && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <div>
                  <p className="font-semibold">{myLive.title} is live now</p>
                  <p className="text-white/80 text-sm">{myLive.participants.length} participants</p>
                </div>
              </div>
              <Button variant="primary" size="sm" icon={HiVideoCamera} onClick={() => navigate(`/app/meeting/room/${myLive.id}`)}>Open Meeting Room</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map(tool => (
          <button key={tool.label} onClick={() => navigate(tool.path)} className="text-left group">
            <Card hover className="h-full">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 shadow-lg`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{tool.label}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{tool.desc}</p>
            </Card>
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HiPlay className="w-5 h-5 text-primary-500" />
              Start collaborating
            </h2>
            <div className="space-y-2">
              <Button variant="outline" fullWidth icon={HiPencilAlt} onClick={() => navigate('/app/whiteboard')}>Open Whiteboard</Button>
              <Button variant="outline" fullWidth icon={HiChat} onClick={() => navigate('/app/chat')}>Open Chat</Button>
              <Button variant="outline" fullWidth icon={HiChartBar} onClick={() => navigate('/app/polls')}>Launch a Poll</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <HiDocumentText className="w-5 h-5 text-emerald-500" />
              Recent activity
            </h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No collaboration activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                    <p className="text-sm text-gray-800 dark:text-slate-200">{a.action}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{a.user} · {new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
