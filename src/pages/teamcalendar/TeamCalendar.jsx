import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiUsers, HiPlus, HiChevronLeft, HiChevronRight, HiVideoCamera, HiCheckCircle, HiTrash } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const formatTime = (t) => {
  const [h, m] = String(t).split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

const formatDuration = (min) => {
  const n = Number(min);
  if (n < 60) return `${n}m`;
  const h = n / 60;
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
};

const buildEvents = (meetings) => (meetings || []).map((m, i) => ({
  id: m.meetingId || m.id || `mev-${i}`,
  title: m.title,
  date: m.date,
  time: formatTime(m.time),
  duration: formatDuration(m.duration),
  attendees: m.participants?.length || 0,
  type: 'meeting',
  color: 'primary',
  meetingId: m.id,
}));

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function TeamCalendar() {
  const { user } = useAuth();
  const { meetings, createInstantMeeting } = useApp();
  const [monthIdx, setMonthIdx] = useState(6);
  const [selectedDay, setSelectedDay] = useState('2026-07-31');
  const [allEvents, setAllEvents] = useState(() => buildEvents(meetings));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '10:00 AM', duration: '30m', type: 'meeting' });

  const currentMonth = `${months[monthIdx]} 2026`;
  const dayEvents = allEvents.filter((e) => e.date === selectedDay);

  const handlePrevMonth = () => setMonthIdx((p) => (p > 0 ? p - 1 : 11));
  const handleNextMonth = () => setMonthIdx((p) => (p < 11 ? p + 1 : 0));

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) { toast.error('Event title required'); return; }
    const e = { id: Date.now(), title: newEvent.title, date: selectedDay, time: newEvent.time, duration: newEvent.duration, attendees: 1, type: newEvent.type, color: 'primary' };
    setAllEvents((prev) => [...prev, e]);
    setShowAddModal(false);
    setNewEvent({ title: '', time: '10:00 AM', duration: '30m', type: 'meeting' });
    toast.success(`Event "${newEvent.title}" added`);
  };

  const handleJoinEvent = (title) => {
    createInstantMeeting({ id: user?.id || 'u7', role: user?.role || 'employee' });
    toast.success(`Joining: ${title}`);
  };

  const handleDeleteEvent = (eventId) => {
    setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
    toast.success('Event removed');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Team Calendar - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Calendar</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Shared team schedule and events</p>
        </div>
        <Button variant="primary" icon={HiPlus} onClick={() => setShowAddModal(true)}>Add Event</Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentMonth}</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={HiChevronLeft} onClick={handlePrevMonth}>Back</Button>
              <Button variant="ghost" size="sm" icon={HiChevronRight} onClick={handleNextMonth}>Next</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d) => (
              <div key={d} className="text-xs font-medium text-gray-500 dark:text-slate-400 py-2">{d}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-07-${String(day).padStart(2, '0')}`;
              const hasEvent = allEvents.some((e) => e.date === dateStr);
              const isSelected = selectedDay === dateStr;
              return (
                <button key={day} onClick={() => setSelectedDay(dateStr)}
                  className={`w-full aspect-square rounded-lg text-sm flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-slate-700 ${isSelected ? 'bg-primary-600 text-white font-bold' : hasEvent ? 'bg-primary-50 dark:bg-primary-500/10 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-500"></span>Today</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-100"></span>Event</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedDay} Events ({dayEvents.length})
          </h2>
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-slate-500">
              <HiCalendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((e) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-${e.color}-100 dark:bg-${e.color}-500/20 flex items-center justify-center`}>
                    {e.type === 'meeting' && <HiVideoCamera className={`w-6 h-6 text-${e.color}-500`} />}
                    {e.type === 'personal' && <HiClock className={`w-6 h-6 text-${e.color}-500`} />}
                    {e.type === 'social' && <HiUsers className={`w-6 h-6 text-${e.color}-500`} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{e.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{e.time} ({e.duration})</span>
                      <span className="flex items-center gap-1"><HiUsers className="w-3 h-3" />{e.attendees}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleJoinEvent(e.title)}>Join</Button>
                    <Button variant="ghost" size="xs" icon={HiTrash} onClick={() => handleDeleteEvent(e.id)}>Delete</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Team Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {allEvents.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800/30 transition-all cursor-pointer"
              onClick={() => setSelectedDay(e.date)}>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={e.color === 'primary' ? 'info' : e.color === 'violet' ? 'success' : e.color === 'amber' ? 'warning' : 'info'} size="sm">{e.type}</Badge>
                {e.type === 'meeting' && <HiCheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{e.title}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{e.date} at {e.time}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400 flex items-center gap-1"><HiUsers className="w-3 h-3" />{e.attendees}</span>
                <span className="text-xs text-gray-400">{e.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {showAddModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Event</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                <input value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Event title" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Time</label>
                <input value={newEvent.time} onChange={(e) => setNewEvent((p) => ({ ...p, time: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="10:00 AM" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Duration</label>
                  <select value={newEvent.duration} onChange={(e) => setNewEvent((p) => ({ ...p, duration: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                    <option>15m</option><option>30m</option><option>45m</option><option>1h</option><option>1.5h</option><option>2h</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
                  <select value={newEvent.type} onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="meeting">Meeting</option><option value="personal">Personal</option><option value="social">Social</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddEvent}>Create Event</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}