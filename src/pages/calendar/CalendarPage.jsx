import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HiChevronLeft, HiChevronRight, HiCalendar, HiPlus,
  HiClock, HiUsers,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const VIEWS = ['Month', 'Week', 'Day', 'Agenda'];

const meetingTypeConfig = {
  Personal: { color: 'bg-violet-500', light: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300' },
  Team: { color: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  Company: { color: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300' },
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getMonthGrid(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const grid = [];
  let week = [];
  for (let i = 0; i < firstDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  if (week.length) grid.push(week);
  return grid;
}

function formatTime(start, duration) {
  const [h, m] = start.split(':').map(Number);
  const s = new Date(2026, 0, 1, h, m);
  const e = new Date(s.getTime() + duration * 60000);
  const f = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${f(s)} - ${f(e)}`;
}

export default function CalendarPage() {
  const { meetings, users, scheduleMeeting } = useApp();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState('Month');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '', date: '', time: '', duration: 30, type: 'Team', description: '',
  });

  const navigate = useCallback((dir) => {
    const next = new Date(currentDate);
    if (view === 'Month') next.setMonth(next.getMonth() + dir);
    else if (view === 'Week') next.setDate(next.getDate() + dir * 7);
    else next.setDate(next.getDate() + dir);
    setCurrentDate(next);
  }, [currentDate, view]);

  const getHeader = () => {
    const opts = { month: 'long', year: 'numeric' };
    if (view === 'Month') return currentDate.toLocaleDateString('en-US', opts);
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const dayOpts = { month: 'short', day: 'numeric' };
    if (view === 'Agenda') return 'Upcoming Events';
    return `${weekStart.toLocaleDateString('en-US', dayOpts)} - ${weekEnd.toLocaleDateString('en-US', dayOpts)}`;
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const meetingsForDay = useCallback((date) => {
    const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return meetings.filter((m) => m.date === ds);
  }, [meetings]);

  const getUser = (id) => users.find((u) => u.id === id);
  const isToday = (d) => {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const renderMonthView = () => (
    <Calendar
      activeStartDate={currentDate}
      onChange={(date) => setSelectedDay(date)}
      value={selectedDay}
      tileContent={({ date, view }) => {
        if (view !== 'month') return null;
        const dayMeetings = meetingsForDay(date);
        if (dayMeetings.length === 0) return null;
        return (
          <div className="flex gap-0.5 justify-center mt-0.5">
            {dayMeetings.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className={`w-1.5 h-1.5 rounded-full ${meetingTypeConfig[m.type]?.color || 'bg-gray-400'}`}
              />
            ))}
          </div>
        );
      }}
      tileClassName={({ date, view }) => {
        if (view !== 'month') return null;
        const cls = [];
        if (isToday(date)) cls.push('!bg-primary-50 dark:!bg-primary-900/10 !text-primary-600 dark:!text-primary-400 !font-bold');
        if (selectedDay && date.getTime() === selectedDay.getTime()) {
          cls.push('!ring-2 !ring-primary-500 !bg-primary-50 dark:!bg-primary-900/20 !text-primary-600 dark:!text-primary-400');
        }
        return cls.join(' ') || null;
      }}
      showNavigation={false}
      className="w-full border-0 bg-transparent font-sans"
      locale="en-US"
      minDetail="month"
    />
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="overflow-auto">
        <div className="grid grid-cols-8 gap-1 min-w-[700px]">
          <div className="pt-8" />
          {weekDays.map((d, i) => {
            const dayMeetings = meetingsForDay(d);
            return (
              <div key={i} className="text-center">
                <div className={`text-xs font-semibold mb-1 ${isToday(d) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'}`}>
                  {dayNames[i]}
                </div>
                <div className={`text-lg font-bold mb-2 ${isToday(d) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                  {d.getDate()}
                </div>
                <div className="space-y-1">
                  {dayMeetings.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className={`w-full text-left text-[11px] p-1.5 rounded-lg font-medium ${meetingTypeConfig[m.type]?.light || 'bg-gray-100 dark:bg-slate-700'} ${meetingTypeConfig[m.type]?.text || 'text-gray-700 dark:text-slate-300'} hover:shadow-sm transition-shadow`}
                    >
                      <div className="truncate font-semibold">{m.title}</div>
                      <div className="truncate opacity-75">{m.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-0.5 min-w-[700px]">
          {HOURS.map((h) => {
            const timeStr = `${String(h).padStart(2, '0')}:00`;
            return (
              <div key={h} className="grid grid-cols-8 gap-1">
                <div className="text-[11px] text-gray-400 dark:text-slate-500 text-right pr-2 py-3">{timeStr}</div>
                {weekDays.map((d, i) => {
                  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  const hourMeetings = meetings.filter((m) => m.date === ds && m.time.startsWith(String(h).padStart(2, '0')));
                  return (
                    <div key={i} className="border-t border-gray-100 dark:border-slate-700 min-h-[40px] p-0.5">
                      {hourMeetings.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMeeting(m)}
                          className={`text-[10px] p-1 rounded cursor-pointer ${meetingTypeConfig[m.type]?.light || 'bg-gray-100 dark:bg-slate-700'}`}
                        >
                          {m.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const ds = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    return (
      <div className="space-y-1">
        <div className="text-center mb-4">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
        {HOURS.map((h) => {
          const timeStr = `${String(h).padStart(2, '0')}:00`;
          const hourMeetings = meetings.filter((m) => m.date === ds && m.time.startsWith(String(h).padStart(2, '0')));
          const isPast = new Date() > new Date(ds + 'T' + timeStr);
          return (
            <div key={h} className={`flex gap-3 p-2 rounded-xl ${isPast ? 'opacity-50' : ''}`}>
              <div className="w-16 text-right text-xs text-gray-400 dark:text-slate-500 py-1 flex-shrink-0">{timeStr}</div>
              <div className="flex-1 min-h-[40px] border-t border-gray-100 dark:border-slate-700 pt-1">
                {hourMeetings.length > 0 ? (
                  <div className="space-y-1">
                    {hourMeetings.map((m) => {
                      const host = getUser(m.host);
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMeeting(m)}
                          className={`w-full text-left p-2 rounded-lg ${meetingTypeConfig[m.type]?.light || 'bg-gray-100 dark:bg-slate-700'} hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</span>
                            <Badge size="sm">{m.type}</Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {formatTime(m.time, m.duration)} &middot; {host?.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAgendaView = () => {
    const sorted = [...meetings]
      .filter((m) => new Date(m.date + 'T' + m.time) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    if (!sorted.length) {
      return <EmptyState icon={HiCalendar} title="No upcoming events" description="Schedule a meeting to get started" />;
    }
    return (
      <div className="space-y-2">
        {sorted.map((m) => {
          const host = getUser(m.host);
          const d = new Date(m.date + 'T12:00:00');
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMeeting(m)}
              className="w-full text-left p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{d.getDate()}</div>
                  <div className="text-xs font-medium text-gray-500 dark:text-slate-400">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{m.title}</h4>
                    <Badge variant="primary" size="sm">{m.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><HiClock className="w-3.5 h-3.5" />{formatTime(m.time, m.duration)}</span>
                    <span className="flex items-center gap-1"><HiUsers className="w-3.5 h-3.5" />{m.participants.length} participants</span>
                    {host && <span>{host.name}</span>}
                  </div>
                </div>
                <HiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (view) {
      case 'Month': return renderMonthView();
      case 'Week': return renderWeekView();
      case 'Day': return renderDayView();
      case 'Agenda': return renderAgendaView();
      default: return renderMonthView();
    }
  };

  const miniCalendarMonths = useMemo(() => {
    const m = new Date(currentDate);
    m.setMonth(m.getMonth() - 1);
    return [m, new Date(currentDate), new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)];
  }, [currentDate]);

  const upcomingEvents = useMemo(() => {
    return [...meetings]
      .filter((m) => m.status !== 'completed')
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [meetings]);

  const handleSchedule = () => {
    if (scheduleForm.title && scheduleForm.date && scheduleForm.time) {
      scheduleMeeting(scheduleForm);
      setShowScheduleModal(false);
      setScheduleForm({ title: '', date: '', time: '', duration: 30, type: 'Team', description: '' });
    }
  };

  return (
    <>
      <style>{`
        .react-calendar { width: 100%; border: none; font-family: inherit; background: transparent; }
        .dark .react-calendar { background: transparent; color: #f1f5f9; }
        .react-calendar__month-view__weekdays { text-transform: uppercase; font-size: 0.75rem; font-weight: 600; color: #64748b; padding-bottom: 0.25rem; }
        .dark .react-calendar__month-view__weekdays { color: #94a3b8; }
        .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
        .react-calendar__month-view__days__day { font-size: 0.8rem; padding: 0.5rem 0.25rem !important; transition: all 0.15s; position: relative; border-radius: 0.75rem; }
        .dark .react-calendar__month-view__days__day { color: #cbd5e1; }
        .dark .react-calendar__month-view__days__day:enabled:hover,
        .dark .react-calendar__month-view__days__day:enabled:focus { background-color: rgba(51, 65, 85, 0.5); color: #f1f5f9; }
        .react-calendar__month-view__days__day--neighboringMonth { opacity: 0.4; }
        .react-calendar__tile { background: transparent; }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus { background-color: #f1f5f9; border-radius: 0.75rem; }
        .dark .react-calendar__tile:enabled:hover,
        .dark .react-calendar__tile:enabled:focus { background-color: rgba(51, 65, 85, 0.5); }
        .react-calendar__tile--now { background: transparent; }
        .react-calendar__tile--active { background: transparent; }
      `}</style>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Calendar - AdzConnect</title>
        <meta name="description" content="View and manage your AdzConnect meeting calendar with monthly, weekly, daily, and agenda views." />
      </Helmet>
      <div className="flex gap-8">
        {/* Main */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getHeader()}</h1>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <HiChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                </button>
                <button onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))} className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors">
                  Today
                </button>
                <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <HiChevronRight className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
                {VIEWS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${view === v ? 'bg-white dark:bg-slate-600 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Button size="sm" icon={HiPlus} onClick={() => setShowScheduleModal(true)}>Schedule</Button>
            </div>
          </div>

          {/* Calendar Content */}
          <Card>
            {renderMainContent()}
          </Card>

          {/* Selected Day Events */}
          {selectedDay && view === 'Month' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Events for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Close</button>
              </div>
              {meetingsForDay(selectedDay).length > 0 ? (
                <div className="space-y-2">
                  {meetingsForDay(selectedDay).map((m) => {
                    const host = getUser(m.host);
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMeeting(m)}
                        className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-10 rounded-full ${meetingTypeConfig[m.type]?.color || 'bg-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{formatTime(m.time, m.duration)} &middot; {host?.name}</p>
                          </div>
                          <Badge size="sm">{m.type}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={HiCalendar} title="No events" description="No events scheduled for this day" />
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 space-y-6 hidden xl:block">
          {/* Mini Calendar */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Mini Calendar</h3>
            <div className="space-y-3">
              {miniCalendarMonths.map((m, idx) => {
                const grid = getMonthGrid(m.getFullYear(), m.getMonth());
                return (
                  <div key={idx}>
                    <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
                      {m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center text-[10px]">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-gray-400 dark:text-slate-500 font-medium py-0.5">{d}</div>
                      ))}
                      {grid.flat().map((day, i) => {
                        if (!day) return <div key={i} />;
                        const date = new Date(m.getFullYear(), m.getMonth(), day);
                        const hasEvents = meetingsForDay(date).length > 0;
                        return (
                          <div
                            key={i}
                            className={`py-0.5 rounded ${isToday(date) ? 'bg-primary-600 text-white font-bold' : hasEvents ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-slate-300'}`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming</h3>
              <Badge size="sm" variant="primary">{upcomingEvents.length}</Badge>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((m) => {
                const d = new Date(m.date + 'T12:00:00');
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMeeting(m);
                      setView('Day');
                      setCurrentDate(new Date(m.date + 'T12:00:00'));
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 leading-none">{d.getDate()}</span>
                      <span className="text-[8px] font-medium text-primary-500 dark:text-primary-300 leading-none">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{m.title}</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400">{m.time}</p>
                    </div>
                  </button>
                );
              })}
              {!upcomingEvents.length && (
                <EmptyState icon={HiCalendar} title="No upcoming events" />
              )}
            </div>
          </Card>

          {/* Schedule Button */}
          <Button fullWidth icon={HiPlus} onClick={() => setShowScheduleModal(true)}>Schedule Event</Button>
        </div>
      </div>

      {/* Schedule Event Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); setScheduleForm({ title: '', date: '', time: '', duration: 30, type: 'Team', description: '' }); }}
        title="Schedule Event"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowScheduleModal(false); setScheduleForm({ title: '', date: '', time: '', duration: 30, type: 'Team', description: '' }); }}>Cancel</Button>
            <Button icon={HiCalendar} onClick={handleSchedule} disabled={!scheduleForm.title || !scheduleForm.date || !scheduleForm.time}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Event Title"
            placeholder="Enter event title"
            value={scheduleForm.title}
            onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Duration</label>
              <select
                value={scheduleForm.duration}
                onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[15, 30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Type</label>
              <select
                value={scheduleForm.type}
                onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Personal">Personal</option>
                <option value="Team">Team</option>
                <option value="Company">Company</option>
              </select>
            </div>
          </div>
          <Input
            label="Description (optional)"
            placeholder="Add a description"
            value={scheduleForm.description}
            onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
          />
        </div>
      </Modal>

      {/* Meeting Detail Modal */}
      <Modal
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        title={selectedMeeting?.title || ''}
        size="sm"
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{selectedMeeting.type}</Badge>
              <Badge variant={selectedMeeting.status === 'live' ? 'success' : selectedMeeting.status === 'upcoming' ? 'info' : 'default'}>
                {selectedMeeting.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiCalendar className="w-4 h-4 text-gray-400" />
                {new Date(selectedMeeting.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiClock className="w-4 h-4 text-gray-400" />
                {formatTime(selectedMeeting.time, selectedMeeting.duration)}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiUsers className="w-4 h-4 text-gray-400" />
                {selectedMeeting.participants.length} participants
              </div>
            </div>
            {selectedMeeting.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selectedMeeting.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Host</p>
              <div className="flex items-center gap-2">
                <Avatar src={getUser(selectedMeeting.host)?.avatar} name={getUser(selectedMeeting.host)?.name} size="sm" />
                <span className="text-sm text-gray-900 dark:text-white">{getUser(selectedMeeting.host)?.name}</span>
              </div>
            </div>
            {selectedMeeting.participants.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Participants</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.participants.map((pid) => {
                    const u = getUser(pid);
                    return u ? (
                      <div key={pid} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                        <Avatar src={u.avatar} name={u.name} size="xs" />
                        <span className="text-xs text-gray-700 dark:text-slate-300">{u.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
    </>
  );
}
