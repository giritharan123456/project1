import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

export default function useMeetingReminders() {
  const { meetings } = useApp();

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      meetings.forEach(meeting => {
        if (meeting.status !== 'upcoming') return;
        const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
        const diffMs = meetingDate.getTime() - now.getTime();
        const diffMin = diffMs / 60000;

        if (diffMin > 0 && diffMin <= 15) {
          const title = `Upcoming Meeting: ${meeting.title}`;
          const body = `Starting in ${Math.round(diffMin)} minute${Math.round(diffMin) === 1 ? '' : 's'} at ${meeting.time}`;

          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(title, { body, icon: '/favicon.ico' });
            } catch {
              // fallback
            }
          }

          toast.success(`${title} - ${body}`, { duration: 5000 });
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [meetings]);
}
