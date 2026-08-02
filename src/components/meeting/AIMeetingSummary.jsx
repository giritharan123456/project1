import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiClipboardCopy, HiDownload, HiRefresh, HiX } from 'react-icons/hi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const mockSummary = {
  paragraphs: [
    "The team conducted a comprehensive review of the Q3 product roadmap, focusing primarily on the new video conferencing feature set. Key discussion points included the timeline for the virtual background rollout, which is currently scheduled for mid-August, and the integration of real-time translation services that has been a highly requested feature from enterprise clients.",
    "Significant progress was reported on the latency optimization initiative. The engineering team has successfully reduced average connection latency by 34% through the implementation of WebRTC enhancements and edge server caching strategies. The QA team confirmed that the latest build passed 92% of regression tests, with the remaining 8% related to edge cases in low-bandwidth scenarios.",
    "The marketing team presented the launch strategy for the upcoming 'Connectly Spaces' feature. The campaign will target remote-first companies through LinkedIn and industry-specific publications. A budget of $45,000 was approved for the initial rollout, with an additional $20,000 allocated for a developer relations program to encourage third-party integrations.",
    "Several action items were assigned regarding the security audit findings. The infrastructure team will prioritize patching the identified vulnerabilities by end of month, while the compliance team will begin drafting updated data handling policies to align with the upcoming GDPR amendments effective next quarter."
  ],
  keyTopics: ['Virtual Backgrounds', 'Real-time Translation', 'Latency Optimization', 'Connectly Spaces', 'Security Audit', 'GDPR Compliance'],
  sentiment: { label: 'Positive', score: 78, color: 'emerald' }
};

export default function AIMeetingSummary({ meetingId, summary = mockSummary, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary.paragraphs.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary.paragraphs.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${meetingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Summary</h3>
                <Badge variant="primary" dot>AI Generated</Badge>
              </div>
            </div>
            {onClose && <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} />}
          </div>

        <div className="space-y-4">
          {summary.paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-gray-600 dark:text-slate-300 leading-relaxed text-sm"
            >
              {para}
            </motion.p>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Key Topics Identified</h4>
          <div className="flex flex-wrap gap-2">
            {summary.keyTopics.map((topic) => (
              <Badge key={topic} variant="info">{topic}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Sentiment Analysis</h4>
          <div className="flex items-center gap-4">
            <Badge variant={summary.sentiment.color}>{summary.sentiment.label}</Badge>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.sentiment.score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  summary.sentiment.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-slate-400">{summary.sentiment.score}%</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="sm" icon={copied ? HiSparkles : HiClipboardCopy} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Summary'}
          </Button>
          <Button variant="secondary" size="sm" icon={HiDownload} onClick={handleDownload}>
            Download Summary
          </Button>
          <Button variant="ghost" size="sm" icon={HiRefresh} onClick={() => toast.success('AI regenerating summary...')}>
            Regenerate
          </Button>
        </div>
      </div>
    </Card>
  );
}
