import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUserAdd, HiVideoCamera, HiLockOpen, HiClock } from 'react-icons/hi';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function GuestAccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [step, setStep] = useState('name');
  const [guestSession, setGuestSession] = useState(null);

  const handleContinue = () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    setStep('meeting');
  };

  useEffect(() => {
    const storedGuest = localStorage.getItem('guest_user');
    if (storedGuest && !user) {
      try {
        const parsed = JSON.parse(storedGuest);
        if (parsed.role === 'guest') {
          setGuestSession(parsed);
          if (!step.includes('meeting')) {
            toast.info(`Welcome back, ${parsed.name}!`);
          }
        } else {
          localStorage.removeItem('guest_user');
        }
      } catch (e) {
        console.error('Failed to parse guest user', e);
        localStorage.removeItem('guest_user');
      }
    }
  }, [user, step]);

  const handleJoin = () => {
    if (!meetingId.trim()) { toast.error('Please enter a meeting ID'); return; }
    const guestId = `guest_${Date.now()}`;
    const guestUser = { id: guestId, name: name.trim(), role: 'guest' };
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    setGuestSession(guestUser);
    toast.success(`Joining meeting as ${name.trim()} (Guest Mode)`);
    navigate(`/app/meeting/room/${meetingId.trim()}`);
  };

  const handleExitGuest = () => {
    localStorage.removeItem('guest_user');
    setGuestSession(null);
    toast.info('Guest session ended');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="p-3 rounded-full bg-primary-500/10 inline-flex mb-3">
            <HiUserAdd className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Join as Guest</h2>
          <p className="text-sm text-gray-400 mt-1">No account needed to join a meeting</p>
        </div>

        {step === 'name' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-primary-500 placeholder-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              />
            </div>
            <Button fullWidth onClick={handleContinue} icon={HiVideoCamera}>Continue</Button>
            <p className="text-center">
              <button onClick={() => navigate('/auth/login')} className="text-xs text-primary-400 hover:underline">Sign in instead</button>
            </p>
          </motion.div>
        )}

        {step === 'meeting' && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-800 flex items-center gap-2">
              <HiClock className="w-4 h-4 text-primary-400" />
              <p className="text-xs text-gray-300">Joining as <strong>{name}</strong></p>
              <button onClick={() => setStep('name')} className="text-xs text-primary-400 hover:underline ml-auto">Change</button>
              {guestSession && (
                <button
                  onClick={handleExitGuest}
                  className="text-xs text-red-400 hover:underline"
                  title="Exit Guest Mode"
                >
                  (Exit Guest)
                </button>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Meeting ID or Link</label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                placeholder="Paste meeting ID or link"
                className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-primary-500 placeholder-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button fullWidth variant="primary" onClick={handleJoin} icon={HiLockOpen}>Join Meeting</Button>
              {guestSession && (
                <button
                  onClick={handleExitGuest}
                  className="ml-2 p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  title="Exit Guest Mode"
                >
                  <HiUserAdd className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">Guest sessions are temporary and expire when browser is closed</p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}