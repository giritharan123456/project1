import { motion } from 'framer-motion';
import { HiCheckCircle, HiClock, HiCode } from 'react-icons/hi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const mockDecisions = [
  { id: 1, text: 'Virtual background feature will be released mid-August pending QA approval', decidedBy: 'Sarah Chen', timestamp: '00:04:15', status: 'Approved' },
  { id: 2, text: 'Real-time translation feature will use Google Cloud Translation API with custom model for technical terms', decidedBy: 'Marcus Johnson', timestamp: '00:07:00', status: 'Approved' },
  { id: 3, text: 'Marketing budget of $45,000 approved for Connectly Spaces launch campaign', decidedBy: 'Sarah Chen', timestamp: '00:09:30', status: 'Approved' },
  { id: 4, text: 'Developer relations program to be established for third-party API integrations', decidedBy: 'David Park', timestamp: '00:11:00', status: 'In Review' },
];

const statusIcons = { Approved: HiCheckCircle, 'In Review': HiClock, Implemented: HiCode };
const statusVariants = { Approved: 'success', 'In Review': 'warning', Implemented: 'primary' };

export default function AIDecisions({ decisions = mockDecisions }) {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Decisions Made</h3>

        <div className="space-y-3">
          {decisions.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-6">No decisions captured yet. Decisions are extracted from chat messages such as "we will", "decided", or "agreed".</p>
          )}
          {decisions.map((decision, i) => {
            const StatusIcon = statusIcons[decision.status];
            return (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30"
              >
                <div className={`mt-0.5 ${decision.status === 'Approved' ? 'text-emerald-500' : decision.status === 'In Review' ? 'text-amber-500' : 'text-primary-500'}`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{decision.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={decision.decidedBy} size="xs" />
                      <span className="text-xs text-gray-500 dark:text-slate-400">{decision.decidedBy}</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">{decision.timestamp}</span>
                    <Badge variant={statusVariants[decision.status]} size="sm">{decision.status}</Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
