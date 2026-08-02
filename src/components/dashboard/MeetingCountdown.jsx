import { useState, useEffect, useRef } from 'react';
import { HiClock } from 'react-icons/hi';
import Card from '../ui/Card';

export default function MeetingCountdown({ targetDate, targetTime, label = 'Meeting starts in' }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const target = targetDate && targetTime
      ? new Date(`${targetDate}T${targetTime}`).getTime()
      : targetDate
        ? new Date(targetDate).getTime()
        : null;

    if (!target) return;

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(intervalRef.current);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [targetDate, targetTime]);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.minutes < 5 && timeLeft.days === 0 && timeLeft.hours === 0;

  return (
    <Card className={`p-4 ${isUrgent ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <HiClock className="w-4 h-4" />
        <span className="text-xs font-medium opacity-90">{label}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-bold">{timeLeft.days}</span>
            <span className="text-xs opacity-80 block">days</span>
          </div>
        )}
        <div className="text-center">
          <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs opacity-80 block">hrs</span>
        </div>
        <span className="text-xl font-bold opacity-60 mt-4">:</span>
        <div className="text-center">
          <span className={`text-xl sm:text-2xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs opacity-80 block">min</span>
        </div>
        <span className="text-xl font-bold opacity-60 mt-4">:</span>
        <div className="text-center">
          <span className={`text-xl sm:text-2xl font-bold ${isUrgent ? 'animate-pulse' : ''}`}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs opacity-80 block">sec</span>
        </div>
      </div>
    </Card>
  );
}