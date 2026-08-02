import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiCalendar, HiClock, HiUser, HiStar, HiLightBulb } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import AIMeetingSummary from '../../components/meeting/AIMeetingSummary';
import AITranscription from '../../components/meeting/AITranscription';
import AIActionItems from '../../components/meeting/AIActionItems';
import AIDecisions from '../../components/meeting/AIDecisions';
import AISpeakerInsights from '../../components/meeting/AISpeakerInsights';
import SmartMeetingRecommendation from '../../components/meeting/SmartMeetingRecommendation';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { generateMeetingInsights, findOptimalTime } from '../../utils/meetingInsights';

const fallbackMeetingInfo = {
  title: 'Q3 Product Roadmap Review',
  date: 'July 24, 2024',
  duration: '45 minutes',
  host: 'Sarah Chen',
  participants: 5,
  aiScore: 92,
};

export default function AIMeetingIntelligence() {
  const { id } = useParams();
  const { meetings, users, attendanceRecords } = useApp();
  const meetingId = id || 'mtg-2024-07-24-001';
  const meeting = meetings.find((m) => m.id === id || m.meetingId === id);
  const host = meeting ? users.find((u) => u.id === meeting.host) : null;
  const insights = generateMeetingInsights(meeting, users, attendanceRecords);
  const sentimentScore = insights?.ready
    ? Math.min(98, 35 + insights.messageCount * 4 + insights.participants * 3)
    : 0;

  const meetingInfo = meeting ? {
    title: meeting.title,
    date: new Date(`${meeting.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    duration: `${meeting.duration} minutes`,
    host: host?.name || meeting.host,
    participants: meeting.participants.length,
    aiScore: insights?.ready ? Math.min(98, 72 + insights.messageCount * 3 + insights.participants * 2) : 0,
  } : fallbackMeetingInfo;

  const summaryProp = {
    paragraphs: insights?.ready ? [insights.summary] : ['No AI summary available yet for this meeting.'],
    keyTopics: insights?.keywords?.length ? insights.keywords : ['No topics detected'],
    sentiment: {
      label: insights?.ready ? (sentimentScore >= 60 ? 'Positive' : 'Neutral') : 'No data',
      score: sentimentScore,
      color: sentimentScore >= 60 ? 'emerald' : 'amber',
    },
  };

  const actionItemsProp = (insights?.actionItems || []).map((text, i) => ({
    id: `ins-${meetingId}-${i}`,
    text,
    assignedTo:
      insights?.participantsList?.[i % Math.max(1, insights.participantsList.length)] || 'Unassigned',
    dueDate: new Date(Date.now() + (7 + i * 3) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    priority: i === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low',
    completed: false,
  }));
  const optimalTime = useMemo(() => findOptimalTime(meetings, users), [meetings, users]);

  const tabs = [
    {
      key: 'summary',
      label: 'Summary',
      icon: <HiSparkles className="w-4 h-4" />,
      content: <AIMeetingSummary meetingId={meetingId} summary={summaryProp} />,
    },
    {
      key: 'transcript',
      label: 'Transcript',
      icon: <HiCalendar className="w-4 h-4" />,
      content: <AITranscription meetingId={meetingId} transcriptLines={insights?.transcriptLines || []} />,
    },
    {
      key: 'action-items',
      label: 'Action Items',
      icon: <HiStar className="w-4 h-4" />,
      content: <AIActionItems meetingId={meetingId} actionItems={actionItemsProp} />,
    },
    {
      key: 'decisions',
      label: 'Decisions',
      icon: <HiClock className="w-4 h-4" />,
      content: <AIDecisions meetingId={meetingId} decisions={insights?.decisions || []} />,
    },
    {
      key: 'speakers',
      label: 'Speaker Insights',
      icon: <HiUser className="w-4 h-4" />,
      content: <AISpeakerInsights speakers={insights?.speakers || []} />,
    },
    {
      key: 'recommendations',
      label: 'Smart Recs',
      icon: <HiLightBulb className="w-4 h-4" />,
      content: <SmartMeetingRecommendation meetings={meetings} users={users} optimalTime={optimalTime} />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Helmet>
        <title>AI Meeting Intelligence - AdzConnect</title>
        <meta name="description" content="AI-powered meeting insights including summaries, transcripts, action items, and speaker analytics." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{meetingInfo.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><HiCalendar className="w-4 h-4" />{meetingInfo.date}</span>
            <span className="flex items-center gap-1.5"><HiClock className="w-4 h-4" />{meetingInfo.duration}</span>
            <span className="flex items-center gap-1.5">
              <Avatar name={meetingInfo.host} size="xs" />
              {meetingInfo.host}
            </span>
            <span className="flex items-center gap-1.5">
              <HiUser className="w-4 h-4" />{meetingInfo.participants} participants
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="lg">
            <HiSparkles className="w-3.5 h-3.5" />
            AI Intelligence
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/30">
            <HiStar className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{meetingInfo.aiScore}/100</span>
            <span className="text-xs text-amber-600 dark:text-amber-500">Quality Score</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <HiSparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights?.actionItems.length || 0}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Action Items</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <HiStar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights?.decisions.length || 0}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Decisions Made</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <HiSparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sentimentScore}%</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Positive Sentiment</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs tabs={tabs} className="w-full" />
    </div>
  );
}
