import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiSparkles, HiCalendar, HiLightningBolt, HiPaperAirplane,
  HiDocumentText, HiClock, HiVideoCamera, HiChip, HiSearch,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SmartMeetingRecommendation from '../../components/meeting/SmartMeetingRecommendation';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateMeetingInsights, findOptimalTime } from '../../utils/meetingInsights';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const quickActions = [
  { id: 'schedule', label: 'Schedule a Meeting', icon: HiCalendar, desc: 'Book a new meeting with date, time and invitees' },
  { id: 'summarize', label: 'Summarize My Meetings', icon: HiDocumentText, desc: 'AI-generated summaries of your recent meetings' },
  { id: 'actions', label: 'Generate Action Items', icon: HiChip, desc: 'Extract action items, decisions and insights' },
  { id: 'time', label: 'Find Optimal Time', icon: HiClock, desc: 'Best time to meet based on team availability' },
  { id: 'instant', label: 'Start Instant Meeting', icon: HiVideoCamera, desc: 'Create a live meeting and invite your team' },
  { id: 'search', label: 'Smart Search', icon: HiSearch, desc: 'Search meetings, people, files and reports' },
];

const suggestionChips = ['Schedule a meeting', 'Summarize my meetings', 'Generate action items', 'Best time to meet', 'Start an instant meeting', 'Search for a meeting'];

export default function AIAssistant() {
  const { meetings, users, attendanceRecords, createInstantMeeting } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => [
    {
      role: 'ai',
      text: "Hi! I'm your AI assistant. I can schedule meetings, summarize your meetings, generate action items, find the best time to meet, and start instant meetings. Try one of the quick actions below or type a command.",
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const latestMeeting = useMemo(() => (Array.isArray(meetings) ? meetings[0] : null), [meetings]);
  const optimalTime = useMemo(() => findOptimalTime(meetings, users), [meetings, users]);
  const latestInsights = useMemo(
    () => (latestMeeting ? generateMeetingInsights(latestMeeting, users, attendanceRecords) : null),
    [latestMeeting, users, attendanceRecords]
  );

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const buildReply = (text) => {
    const q = text.toLowerCase();
    const meetingCount = Array.isArray(meetings) ? meetings.length : 0;
    if (q.includes('schedule') || q.includes('book')) {
      return meetingCount > 0
        ? `You have ${meetingCount} meeting${meetingCount === 1 ? '' : 's'} on your calendar. Use "Schedule a Meeting" above to add a new one with a title, date, time, duration and invitees.`
        : 'Your calendar is empty. Use "Schedule a Meeting" above to book your first meeting.';
    }
    if (q.includes('summar')) {
      return latestMeeting
        ? `I can generate an AI summary of your meetings. Use "Summarize My Meetings" to open the AI Meeting Intelligence view for "${latestMeeting.title}" (${latestMeeting.date}${latestMeeting.time ? ` at ${latestMeeting.time}` : ''}).`
        : 'There are no meetings to summarize yet. Schedule or start a meeting first.';
    }
    if (q.includes('action')) {
      const count = latestInsights?.actionItems?.length || 0;
      return latestMeeting
        ? `AI extracted ${count} action item${count === 1 ? '' : 's'} from "${latestMeeting.title}". Use "Generate Action Items" to open the AI intelligence view with all tabs.`
        : 'AI can extract action items, decisions, and speaker insights from your meetings. Use "Generate Action Items" to open the AI intelligence view with all tabs.';
    }
    if (q.includes('time') || q.includes('best') || q.includes('when')) {
      return `Based on your calendar, ${optimalTime.day} ${optimalTime.time} looks optimal with ${optimalTime.availability}% team availability. You can also see the "Optimal Time" and "Best Length" cards below.`;
    }
    if (q.includes('instant') || q.includes('start') || q.includes('create')) {
      return 'Use "Start Instant Meeting" to create a live meeting right away. A join link will be shared with your team.';
    }
    if (q.includes('search') || q.includes('look for') || (q.includes('find') && !q.includes('time'))) {
      return 'Use "Smart Search" to search across meetings, people, files, and reports. You can also press Ctrl+K from anywhere in the app.';
    }
    if (q.includes('transcript')) {
      const hasTranscript = (latestInsights?.transcriptLines?.length || 0) > 0;
      return hasTranscript
        ? `The transcript for "${latestMeeting.title}" has ${latestInsights.transcriptLines.length} recorded line${latestInsights.transcriptLines.length === 1 ? '' : 's'}. Open the meeting and go to the Transcript tab.`
        : 'AI transcripts are built from chat messages exchanged in a meeting. Open a meeting and exchange messages, then visit the Transcript tab.';
    }
    if (q.includes('recommend')) {
      return `Below you will find Smart Recommendations based on your ${meetingCount} scheduled meeting${meetingCount === 1 ? '' : 's'}. Optimal time is ${optimalTime.day} ${optimalTime.time} at ${optimalTime.availability}% availability.`;
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! You have ${meetingCount} meeting${meetingCount === 1 ? '' : 's'} on your calendar. Try "schedule a meeting", "summarize my meetings", or "best time to meet".`;
    }
    return 'I can help with scheduling meetings, summarizing meetings, generating action items, finding optimal meeting times, and starting instant meetings. Try one of the quick actions above.';
  };

  const runAction = (id) => {
    switch (id) {
      case 'schedule':
        toast.success('Opening the meeting scheduler');
        navigate('/app/schedule');
        break;
      case 'summarize':
      case 'actions':
        if (latestMeeting) {
          navigate(`/app/meeting/${latestMeeting.id}/intelligence`);
        } else {
          toast.error('No meetings found. Schedule a meeting first.');
        }
        break;
      case 'time':
        toast.success(`Optimal time found: ${optimalTime.day} ${optimalTime.time} (${optimalTime.availability}% availability)`);
        break;
      case 'instant': {
        const meeting = createInstantMeeting({ id: user?.id, role: user?.role });
        if (meeting) {
          toast.success(`Instant meeting "${meeting.title}" started!`);
          navigate(`/app/meeting/lobby/${meeting.id}`);
        }
        break;
      }
      case 'search':
        navigate('/app/search');
        break;
      default:
        break;
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    const reply = buildReply(text);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    }, 400);
  };

  return (
    <>
      <Helmet>
        <title>AI Assistant - AdzConnect</title>
        <meta name="description" content="AdzConnect AI assistant that schedules meetings, summarizes conversations, and boosts your productivity." />
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6 p-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <HiSparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Your AI copilot for scheduling, summarizing and optimizing every meeting.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => runAction(action.id)}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 text-left"
            >
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-500">
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{action.desc}</p>
              </div>
            </button>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <HiSparkles className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Chat with the Assistant</h2>
            </div>
            <div className="space-y-4 px-6 py-5 max-h-96 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 rounded-bl-md'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestionChips.map((chip) => (
                  <button key={chip} onClick={() => { setInput(chip); }} className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300 transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Ask me to schedule, summarize, or find the best time..."
                  className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button variant="primary" size="md" icon={HiPaperAirplane} onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiLightningBolt className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Recommendations</h2>
          </div>
          <SmartMeetingRecommendation meetings={meetings} users={users} optimalTime={optimalTime} />
        </motion.div>
      </motion.div>
    </>
  );
}
