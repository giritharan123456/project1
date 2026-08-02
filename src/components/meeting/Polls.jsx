import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChartBar, HiPlus, HiX, HiCheck, HiTrash } from 'react-icons/hi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import useRealtimeChannel from '../../hooks/useRealtimeChannel';

const initialPolls = [
  { id: 1, question: 'Which feature should we prioritize next?', options: ['Virtual Backgrounds', 'Real-time Translation', 'Recording Transcriptions', 'Breakout Rooms'], votes: [12, 8, 5, 3], totalVotes: 28, ended: false },
];

export default function Polls({ onClose }) {
  const [polls, setPolls] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-polls');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPolls;
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [selectedOption, setSelectedOption] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem('connectly-polls', JSON.stringify(polls));
    } catch {}
  }, [polls]);

  const { send } = useRealtimeChannel('polls', (data) => {
    if (data.type === 'vote') {
      setPolls(prev => prev.map(p => {
        if (p.id !== data.pollId) return p;
        const newVotes = [...p.votes];
        newVotes[data.optIdx] = (newVotes[data.optIdx] || 0) + 1;
        return { ...p, votes: newVotes, totalVotes: p.totalVotes + 1 };
      }));
    } else if (data.type === 'create') {
      setPolls(prev => [...prev, data.poll]);
    } else if (data.type === 'end') {
      setPolls(prev => prev.map(p => p.id === data.pollId ? { ...p, ended: true } : p));
    }
  });

  const addOption = () => setNewOptions(prev => [...prev, '']);

  const removeOption = (i) => {
    if (newOptions.length <= 2) return;
    setNewOptions(prev => prev.filter((_, idx) => idx !== i));
  };

  const createPoll = useCallback(() => {
    if (!newQuestion.trim() || newOptions.some(o => !o.trim())) return;
    const poll = {
      id: Date.now(),
      question: newQuestion.trim(),
      options: newOptions.map(o => o.trim()),
      votes: newOptions.map(() => 0),
      totalVotes: 0,
      ended: false,
    };
    setPolls(prev => [...prev, poll]);
    send({ type: 'create', poll });
    setNewQuestion('');
    setNewOptions(['', '']);
    setShowCreate(false);
  }, [newQuestion, newOptions, send]);

  const vote = useCallback((pollId, optIdx) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId || p.ended) return p;
      if (selectedOption[pollId] !== undefined) return p;
      const newVotes = [...p.votes];
      newVotes[optIdx] = (newVotes[optIdx] || 0) + 1;
      setSelectedOption(s => ({ ...s, [pollId]: optIdx }));
      send({ type: 'vote', pollId, optIdx });
      return { ...p, votes: newVotes, totalVotes: p.totalVotes + 1 };
    }));
  }, [selectedOption, send]);

  const endPoll = useCallback((pollId) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, ended: true } : p));
    send({ type: 'end', pollId });
  }, [send]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <HiChartBar className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-medium text-white">Polls</span>
          <Badge variant="primary" size="xs">{polls.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="secondary" icon={HiPlus} onClick={() => setShowCreate(true)}>Create Poll</Button>
          <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-gray-800 rounded-xl p-4 space-y-3">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-primary-500 placeholder-gray-500"
              />
              {newOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setNewOptions(prev => prev.map((o, idx) => idx === i ? e.target.value : o))}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-primary-500 placeholder-gray-500"
                  />
                  <button onClick={() => removeOption(i)} className="p-1 text-gray-400 hover:text-red-400 transition-colors"><HiTrash className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" onClick={addOption} icon={HiPlus}>Add option</Button>
                <Button size="xs" variant="primary" onClick={createPoll}>Launch Poll</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {polls.map((poll) => {
          const hasVoted = selectedOption[poll.id] !== undefined;
          return (
            <motion.div key={poll.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{poll.question}</span>
                  {poll.ended && <Badge variant="warning" size="xs">Ended</Badge>}
                </div>
                {!poll.ended && (
                  <button onClick={() => endPoll(poll.id)} className="text-xs text-gray-400 hover:text-red-400 transition-colors">End Poll</button>
                )}
              </div>
              <div className="space-y-2">
                {poll.options.map((opt, idx) => {
                  const pct = poll.totalVotes > 0 ? ((poll.votes[idx] || 0) / poll.totalVotes) * 100 : 0;
                  const isSelected = hasVoted && selectedOption[poll.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => vote(poll.id, idx)}
                      disabled={hasVoted || poll.ended}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10'
                          : hasVoted || poll.ended
                          ? 'border-gray-700 bg-gray-700/50'
                          : 'border-gray-700 bg-gray-700 hover:border-primary-500/50 hover:bg-gray-700/80'
                      } disabled:cursor-default`}
                    >
                      <div className="flex items-center justify-between relative">
                        <span className="text-sm text-gray-200 z-10 flex items-center gap-2">
                          {isSelected && <HiCheck className="w-4 h-4 text-primary-400" />}
                          {opt}
                        </span>
                        <span className="text-xs text-gray-400 z-10">{poll.votes[idx] || 0} votes</span>
                      </div>
                      {(hasVoted || poll.ended) && (
                        <div className="mt-1.5 relative">
                          <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-primary-500 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-0.5 block">{Math.round(pct)}%</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">{poll.totalVotes} total votes</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}