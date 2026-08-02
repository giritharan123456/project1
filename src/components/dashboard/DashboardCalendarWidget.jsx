import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { HiPlus, HiPlay, HiVideoCamera } from 'react-icons/hi';
import { useApp } from '../../context/AppContext';
import 'react-calendar/dist/Calendar.css';

const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const statusVariant = {
  live: 'success',
  upcoming: 'primary',
  completed: 'default',
  cancelled: 'danger',
};

export default function DashboardCalendarWidget() {
  const { meetings = [], users = [] } = useApp();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());

  const meetingDates = useMemo(() => {
    const set = new Set();
    (meetings || []).forEach((m) => {
      if (m?.date) set.add(m.date);
    });
    return set;
  }, [meetings]);

  const selectedMeetings = useMemo(() => {
    const key = toDateKey(date);
    return (meetings || [])
      .filter((m) => m?.date === key)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      .slice(0, 4);
  }, [meetings, date]);

  const todayKey = toDateKey(new Date());

  const isToday = toDateKey(date) === todayKey;
  const hasMeetings = selectedMeetings.length > 0;
  const upcomingCount = useMemo(() => (meetings || []).filter((m) => m?.status === 'upcoming').length, [meetings]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Calendar</h3>
        <Button size="sm" icon={HiPlus} onClick={() => navigate('/app/schedule')}>Schedule</Button>
      </div>
      <Calendar
        onChange={setDate}
        value={date}
        className="w-full border-0 rounded-xl"
        tileClassName={({ date: d, view }) => {
          if (view !== 'month') return '';
          if (toDateKey(d) === todayKey) return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-bold';
          if (meetingDates.has(toDateKey(d))) return 'text-violet-700 dark:text-violet-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-semibold';
          return 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg';
        }}
        tileContent={({ date: d, view }) =>
          view === 'month' && meetingDates.has(toDateKey(d)) ? (
            <div className="flex justify-center mt-1">
              <span className="w-1 h-1 rounded-full bg-violet-500 dark:bg-violet-400 inline-block" />
            </div>
          ) : null
        }
      />
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-slate-500">
            {isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          {upcomingCount > 0 && <span className="text-xs text-gray-400 dark:text-slate-500">{upcomingCount} upcoming</span>}
        </div>
        {hasMeetings ? (
          <div className="space-y-2">
            {selectedMeetings.map((m) => {
              const host = users?.find((u) => u?.id === m.hostId);
              return (
                <button
                  key={m.id}
                  onClick={() => navigate(`/app/meeting/${m.id}`)}
                  className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                      {m.time} · {host ? host.name : 'Host'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[m.status] || 'neutral'} size="sm">
                      {m.status === 'live' ? 'Live now' : m.status}
                    </Badge>
                    {m.status === 'live' && (
                      <span className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                        <HiPlay className="w-3.5 h-3.5" /> Join
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 p-4 text-center space-y-2">
            <HiVideoCamera className="w-6 h-6 mx-auto text-gray-300 dark:text-slate-600" />
            <p className="text-sm text-gray-500 dark:text-slate-400">No meetings on this date</p>
            <Button size="sm" variant="outline" icon={HiPlus} onClick={() => navigate('/app/schedule')}>Schedule a meeting</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
