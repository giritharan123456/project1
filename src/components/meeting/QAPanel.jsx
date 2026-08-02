import { useState, useCallback } from 'react';
import { HiQuestionMarkCircle, HiBadgeCheck, HiExclamationCircle, HiX, HiPaperAirplane } from 'react-icons/hi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const STORAGE_KEY = 'connectly-qa-questions';

function loadQuestions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export default function QAPanel({ onClose, isHost = false }) {
  const { getCurrentUser } = useApp();
  const user = getCurrentUser();
  const [questions, setQuestions] = useState(loadQuestions);
  const [text, setText] = useState('');

  const persist = useCallback((next) => {
    setQuestions(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const askQuestion = () => {
    if (!text.trim()) return;
    const newQ = {
      id: `q${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      employeeId: user?.id,
      employeeName: user?.name || 'Unknown',
      question: text.trim(),
      status: 'pending',
      answer: '',
      createdAt: new Date().toISOString(),
    };
    persist([...questions, newQ]);
    setText('');
    toast.success('Question sent to the host');
  };

  const markAnswered = (q) => {
    persist(questions.map((item) =>
      item.id === q.id ? { ...item, status: 'answered', answer: 'Answered by host' } : item
    ));
    toast.success('Question marked as answered');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <HiQuestionMarkCircle className="w-5 h-5 text-amber-400" /> Q&A
        </h3>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><HiX className="w-5 h-5" /></button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-10">
            <HiQuestionMarkCircle className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No questions yet</p>
            <p className="text-xs text-gray-500 mt-1">Ask a question below</p>
          </div>
        ) : (
          questions.slice().reverse().map((q) => (
            <div key={q.id} className="p-3 rounded-xl bg-gray-800 border border-gray-700">
              <div className="flex items-start gap-2">
                {q.status === 'answered' ? (
                  <HiBadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <HiExclamationCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{q.employeeName}</p>
                  <p className="text-sm text-gray-300 mt-0.5">{q.question}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="xs">{q.status}</Badge>
                    {isHost && q.status === 'pending' && (
                      <button
                        onClick={() => markAnswered(q)}
                        className="text-xs font-medium text-primary-400 hover:text-primary-300"
                      >
                        Mark Answered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-800 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <Button
          variant="primary"
          size="sm"
          icon={HiPaperAirplane}
          onClick={askQuestion}
          disabled={!text.trim()}
        >
          Ask
        </Button>
      </div>
    </div>
  );
}
