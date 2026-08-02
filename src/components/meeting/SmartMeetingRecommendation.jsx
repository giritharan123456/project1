import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiClock, HiUserGroup, HiCalendar, HiLightningBolt, HiPlusCircle } from 'react-icons/hi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const staticRecommendations = [
  { title: 'Q4 Planning Sync', suggestedTime: 'Tomorrow 10:00 AM', match: 94, attendees: ['Sarah Chen', 'Marcus Johnson', 'Rachel Torres'] },
  { title: 'Engineering Sprint Review', suggestedTime: 'Thu 2:00 PM', match: 87, attendees: ['Marcus Johnson', 'Emily Nakamura', 'David Park'] },
  { title: 'Design Critique Session', suggestedTime: 'Fri 11:00 AM', match: 82, attendees: ['Rachel Torres', 'David Park'] },
];

const staticFrequentPeople = [
  { name: 'Marcus Johnson', meetingCount: 24, role: 'Engineering Lead' },
  { name: 'Sarah Chen', meetingCount: 18, role: 'Product Manager' },
  { name: 'Emily Nakamura', meetingCount: 15, role: 'QA Lead' },
  { name: 'Rachel Torres', meetingCount: 12, role: 'Marketing Lead' },
  { name: 'David Park', meetingCount: 10, role: 'Software Architect' },
];

const staticOptimalTime = { day: 'Tuesday', time: '2:00 PM', availability: 87 };

function formatSuggestedTime(meeting) {
  if (!meeting?.date) return 'Soon';
  try {
    const date = new Date(`${meeting.date}T12:00:00`);
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${meeting.time ? ` ${meeting.time}` : ''}`;
  } catch {
    return meeting.date;
  }
}

export default function SmartMeetingRecommendation({ meetings = [], users = [], optimalTime = staticOptimalTime }) {
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    if (!Array.isArray(meetings) || meetings.length === 0) return staticRecommendations;
    return meetings.slice(0, 3).map((m) => ({
      title: m.title,
      suggestedTime: formatSuggestedTime(m),
      match: Math.min(96, 70 + (m.participants?.length || 0) * 4),
      attendees: (m.participants || [])
        .map((pid) => users.find((u) => u.id === pid)?.name || pid)
        .slice(0, 5),
    }));
  }, [meetings, users]);

  const frequentPeople = useMemo(() => {
    const counts = {};
    const roles = {};
    (Array.isArray(meetings) ? meetings : []).forEach((m) => {
      (m.participants || []).forEach((pid) => {
        const u = users.find((x) => x.id === pid);
        const name = u?.name || pid;
        counts[name] = (counts[name] || 0) + 1;
        if (u && !roles[name]) roles[name] = u.title;
      });
    });
    const people = Object.entries(counts)
      .map(([name, meetingCount]) => ({ name, meetingCount, role: roles[name] || 'Participant' }))
      .sort((a, b) => b.meetingCount - a.meetingCount)
      .slice(0, 5);
    return people.length ? people : staticFrequentPeople;
  }, [meetings, users]);

  const scheduleRecommendation = (rec) => {
    toast.success(`Scheduling "${rec.title}" — ${rec.suggestedTime}`);
    navigate('/app/schedule');
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <HiLightningBolt className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Recommendations</h3>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <HiCalendar className="w-4 h-4" /> Based on Your Schedule
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => scheduleRecommendation(rec)}
                className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{rec.suggestedTime}</p>
                  </div>
                  <Badge variant="success" size="sm">{rec.match}% match</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5">
                      {rec.attendees.slice(0, 3).map(name => (
                        <Avatar key={name} name={name} size="xs" />
                      ))}
                    </div>
                    {rec.attendees.length > 3 && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">+{rec.attendees.length - 3}</span>
                    )}
                  </div>
                  <Button variant="primary" size="xs" icon={HiPlusCircle} onClick={(e) => { e.stopPropagation(); scheduleRecommendation(rec); }}>Schedule</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <HiUserGroup className="w-4 h-4" /> People You Meet Frequently
          </h4>
          <div className="space-y-2">
            {frequentPeople.map((person) => (
              <div key={person.name} className="flex items-center gap-3 py-2">
                <Avatar name={person.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{person.role}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-500">{person.meetingCount} meetings</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10">
            <div className="flex items-center gap-2 mb-1">
              <HiClock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">Optimal Time</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{optimalTime.day} {optimalTime.time}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{optimalTime.availability}% team availability</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10">
            <div className="flex items-center gap-2 mb-1">
              <HiLightningBolt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Best Length</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">30 minutes</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Most productive duration</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
