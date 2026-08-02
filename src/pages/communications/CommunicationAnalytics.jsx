import { motion } from 'framer-motion';
import { HiChatAlt2, HiMail, HiPhone, HiVideoCamera, HiArrowSmUp, HiArrowSmDown, HiDownload } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';

const data = {
  dailyMessages: [
    { date: 'Mon', messages: 342, channels: { chat: 180, email: 95, call: 67 } },
    { date: 'Tue', messages: 410, channels: { chat: 220, email: 110, call: 80 } },
    { date: 'Wed', messages: 380, channels: { chat: 195, email: 105, call: 80 } },
    { date: 'Thu', messages: 450, channels: { chat: 240, email: 120, call: 90 } },
    { date: 'Fri', messages: 390, channels: { chat: 200, email: 100, call: 90 } },
    { date: 'Sat', messages: 150, channels: { chat: 80, email: 40, call: 30 } },
    { date: 'Sun', messages: 90, channels: { chat: 50, email: 25, call: 15 } },
  ],
  topCommunicators: [
    { name: 'Sarah Chen', messages: 89, calls: 12, rank: 1 },
    { name: 'Mike Johnson', messages: 76, calls: 8, rank: 2 },
    { name: 'Emily Davis', messages: 65, calls: 15, rank: 3 },
    { name: 'Alex Kim', messages: 52, calls: 10, rank: 4 },
  ],
  trends: [
    { label: 'Avg Response Time', value: '2.3h', change: '-12%', up: true },
    { label: 'Messages per User', value: '45/day', change: '+8%', up: true },
    { label: 'Meeting Calls', value: '23/day', change: '+5%', up: true },
    { label: 'Email Volume', value: '112/day', change: '-3%', up: false },
  ],
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function CommunicationAnalytics() {
  const { user } = useAuth();
  const { createInstantMeeting } = useApp();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Communication Analytics - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication Analytics</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Message trends, response times, and channel breakdowns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={HiDownload} onClick={() => {
            exportToCSV(data.dailyMessages, 'communication-analytics.csv');
            toast.success('Analytics exported');
          }}>Export</Button>
          <Button variant="primary" size="sm" onClick={() => createInstantMeeting({ id: user?.id || 'u7', role: user?.role || 'employee' })}>Meet Now</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.trends.map((t) => (
          <Card key={t.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-slate-400">{t.label}</span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${t.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {t.up ? <HiArrowSmUp className="w-3 h-3" /> : <HiArrowSmDown className="w-3 h-3" />}{t.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{t.value}</p>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Message Volume</h2>
          <div className="space-y-3">
            {data.dailyMessages.map((d) => (
              <div key={d.date} className="flex items-center gap-4">
                <span className="w-10 text-sm font-medium text-gray-600 dark:text-slate-400">{d.date}</span>
                <div className="flex-1 h-8 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 rounded-l-full transition-all" style={{ width: `${(d.channels.chat / d.messages) * 100}%` }} />
                  <div className="bg-amber-500 transition-all" style={{ width: `${(d.channels.email / d.messages) * 100}%` }} />
                  <div className="bg-emerald-500 rounded-r-full transition-all" style={{ width: `${(d.channels.call / d.messages) * 100}%` }} />
                </div>
                <span className="w-12 text-sm text-gray-500 text-right">{d.messages}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span>Chat</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span>Email</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Call</span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Communicators</h2>
          <div className="space-y-3">
            {data.topCommunicators.map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${c.rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20' : c.rank === 2 ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20'}`}>{c.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{c.messages} messages · {c.calls} calls</p>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><HiChatAlt2 className="w-3 h-3" />{c.messages}</span>
                  <span className="flex items-center gap-1"><HiPhone className="w-3 h-3" />{c.calls}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channel Breakdown (Weekly)</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90"><circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" /><circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="251.3 100.5" strokeLinecap="round" /></svg>
              <HiChatAlt2 className="absolute inset-0 m-auto w-6 h-6 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">58%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Chat</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90"><circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" /><circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="150 201" strokeLinecap="round" /></svg>
              <HiMail className="absolute inset-0 m-auto w-6 h-6 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">37%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90"><circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" /><circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="100.5 251" strokeLinecap="round" /></svg>
              <HiVideoCamera className="absolute inset-0 m-auto w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">20%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Voice/Video</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}