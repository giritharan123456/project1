import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiMicrophone, HiVideoCamera, HiX, HiStar, HiUsers, HiLockClosed, HiVolumeOff, HiVolumeUp } from 'react-icons/hi';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const mockParticipants = [
  { id: 'u2', name: 'Sarah Chen', muted: false, cameraOff: false, role: 'co-host', handRaised: false },
  { id: 'u4', name: 'Marcus Johnson', muted: false, cameraOff: false, role: 'participant', handRaised: true },
  { id: 'u6', name: 'Emily Nakamura', muted: true, cameraOff: false, role: 'participant', handRaised: false },
  { id: 'u7', name: 'David Park', muted: false, cameraOff: true, role: 'participant', handRaised: false },
  { id: 'u8', name: 'Rachel Torres', muted: true, cameraOff: true, role: 'participant', handRaised: false },
];

export default function HostControls({ onClose, roster: propsRoster, setRoster: propsSetRoster, waitingUsers: propsWaitingUsers, users, getUser }) {
  const { currentMeeting, getWaitingUsers, admitWaitingUser, denyWaitingUser } = useApp();
  const meetingId = currentMeeting?.id;
  const [participants, setParticipants] = useState(mockParticipants);
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [allMuted, setAllMuted] = useState(false);
  const [allCamOff, setAllCamOff] = useState(false);
  const containerRef = useRef(null);

  const activeRoster = propsRoster || participants;
  const updateRoster = propsSetRoster || setParticipants;
  const activeWaiting = propsWaitingUsers || (meetingId ? getWaitingUsers(meetingId) : []);
  const lookupUser = getUser || ((id) => users?.find(u => u.id === id) || { name: id });

  const transferHost = (id) => {
    updateRoster(prev => prev.map(p => p.id === id ? { ...p, role: 'host' } : p));
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const container = containerRef.current;
    if (!container) return;
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const toggleMute = (id) => {
    updateRoster(prev => prev.map(p => p.id === id ? { ...p, muted: !p.muted } : p));
  };

  const toggleCamera = (id) => {
    updateRoster(prev => prev.map(p => p.id === id ? { ...p, cameraOff: !p.cameraOff } : p));
  };

  const toggleRole = (id) => {
    updateRoster(prev => prev.map(p => p.id === id ? { ...p, role: p.role === 'co-host' ? 'participant' : 'co-host' } : p));
  };

  const removeUser = (id) => {
    updateRoster(prev => prev.filter(p => p.id !== id));
  };

  const admitUser = (id) => {
    const user = activeWaiting.find(u => u.id === id);
    if (user) {
      if (meetingId) admitWaitingUser(meetingId, id);
      if (propsSetRoster) updateRoster(prev => [...prev, { id: user.id, muted: user.muted || false, cameraOff: user.cameraOff || false, role: 'participant' }]);
      toast.success(`${user.name || lookupUser(user.id)?.name || 'User'} admitted`);
    }
  };

  const rejectUser = (id) => {
    const user = activeWaiting.find(u => u.id === id);
    if (meetingId) denyWaitingUser(meetingId, id);
    if (user) toast.success(`${user.name || lookupUser(user.id)?.name || 'User'} denied`);
  };

  const toggleLockMeeting = () => {
    setIsMeetingLocked(prev => !prev);
  };

  const toggleMuteAll = () => {
    setAllMuted(prev => {
      const next = !prev;
      updateRoster(r => r.map(p => ({ ...p, muted: next })));
      return next;
    });
  };

  const toggleDisableAllCameras = () => {
    setAllCamOff(prev => {
      const next = !prev;
      updateRoster(r => r.map(p => ({ ...p, cameraOff: next })));
      return next;
    });
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <HiShieldCheck className="w-5 h-5 text-primary-400" />
          <span className="text-sm font-medium text-white">Host Controls</span>
        </div>
        <Button size="xs" variant="ghost" icon={HiX} onClick={onClose} aria-label="Close host controls" />
      </div>

      <div className="p-3 space-y-2 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Meeting Controls</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={toggleLockMeeting}
              aria-label={isMeetingLocked ? 'Unlock meeting' : 'Lock meeting'}
              aria-pressed={isMeetingLocked}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isMeetingLocked
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700/50'
              }`}
            >
              {isMeetingLocked ? <HiLockClosed className="w-3.5 h-3.5" /> : <HiLockClosed className="w-3.5 h-3.5" />}
              {isMeetingLocked ? 'Locked' : 'Lock Meeting'}
            </button>
            <button
              onClick={toggleMuteAll}
              aria-label={allMuted ? 'Unmute all' : 'Mute all'}
              aria-pressed={allMuted}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                allMuted
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700/50'
              }`}
            >
              {allMuted ? <HiVolumeOff className="w-3.5 h-3.5" /> : <HiVolumeUp className="w-3.5 h-3.5" />}
              {allMuted ? 'Unmute All' : 'Mute All'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDisableAllCameras}
              aria-label={allCamOff ? 'Enable all cameras' : 'Disable all cameras'}
              aria-pressed={allCamOff}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                allCamOff
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700/50'
              }`}
            >
              <HiVideoCamera className="w-3.5 h-3.5" />
              {allCamOff ? 'Enable All Cameras' : 'Disable All Cameras'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeWaiting.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Waiting Room ({activeWaiting.length})</span>
            </div>
            {activeWaiting.map((p) => {
              const pName = p.name || lookupUser(p.id)?.name || 'Unknown';
              return (
                <motion.div key={p.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800 rounded-xl p-3 mb-2 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={pName} size="sm" />
                      <div>
                        <span className="text-sm font-medium text-white">{pName}</span>
                        {p.handRaised && <Badge variant="info" size="xs" className="ml-2">✋ Waiting</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="xs" variant="primary" onClick={() => admitUser(p.id)} aria-label={`Admit ${pName}`}>Admit</Button>
                      <Button size="xs" variant="danger" onClick={() => rejectUser(p.id)} aria-label={`Reject ${pName}`}>Reject</Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Participants ({activeRoster.length})</span>
          <Badge variant="primary" size="xs">{activeRoster.filter(p => p.handRaised).length} hands</Badge>
        </div>
        {activeRoster.map((p) => {
          const pName = p.name || lookupUser(p.id)?.name || 'Unknown';
          return (
            <motion.div key={p.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Avatar name={pName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{pName}</span>
                    {p.role === 'co-host' && <Badge variant="warning" size="xs"><HiStar className="w-2.5 h-2.5" /> Co-host</Badge>}
                    {p.handRaised && <Badge variant="info" size="xs">✋</Badge>}
                    {isMeetingLocked && <Badge variant="dark" size="xs">🔒</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs flex items-center gap-1 ${p.muted ? 'text-red-400' : 'text-emerald-400'}`}>
                      <HiMicrophone className="w-3 h-3" /> {p.muted ? 'Muted' : 'Unmuted'}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${p.cameraOff ? 'text-red-400' : 'text-emerald-400'}`}>
                      <HiVideoCamera className="w-3 h-3" /> {p.cameraOff ? 'Cam off' : 'Cam on'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-700/50">
                <button aria-label="Toggle mute" aria-pressed={p.muted} onClick={() => toggleMute(p.id)} className="flex-1 p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <HiMicrophone className="w-3.5 h-3.5 mx-auto" />
                </button>
                <button aria-label="Toggle camera" aria-pressed={p.cameraOff} onClick={() => toggleCamera(p.id)} className="flex-1 p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <HiVideoCamera className="w-3.5 h-3.5 mx-auto" />
                </button>
                <button aria-label={p.role === 'co-host' ? 'Remove co-host role' : 'Make co-host'} onClick={() => toggleRole(p.id)} className="flex-1 p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <HiStar className="w-3.5 h-3.5 mx-auto" />
                </button>
                <button aria-label="Remove participant" onClick={() => removeUser(p.id)} className="flex-1 p-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors">
                  <svg className="w-3.5 h-3.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </button>
                <button aria-label="Transfer host" onClick={() => transferHost(p.id)} className="flex-1 p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <HiUsers className="w-3.5 h-3.5 mx-auto" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {activeWaiting.length === 0 && activeRoster.length === 0 && (
          <div className="text-center py-8">
            <HiShieldCheck className="w-8 h-8 text-gray-600 dark:text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-slate-400">No participants</p>
          </div>
        )}
      </div>
    </div>
  );
}

