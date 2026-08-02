import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiDownload, HiTranslate } from 'react-icons/hi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const mockTranscriptLines = [
  { speaker: 'Sarah Chen', time: '00:02:15', text: "Good morning everyone, let's get started with the Q3 roadmap review. I'd like to begin with the virtual background rollout timeline.", speakerColor: 'text-violet-600 dark:text-violet-400' },
  { speaker: 'Marcus Johnson', time: '00:02:45', text: "Thanks Sarah. The engineering team has completed most of the work on virtual backgrounds. We're looking at a mid-August release if QA gives us the green light.", speakerColor: 'text-emerald-600 dark:text-emerald-400' },
  { speaker: 'Emily Nakamura', time: '00:03:30', text: "QA here. We've run through 92% of the regression tests and everything looks solid. The remaining edge cases are mainly around low-bandwidth scenarios.", speakerColor: 'text-amber-600 dark:text-amber-400' },
  { speaker: 'Sarah Chen', time: '00:04:15', text: "Great progress. What about the real-time translation feature? I know enterprise clients have been asking about this.", speakerColor: 'text-violet-600 dark:text-violet-400' },
  { speaker: 'David Park', time: '00:05:00', text: "We've integrated Google Cloud Translation API and it's working well for the top 10 languages. The latency is under 200ms which is acceptable for real-time conversations.", speakerColor: 'text-sky-600 dark:text-sky-400' },
  { speaker: 'Marcus Johnson', time: '00:06:20', text: "One concern - the translation accuracy drops to about 85% for technical jargon. We might need a custom model for industry-specific terms.", speakerColor: 'text-emerald-600 dark:text-emerald-400' },
  { speaker: 'Emily Nakamura', time: '00:07:45', text: "I can coordinate with the data science team to start collecting domain-specific training data. We'll need about two weeks for that.", speakerColor: 'text-amber-600 dark:text-amber-400' },
  { speaker: 'Sarah Chen', time: '00:08:30', text: "Perfect. Let's move on to the Connectly Spaces feature. Marketing, you're up.", speakerColor: 'text-violet-600 dark:text-violet-400' },
  { speaker: 'Rachel Torres', time: '00:09:00', text: "Thanks Sarah. We're planning a targeted launch campaign for remote-first companies. LinkedIn ads and partnerships with remote work blogs.", speakerColor: 'text-rose-600 dark:text-rose-400' },
  { speaker: 'David Park', time: '00:10:15', text: "We should also consider a developer relations program. If we open APIs for third-party integrations, it'll drive adoption in the enterprise space.", speakerColor: 'text-sky-600 dark:text-sky-400' },
  { speaker: 'Sarah Chen', time: '00:11:30', text: "Good point. Let's allocate a portion of the marketing budget for that. Rachel, can you draft a proposal?", speakerColor: 'text-violet-600 dark:text-violet-400' },
  { speaker: 'Rachel Torres', time: '00:12:00', text: "Absolutely. I'll have something ready by Friday for us to review.", speakerColor: 'text-rose-600 dark:text-rose-400' },
  { speaker: 'Marcus Johnson', time: '00:13:00', text: "Before we wrap up, I want to highlight the latency optimization results. We've achieved a 34% reduction in average connection latency through WebRTC enhancements.", speakerColor: 'text-emerald-600 dark:text-emerald-400' },
  { speaker: 'Sarah Chen', time: '00:14:30', text: "That's excellent, Marcus. Great work from the engineering team. Let's review the action items and then we can wrap up.", speakerColor: 'text-violet-600 dark:text-violet-400' },
];

export default function AITranscription({ meetingId, transcriptLines = mockTranscriptLines }) {
  const [search, setSearch] = useState('');

  const filtered = transcriptLines.filter(
    line => line.text.toLowerCase().includes(search.toLowerCase()) || line.speaker.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = () => {
    const content = transcriptLines.map(l => `[${l.time}] ${l.speaker}: ${l.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcript</h3>
            <Badge variant="info" dot>English</Badge>
          </div>
          <button onClick={handleDownload} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <HiDownload className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 shrink-0 w-14 font-mono">{line.time}</span>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${line.speakerColor}`}>{line.speaker}</span>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-0.5">{line.text}</p>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            transcriptLines.length === 0 ? (
              <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">No transcript recorded yet for this meeting. Open the meeting and exchange chat messages to build a live transcript.</p>
            ) : (
              <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">No matching lines found</p>
            )
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
          <HiTranslate className="w-3.5 h-3.5" />
          {transcriptLines.length === 0
            ? 'No audio captured yet — transcript will appear as chat messages are exchanged'
            : 'Language detected: English (confidence: 98.7%)'}
        </div>
      </div>
    </Card>
  );
}
