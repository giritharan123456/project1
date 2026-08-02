import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiChartBar, HiVideoCamera, HiCheck, HiClock, HiQuestionMarkCircle } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Tabs from '../../components/ui/Tabs';
import Polls from '../../components/meeting/Polls';
import QAPanel from '../../components/meeting/QAPanel';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function PollsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { meetings } = useApp();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('connectly-polls');
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const liveMeetings = useMemo(() => meetings.filter(m => m.status === 'live'), [meetings]);

  const activeCount = history.filter(p => !p.ended).length;
  const totalVotes = history.reduce((sum, p) => sum + (p.totalVotes || 0), 0);
  const isHost = user?.role === 'host' || user?.role === 'admin';

  const pollsContent = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div variants={itemVariants}>
        <Card className="p-0 overflow-hidden">
          <div className="bg-slate-900 h-[540px] overflow-y-auto">
            <Polls onClose={() => {}} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <HiClock className="w-5 h-5 text-amber-500" />
          Poll history
        </h2>
        {history.length === 0 ? (
          <Card className="p-10">
            <EmptyState icon={HiChartBar} title="No polls yet" description="Launch your first poll to start gathering live feedback" />
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map(poll => (
              <Card key={poll.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900 dark:text-white">{poll.question}</p>
                  {poll.ended ? <Badge variant="warning" size="xs">Ended</Badge> : <Badge variant="success" size="xs" dot>Active</Badge>}
                </div>
                <div className="space-y-1.5">
                  {poll.options.map((opt, idx) => {
                    const pct = poll.totalVotes > 0 ? ((poll.votes[idx] || 0) / poll.totalVotes) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-40 truncate text-sm text-gray-600 dark:text-slate-300 flex items-center gap-1">
                          {idx === poll.votes.indexOf(Math.max(...poll.votes)) && poll.totalVotes > 0 && <HiCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {opt}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 w-16 text-right">{poll.votes[idx] || 0} ({Math.round(pct)}%)</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{poll.totalVotes} total votes</p>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  const qaContent = (
    <motion.div variants={itemVariants}>
      <Card className="p-0 overflow-hidden">
        <div className="bg-slate-900 h-[560px] overflow-hidden">
          <QAPanel isHost={isHost} />
        </div>
      </Card>
    </motion.div>
  );

  const tabs = [
    { label: 'Polls', icon: <HiChartBar className="w-4 h-4" />, key: 'polls', content: pollsContent },
    { label: 'Q&A', icon: <HiQuestionMarkCircle className="w-4 h-4" />, key: 'qa', content: qaContent },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Helmet><title>Polls & Engagement - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Polls & Engagement</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Launch live polls, run Q&A, and track audience engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">{activeCount} active polls</Badge>
          <Badge variant="primary" size="sm">{totalVotes} total votes</Badge>
        </div>
      </motion.div>

      {liveMeetings.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary-500 to-indigo-600 text-white border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <HiVideoCamera className="w-6 h-6" />
                <div>
                  <p className="font-semibold">A meeting is live — launch a poll there for real-time engagement</p>
                  <p className="text-white/80 text-sm">{liveMeetings[0].title}</p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate(`/app/meeting/room/${liveMeetings[0].id}`)}>Open Room</Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Tabs tabs={tabs} defaultTab={0} />
      </motion.div>
    </motion.div>
  );
}
