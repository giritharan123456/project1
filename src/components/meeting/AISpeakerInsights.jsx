import { motion } from 'framer-motion';
import { HiMicrophone, HiChartBar, HiTag } from 'react-icons/hi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const mockSpeakers = [
  { name: 'Sarah Chen', speakingTime: 28, talkSpeed: 'Moderate', topics: ['Roadmap', 'Virtual Backgrounds', 'Budget'], sentiment: 'Positive', role: 'Product Manager' },
  { name: 'Marcus Johnson', speakingTime: 32, talkSpeed: 'Fast', topics: ['Engineering', 'Latency', 'WebRTC', 'Security'], sentiment: 'Neutral', role: 'Engineering Lead' },
  { name: 'Emily Nakamura', speakingTime: 15, talkSpeed: 'Slow', topics: ['QA', 'Testing', 'Training Data'], sentiment: 'Positive', role: 'QA Lead' },
  { name: 'David Park', speakingTime: 18, talkSpeed: 'Moderate', topics: ['Translation', 'API', 'Integration'], sentiment: 'Neutral', role: 'Software Architect' },
  { name: 'Rachel Torres', speakingTime: 7, talkSpeed: 'Fast', topics: ['Marketing', 'Campaign', 'Launch'], sentiment: 'Positive', role: 'Marketing Lead' },
];

const sentimentColors = { Positive: 'text-emerald-500', Neutral: 'text-amber-500', Negative: 'text-red-500' };

export default function AISpeakerInsights({ speakers = mockSpeakers }) {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Speaker Insights</h3>

        <div className="space-y-3">
          {speakers.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-6">No speaker data yet. Add participants or exchange chat messages to surface speaker analytics.</p>
          )}
          {speakers.map((speaker, i) => (
            <motion.div
              key={speaker.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30"
            >
              <Avatar name={speaker.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{speaker.name}</h4>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{speaker.role}</span>
                  <span className={`ml-auto text-xs font-medium ${sentimentColors[speaker.sentiment]}`}>
                    {speaker.sentiment}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <HiMicrophone className="w-3.5 h-3.5" />
                    Speaking time: {speaker.speakingTime}%
                  </span>
                  <span className="flex items-center gap-1">
                    <HiChartBar className="w-3.5 h-3.5" />
                    Pace: {speaker.talkSpeed}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <HiTag className="w-3 h-3 text-gray-400" />
                  {speaker.topics.map(topic => (
                    <Badge key={topic} variant="default" size="sm">{topic}</Badge>
                  ))}
                </div>

                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${speaker.speakingTime}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-violet-500' : i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-amber-500' : i === 3 ? 'bg-sky-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
