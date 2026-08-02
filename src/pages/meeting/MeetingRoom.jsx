import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiMicrophone, HiVideoCamera,
  HiDesktopComputer, HiChat, HiUsers, HiHand, HiDotsVertical,
  HiPhone, HiClock, HiEmojiHappy, HiPaperAirplane,
  HiTemplate, HiCollection, HiStatusOnline,
  HiAdjustments, HiViewGrid, HiArrowsExpand, HiViewList,
  HiPencilAlt, HiSupport, HiX, HiDocumentText, HiFolder, HiSearch, HiStar,
  HiShieldCheck, HiSparkles, HiQuestionMarkCircle,
} from 'react-icons/hi';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Toggle from '../../components/ui/Toggle';
import { useApp } from '../../context/AppContext';
import Whiteboard from '../../components/meeting/Whiteboard';
import Polls from '../../components/meeting/Polls';
import BreakoutRooms from '../../components/meeting/BreakoutRooms';
import Captions from '../../components/meeting/Captions';
import HostControls from '../../components/meeting/HostControls';
import ReactionButton from '../../components/meeting/ReactionButton';
import { Helmet } from 'react-helmet-async';
import FileSharing from '../../components/meeting/FileSharing';
import MeetingNotes from '../../components/meeting/MeetingNotes';
import QAPanel from '../../components/meeting/QAPanel';
import CommandPalette from '../../components/meeting/CommandPalette';
import VoiceCommandsUI from '../../components/meeting/VoiceCommandsUI';
import AIMeetingSummary from '../../components/meeting/AIMeetingSummary';
import toast from 'react-hot-toast';

const EMOJIS = ['👍', '👏', '❤️', '😂', '🎉', '🔥', '💯', '🚀', '👀', '🤔', '😱', '💪', '🙌', '🎊', '✨'];

const mockMessages = [
  { id: 1, userId: 'u2', text: 'Welcome everyone! Let\'s get started.', time: '10:00 AM' },
  { id: 2, userId: 'u6', text: 'I can see the slides clearly.', time: '10:02 AM' },
  { id: 3, userId: 'u2', text: 'Feel free to jump in with questions.', time: '10:05 AM' },
];

const initialParticipants = [
  { id: 'u2', muted: false, cameraOff: false, role: 'host' },
  { id: 'u7', muted: false, cameraOff: false, role: 'participant' },
  { id: 'u6', muted: true, cameraOff: false, role: 'participant' },
  { id: 'u8', muted: false, cameraOff: true, role: 'participant' },
];

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function MeetingRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { meetings, currentMeeting, leaveMeeting, endMeeting, users, getCurrentUser, broadcastMessage, setRecordings, getWaitingUsers, admitWaitingUser, denyWaitingUser } = useApp();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;
  const meeting = currentMeeting || meetings.find((m) => m.status === 'live') || meetings.find((m) => m.id === id || m.meetingId === id);
  const isHost = currentUserId === meeting?.host;
  const chatStorageKey = `connectly-meeting-chat-${meeting?.id || id || 'default'}`;

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEndCallDialog, setShowEndCallDialog] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [recording, setRecording] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [speakerView, setSpeakerView] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(chatStorageKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return mockMessages;
  });
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [_showSettings, _setShowSettings] = useState(false);
  const [meetingPrefs, setMeetingPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-meeting-room-prefs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      mirrorVideo: false,
      videoQuality: 'auto',
    };
  });
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [pip, setPip] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [pinnedParticipant, setPinnedParticipant] = useState(null);
  const speakerId = meeting?.host;
  const rosterSeed = useMemo(() => {
    const ids = meeting?.participants;
    if (Array.isArray(ids) && ids.length > 0) {
      return ids.map((pid) => ({
        id: pid,
        muted: false,
        cameraOff: false,
        role: pid === meeting?.host ? 'host' : 'participant',
      }));
    }
    return initialParticipants;
  }, [meeting]);
  const [roster, setRoster] = useState(rosterSeed);
  const waitingUsers = useMemo(() => {
    if (!meeting || meeting.status !== 'live') return [];
    return getWaitingUsers(meeting.id).map(u => ({
      id: u.id,
      name: u.name,
      muted: false,
      cameraOff: false,
      handRaised: false,
    }));
  }, [meeting, getWaitingUsers]);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('connectly-meeting-room-prefs', JSON.stringify(meetingPrefs));
    } catch {}
  }, [meetingPrefs]);

  const chatEndRef = useRef(null);
  const containerRef = useRef(null);

  const getUser = (id) => users.find((u) => u.id === id);
  const rosterWithNames = roster.map((p) => ({ ...p, name: getUser(p.id)?.name || 'Participant', avatar: getUser(p.id)?.avatar || '' }));
  const toggleCoHost = (id) => {
    setRoster(prev => prev.map(p => p.id === id ? { ...p, role: p.role === 'co-host' ? 'participant' : 'co-host' } : p));
    const name = getUser(id)?.name || 'User';
    toast.success(roster.find(p => p.id === id)?.role === 'co-host' ? `${name} is no longer co-host` : `${name} is now a co-host`);
  };
  const togglePin = (id) => {
    setPinnedParticipant(prev => prev === id ? null : id);
  };

  useEffect(() => {
    const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const connectTimer = setTimeout(() => setConnectionStatus('connected'), 2000);
    const poorConnectionTimer = setInterval(() => {
      setConnectionStatus('poorConnection');
      setTimeout(() => setConnectionStatus('connected'), 5000);
    }, 30000);
    return () => {
      clearTimeout(connectTimer);
      clearInterval(poorConnectionTimer);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages, chatStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem('connectly-meeting-room-prefs', JSON.stringify(meetingPrefs));
    } catch {}
  }, [meetingPrefs]);

  const handleReaction = useCallback((emoji) => {
    const id = Date.now();
    setFloatingReactions((prev) => [...prev, { id, emoji, x: Math.random() * 60 + 20 }]);
    setTimeout(() => setFloatingReactions((prev) => prev.filter((r) => r.id !== id)), 3000);
  }, []);

  const handlePickEmoji = (emoji) => {
    setChatInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setScreenSharing(true);
        const track = stream.getVideoTracks()[0];
        if (track) {
          track.addEventListener('ended', () => {
            setScreenStream(null);
            setScreenSharing(false);
          });
        }
      } catch (err) {
        if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
          toast.error('Failed to share screen');
        }
      }
    }
  }, [screenStream]);

  const toggleRecording = useCallback(async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    } else {
      try {
        let platform = {};
        try {
          platform = JSON.parse(localStorage.getItem('connectly-platform-settings')) || {};
        } catch {}
        const audioDeviceId = platform.audioInput && platform.audioInput !== 'default' ? platform.audioInput : undefined;
        const videoDeviceId = platform.videoInput && platform.videoInput !== 'default' ? platform.videoInput : undefined;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
            echoCancellation: meetingPrefs.echoCancellation !== false,
            noiseSuppression: meetingPrefs.noiseSuppression !== false,
            autoGainControl: meetingPrefs.autoGainControl !== false,
          },
          video: {
            deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
          },
        });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recording-${Date.now()}.webm`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 600000);
          const recordingEntry = {
            id: Date.now(),
            title: meeting?.title ? `${meeting.title} - Recording` : `Recording ${new Date().toLocaleDateString()}`,
            duration: `${formatTime(elapsed) || '0:00'}`,
            host: currentUser?.name || 'Host',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            views: 0,
            size: `${sizeInMB} MB`,
            description: `Live recording of "${meeting?.title || 'meeting'}"`,
            starred: false,
            url,
            meetingId: meeting?.id || null,
          };
          setRecordings(prev => [...prev, recordingEntry]);
          toast.success(`Recording saved! (${sizeInMB}MB)`);
          stream.getTracks().forEach(track => track.stop());
          setRecordedChunks([]);
        };
        recorder.start();
        setRecording(true);
        setRecordedChunks([]);
      } catch (err) {
        if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
          toast.error('Failed to start recording');
        }
      }
    }
  }, [recording, meeting, meetingPrefs, currentUser, elapsed, setRecordings, setRecordedChunks]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        return;
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'm') {
        e.preventDefault();
        setMuted(prev => {
          toast.success(prev ? 'Microphone on' : 'Microphone muted');
          return !prev;
        });
      }
      if (key === 'c') {
        e.preventDefault();
        setChatOpen(prev => {
          toast.success(prev ? 'Chat closed' : 'Chat opened');
          return !prev;
        });
      }
      if (key === 'k') {
        e.preventDefault();
        toggleRecording();
      }
      if (key === 'v') {
        e.preventDefault();
        setCameraOff(prev => {
          toast.success(prev ? 'Camera on' : 'Camera off');
          return !prev;
        });
      }
      if (key === 'e') {
        e.preventDefault();
        const emojis = ['🎉', '👍', '👏', '😂', '❤️', '🎊'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        handleReaction(emoji);
      }
      if (key === 'r') {
        e.preventDefault();
        setHandRaised(prev => {
          toast.success(prev ? 'Hand lowered' : 'Hand raised');
          return !prev;
        });
      }
      if (key === 's') {
        e.preventDefault();
        toggleScreenShare();
      }
      if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReaction, toggleScreenShare, toggleFullscreen, toggleRecording]);

  useEffect(() => {
    return () => {
      screenStream?.getTracks().forEach(track => track.stop());
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [screenStream, recording]);

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        let platform = {};
        try {
          platform = JSON.parse(localStorage.getItem('connectly-platform-settings')) || {};
        } catch {}
        const audioDeviceId = platform.audioInput && platform.audioInput !== 'default' ? platform.audioInput : undefined;
        const videoDeviceId = platform.videoInput && platform.videoInput !== 'default' ? platform.videoInput : undefined;
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
            echoCancellation: meetingPrefs.echoCancellation !== false,
            noiseSuppression: meetingPrefs.noiseSuppression !== false,
            autoGainControl: meetingPrefs.autoGainControl !== false,
          },
          video: {
            deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch {
        console.log('Local camera not available');
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [meetingPrefs.echoCancellation, meetingPrefs.noiseSuppression, meetingPrefs.autoGainControl]);

  useEffect(() => {
    if (muted) localStream?.getAudioTracks().forEach((t) => { t.enabled = false; });
    else localStream?.getAudioTracks().forEach((t) => { t.enabled = true; });
  }, [muted, localStream]);

  useEffect(() => {
    if (cameraOff) localStream?.getVideoTracks().forEach((t) => { t.enabled = false; });
    else localStream?.getVideoTracks().forEach((t) => { t.enabled = true; });
  }, [cameraOff, localStream]);

  useEffect(() => {
    if (!currentUserId) return;
    setRoster((prev) => {
      const exists = prev.some((p) => p.id === currentUserId);
      const updated = prev.map((p) => (p.id === currentUserId ? { ...p, muted, cameraOff } : p));
      if (exists) return updated;
      return [...updated, { id: currentUserId, muted, cameraOff, role: currentUserId === meeting?.host ? 'host' : 'participant' }];
    });
  }, [muted, cameraOff, currentUserId, meeting?.host]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      userId: currentUserId,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    broadcastMessage({ from: currentUserId, to: meeting?.id || 'meeting', text: chatInput.trim(), type: 'channel' });
    setChatInput('');
    setShowEmojiPicker(false);
  };

  const handleEndCall = (forAll = false) => {
    if (forAll && meeting?.id) {
      endMeeting(meeting.id);
    } else {
      leaveMeeting();
    }
    setShowEndCallDialog(false);
    navigate(forAll ? '/app' : '/app/meetings');
  };

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
    setChatOpen(false);
    setParticipantsOpen(false);
    setShowMoreMenu(false);
  };

  const handlePaletteAction = useCallback((actionId) => {
    switch (actionId) {
      case 'mute':
        setMuted(prev => {
          toast.success(prev ? 'Microphone on' : 'Microphone muted');
          return !prev;
        });
        break;
      case 'screen-share':
        toggleScreenShare();
        break;
      case 'raise-hand':
        setHandRaised(prev => {
          toast.success(prev ? 'Hand lowered' : 'Hand raised');
          return !prev;
        });
        break;
      case 'captions':
        setActivePanel(prev => (prev === 'captions' ? null : 'captions'));
        break;
      default:
        break;
    }
  }, [toggleScreenShare]);

  const participantUsers = useMemo(() => {
    const me = roster.find((p) => p.id === currentUserId);
    const others = roster.filter((p) => p.id !== currentUserId);
    const ordered = me ? [me, ...others] : roster;
    return ordered.slice(0, speakerView ? 6 : 4);
  }, [roster, currentUserId, speakerView]);

  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 bg-gray-950'
    : 'h-screen bg-gray-950 flex flex-col';

  const panelContent = () => {
    switch (activePanel) {
      case 'whiteboard': return <Whiteboard onClose={() => setActivePanel(null)} />;
      case 'polls': return <Polls onClose={() => setActivePanel(null)} />;
      case 'breakout': return <BreakoutRooms onClose={() => setActivePanel(null)} roster={rosterWithNames} currentUserId={currentUser?.id} />;
      case 'captions': return <Captions onClose={() => setActivePanel(null)} />;
      case 'host': return (
        <HostControls
          onClose={() => setActivePanel(null)}
          roster={roster}
          setRoster={setRoster}
          waitingUsers={waitingUsers}
          users={users}
          getUser={getUser}
        />
      );
      case 'files': return <FileSharing onClose={() => setActivePanel(null)} />;
      case 'notes': return <MeetingNotes onClose={() => setActivePanel(null)} />;
      case 'qa': return <QAPanel onClose={() => setActivePanel(null)} isHost={currentUserId === meeting?.host} />;
      case 'voice': return <VoiceCommandsUI onClose={() => setActivePanel(null)} />;
      case 'summary': return <AIMeetingSummary onClose={() => setActivePanel(null)} />;
      case 'settings': return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold">Meeting Settings</h3>
            <button onClick={() => setActivePanel(null)} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><HiX className="w-5 h-5" /></button>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Audio</h4>
              <div className="space-y-3">
                <Toggle
                  enabled={meetingPrefs.echoCancellation}
                  onChange={(v) => setMeetingPrefs((p) => ({ ...p, echoCancellation: v }))}
                  label="Echo Cancellation"
                />
                <Toggle
                  enabled={meetingPrefs.noiseSuppression}
                  onChange={(v) => setMeetingPrefs((p) => ({ ...p, noiseSuppression: v }))}
                  label="Noise Suppression"
                />
                <Toggle
                  enabled={meetingPrefs.autoGainControl}
                  onChange={(v) => setMeetingPrefs((p) => ({ ...p, autoGainControl: v }))}
                  label="Auto Gain Control"
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Video</h4>
              <div className="space-y-3">
                <Toggle
                  enabled={meetingPrefs.mirrorVideo}
                  onChange={(v) => setMeetingPrefs((p) => ({ ...p, mirrorVideo: v }))}
                  label="Mirror My Video"
                />
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Video Quality</label>
                  <select
                    value={meetingPrefs.videoQuality}
                    onChange={(e) => setMeetingPrefs((p) => ({ ...p, videoQuality: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option value="auto">Auto</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="480p">480p (Low bandwidth)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <>
    <Helmet>
      <title>Meeting Room - AdzConnect</title>
      <meta name="description" content="Join your AdzConnect video meeting room with HD video, screen sharing, chat, and collaboration tools." />
    </Helmet>
    <div ref={containerRef} className={containerClass}>
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} inMeeting onMeetingAction={handlePaletteAction} />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              connectionStatus === 'connecting' ? 'bg-amber-500' :
              connectionStatus === 'connected' ? 'bg-emerald-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' :
              'bg-yellow-500'
            }`} />
            <span className={`text-xs font-medium ${
              connectionStatus === 'connecting' ? 'text-amber-400' :
              connectionStatus === 'connected' ? 'text-emerald-400' :
              connectionStatus === 'disconnected' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'disconnected' ? 'Disconnected' :
               'Unstable connection'}
            </span>
          </div>
          <span className="text-gray-600">|</span>
          <HiClock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-300 font-mono">{formatTime(elapsed)}</span>
        </div>
        <div className="flex items-center gap-3">
          {recording && (
            <Badge variant="danger" size="sm" dot>
              Recording
            </Badge>
          )}
          <Badge variant="primary" size="sm">
            <HiUsers className="w-3 h-3" />
            {roster.length}
          </Badge>
          <span className="text-sm text-gray-300 font-medium truncate max-w-[150px]">
            {meeting?.title || 'Meeting'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Command Palette (Ctrl+K)"
            aria-label="Open command palette"
          >
            <HiSearch className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPip(!pip)}
            className={`p-1.5 rounded-lg transition-colors ${pip ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            title="Picture in Picture"
            aria-label={pip ? 'Exit picture in picture' : 'Enter picture in picture'}
            aria-pressed={pip}
          >
            <HiStatusOnline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${chatOpen || participantsOpen || activePanel ? 'mr-80' : ''}`}>
          {/* Floating Reactions */}
          <div className="relative flex-1">
            <AnimatePresence>
              {floatingReactions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -200, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute bottom-20 text-4xl pointer-events-none z-40 drop-shadow-lg"
                  style={{ left: `${r.x}%` }}
                >
                  {r.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {screenSharing && (
              <div className="absolute inset-0 bg-gray-900 z-20 m-2 rounded-2xl border border-primary-500/30 overflow-hidden">
                <video ref={screenVideoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                {!screenStream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <HiDesktopComputer className="w-16 h-16 text-primary-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-1">You are sharing your screen</h3>
                      <p className="text-sm text-gray-400">Click "Stop Sharing" in toolbar to stop</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 right-4">
                  <Button size="sm" variant="danger" onClick={toggleScreenShare}>Stop Sharing</Button>
                </div>
              </div>
            )}

            {speakerView ? (
              <div className="h-full flex flex-col gap-2 p-2">
                <div className="flex-1 bg-gray-800/50 rounded-2xl flex items-center justify-center border border-gray-700/50 overflow-hidden">
                  {localStream ? (
                    <video autoPlay muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Avatar src={getUser(speakerId)?.avatar} name={getUser(speakerId)?.name} size="2xl" className="ring-4 ring-primary-500/50 mx-auto mb-3" />
                      <p className="text-white font-medium">{getUser(speakerId)?.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Speaking</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 h-24 overflow-x-auto">
                  {participantUsers.filter((p) => p.id !== speakerId).map((p) => {
                    const u = getUser(p.id);
                    return (
                      <div key={p.id} className="flex-shrink-0 w-32 bg-gray-800/50 rounded-xl flex items-center justify-center border border-gray-700/50 relative overflow-hidden">
                        {localStream ? (
                          <video autoPlay muted={p.id === currentUserId} playsInline className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Avatar src={u?.avatar} name={u?.name} size="sm" className="mx-auto mb-1" />
                            <p className="text-xs text-gray-300 truncate px-1">{u?.name}</p>
                          </div>
                        )}
                        {p.muted && (
                          <HiMicrophone className="absolute top-1 right-1 w-3 h-3 text-red-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 h-full">
                {participantUsers.map((p) => {
                  const u = getUser(p.id);
                  const isCurrentUser = p.id === currentUserId;
                  const isPinned = pinnedParticipant === p.id;
                  return (
                    <div key={p.id} className={`rounded-2xl flex items-center justify-center border relative group overflow-hidden ${isPinned ? 'bg-gray-800 border-primary-500 ring-2 ring-primary-500/50' : 'bg-gray-800/50 border-gray-700/50'}`}>
                      {localStream && !(isCurrentUser && cameraOff) ? (
                        <video
                          autoPlay
                          muted={isCurrentUser}
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                          ref={(el) => {
                            if (el && localStream && !el.srcObject) {
                              if (isCurrentUser) {
                                el.srcObject = localStream;
                              } else {
                                try {
                                  const clonedStream = localStream.clone();
                                  el.srcObject = clonedStream;
                                } catch { el.srcObject = localStream; }
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="text-center z-10">
                          <Avatar
                            src={isCurrentUser && cameraOff ? null : u?.avatar}
                            name={u?.name}
                            size="xl"
                            className="ring-4 ring-gray-700/50 mx-auto mb-2"
                          />
                          <p className="text-sm text-gray-300 font-medium">{u?.name}</p>
                        </div>
                      )}
                      {p.id === 'u2' && (
                        <Badge variant="success" size="xs" dot className="absolute top-2 left-2 z-10">Speaking</Badge>
                      )}
                      {isPinned && (
                        <Badge variant="warning" size="xs" className="absolute top-2 left-2 z-10">Pinned</Badge>
                      )}
                      {isCurrentUser && cameraOff && (
                        <Badge variant="warning" size="xs" className="absolute top-2 left-2 z-10">Camera Off</Badge>
                      )}
                      <button
                        onClick={() => togglePin(p.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isPinned ? 'bg-primary-600 text-white' : 'bg-gray-900/80 text-gray-300 hover:text-white'}`}
                        title={isPinned ? 'Unpin' : 'Pin'}
                        aria-label={isPinned ? 'Unpin participant' : 'Pin participant'}
                      >
                        <HiDotsVertical className="w-3.5 h-3.5 rotate-45" />
                      </button>
                      {isCurrentUser && handRaised && (
                        <div className="absolute top-12 right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
                          <HiHand className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {p.muted && (
                        <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                          <HiMicrophone className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Panel (right side) */}
        <AnimatePresence>
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 bg-gray-900 border-l border-gray-800 flex flex-col z-30 sm:w-80 w-full"
            >
              {panelContent()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 bg-gray-900 border-l border-gray-800 flex flex-col z-30 sm:w-80 w-full"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <HiChat className="w-4 h-4 text-primary-400" />
                  Chat
                </h3>
                <button onClick={() => setChatOpen(false)} className="p-1 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Close chat panel">
                  <HiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => {
                  const u = getUser(msg.userId);
                  const isOwn = msg.userId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <Avatar src={u?.avatar} name={u?.name} size="xs" className="mt-1" />
                      <div className={`max-w-[80%] ${isOwn ? 'items-end' : ''}`}>
                        <div className={`p-2.5 rounded-xl text-sm ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 px-1">
                          {u?.name} · {msg.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white" aria-label="Open emoji picker" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <HiEmojiHappy className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-lg border border-gray-700 shadow-xl flex gap-1">
                      {EMOJIS.map((e) => (
                        <button key={e} onClick={() => handlePickEmoji(e)} className="p-1 text-xl hover:bg-gray-700 rounded" aria-label={e}>{e}</button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-primary-500 placeholder-gray-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <HiPaperAirplane className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting Room Panel */}
        <AnimatePresence>
          {showWaitingRoom && isHost && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 bg-gray-900 border-l border-gray-800 flex flex-col z-30 sm:w-80 w-full"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <HiClock className="w-4 h-4 text-amber-400" />
                  Waiting Room ({waitingUsers.length})
                </h3>
                <button onClick={() => setShowWaitingRoom(false)} className="p-1 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Close waiting room panel">
                  <HiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {waitingUsers.map((wu) => {
                  const wuName = wu.name || getUser(wu.id)?.name || 'Unknown';
                  return (
                    <div key={wu.id} className="bg-gray-800 rounded-xl p-3 border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <Avatar name={wuName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{wuName}</p>
                          {wu.handRaised && <Badge variant="info" size="xs">✋ Waiting</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => {
                            setRoster(prev => [...prev, { id: wu.id, muted: wu.muted || false, cameraOff: wu.cameraOff || false, role: 'participant' }]);
                            admitWaitingUser(meeting.id, wu.id);
                            toast.success(`${wuName} admitted`);
                          }}
                        >
                          Admit
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => {
                            denyWaitingUser(meeting.id, wu.id);
                            toast.success(`${wuName} denied`);
                          }}
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {waitingUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">No users waiting to join</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participants Panel */}
        <AnimatePresence>
          {participantsOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 bg-gray-900 border-l border-gray-800 flex flex-col z-30 sm:w-80 w-full"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <HiUsers className="w-4 h-4 text-primary-400" />
                  Participants ({roster.length})
                </h3>
                <button onClick={() => setParticipantsOpen(false)} className="p-1 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Close participants panel">
                  <HiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {roster.map((p) => {
                  const u = getUser(p.id);
                  const isCurrentUser = p.id === currentUserId;
                  const isPinned = pinnedParticipant === p.id;
                  return (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors ${isPinned ? 'bg-primary-900/10 border border-primary-500/30' : ''}`}>
                      <Avatar
                        src={u?.avatar}
                        name={u?.name}
                        size="sm"
                        status={p.muted ? 'busy' : 'online'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {u?.name}
                          {isCurrentUser && <span className="text-xs text-gray-400 ml-1">(You)</span>}
                          {isPinned && <span className="text-xs text-primary-400 ml-1">· Pinned</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u?.title}</p>
                      </div>
                      {isHost ? (
                        <button
                          onClick={() => toggleCoHost(p.id)}
                          className={`p-1 rounded-lg transition-colors ${p.role === 'co-host' ? 'text-amber-400 bg-amber-900/30' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                          title={p.role === 'co-host' ? 'Remove co-host' : 'Make co-host'}
                          aria-label={p.role === 'co-host' ? `Remove co-host from ${u?.name || 'participant'}` : `Make ${u?.name || 'participant'} co-host`}
                        >
                          <HiStar className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        p.role === 'co-host' && <Badge variant="warning" size="xs">Co-host</Badge>
                      )}
                      <button
                        onClick={() => togglePin(p.id)}
                        className={`p-1 rounded-lg transition-colors ${isPinned ? 'text-primary-400 bg-primary-900/30' : 'text-gray-500 hover:text-white hover:bg-gray-700'}`}
                        title={isPinned ? 'Unpin' : 'Pin'}
                        aria-label={isPinned ? `Unpin ${u?.name || 'participant'}` : `Pin ${u?.name || 'participant'}`}
                      >
                        <HiDotsVertical className="w-3.5 h-3.5 rotate-45" />
                      </button>
                      {p.role === 'co-host' && <Badge variant="warning" size="xs">Co-host</Badge>}
                      {p.muted ? (
                        <HiMicrophone className="w-4 h-4 text-red-400" />
                      ) : (
                        <HiMicrophone className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-800">
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  icon={HiUsers}
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Invite link copied to clipboard'); }}
                >
                  Invite Participants
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Toolbar */}
      <div role="toolbar" aria-orientation="horizontal" aria-label="Meeting controls" className="relative z-40 flex flex-wrap items-center justify-start sm:justify-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800">
        {/* Microphone */}
        <button
          onClick={() => setMuted((prev) => {
            toast.success(prev ? 'Microphone on' : 'Microphone muted');
            return !prev;
          })}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            muted
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={muted ? 'Unmute (M)' : 'Mute (M)'}
          aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={muted}
        >
          <HiMicrophone className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Camera */}
        <button
          onClick={() => setCameraOff((prev) => {
            toast.success(prev ? 'Camera on' : 'Camera off');
            return !prev;
          })}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            cameraOff
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={cameraOff ? 'Turn Camera On (V)' : 'Turn Camera Off (V)'}
          aria-label={cameraOff ? 'Turn camera on' : 'Turn camera off'}
          aria-pressed={cameraOff}
        >
          <HiVideoCamera className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            screenSharing
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={screenSharing ? 'Stop Sharing (S)' : 'Share Screen (S)'}
          aria-label={screenSharing ? 'Stop sharing screen' : 'Share screen'}
          aria-pressed={screenSharing}
        >
          <HiDesktopComputer className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Chat */}
        <button
          onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false); setActivePanel(null); }}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            chatOpen
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title="Chat"
          aria-label={chatOpen ? 'Close chat' : 'Open chat'}
          aria-pressed={chatOpen}
        >
          <HiChat className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Participants */}
        <button
          onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false); setActivePanel(null); setShowWaitingRoom(false); }}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            participantsOpen
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title="Participants"
          aria-label={participantsOpen ? 'Close participants panel' : 'Open participants panel'}
        >
          <HiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Waiting Room */}
        {isHost && waitingUsers.length > 0 && (
          <button
            onClick={() => { setShowWaitingRoom(!showWaitingRoom); setParticipantsOpen(false); setChatOpen(false); setActivePanel(null); }}
            className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 relative ${
              showWaitingRoom
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
            title="Waiting Room"
            aria-label={showWaitingRoom ? 'Close waiting room' : 'Open waiting room'}
          >
            <HiClock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">{waitingUsers.length}</span>
          </button>
        )}

        {/* Raise Hand */}
        <button
          onClick={() => setHandRaised((prev) => {
            toast.success(prev ? 'Hand lowered' : 'Hand raised');
            return !prev;
          })}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            handRaised
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={handRaised ? 'Lower Hand (R)' : 'Raise Hand (R)'}
          aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
          aria-pressed={handRaised}
        >
          <HiHand className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <ReactionButton onReact={handleReaction} />

        {/* Whiteboard */}
        <button
          onClick={() => togglePanel('whiteboard')}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            activePanel === 'whiteboard'
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title="Whiteboard"
          aria-label={activePanel === 'whiteboard' ? 'Close whiteboard' : 'Open whiteboard'}
          aria-pressed={activePanel === 'whiteboard'}
        >
          <HiPencilAlt className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Record */}
        <button
          onClick={toggleRecording}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            recording
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={recording ? 'Stop Recording' : 'Record'}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
          aria-pressed={recording}
        >
          <HiCollection className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Speaker / Layout Toggle */}
        <button
          onClick={() => setSpeakerView(!speakerView)}
          className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
            speakerView
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          title={speakerView ? 'Grid View' : 'Speaker View'}
          aria-label={speakerView ? 'Switch to grid view' : 'Switch to speaker view'}
        >
          <HiViewGrid className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* More Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 sm:p-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            title="More Options"
            aria-label="More options"
            aria-expanded={showMoreMenu}
          >
            <HiDotsVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute bottom-full right-0 mb-2 w-52 sm:w-56 bg-gray-800 rounded-xl border border-gray-700 shadow-xl py-1 z-40"
              >
                {[
                  { label: 'Voice Commands', icon: HiMicrophone, panel: 'voice' },
                  ...(isHost ? [{ label: 'Host Controls', icon: HiShieldCheck, panel: 'host' }] : []),
                  { label: 'Polls', icon: HiTemplate, panel: 'polls' },
                  { label: 'Breakout Rooms', icon: HiSupport, panel: 'breakout' },
                  { label: 'Captions', icon: HiViewList, panel: 'captions' },
                  { label: 'Whiteboard', icon: HiPencilAlt, panel: 'whiteboard' },
                  { label: 'File Sharing', icon: HiFolder, panel: 'files' },
                  { label: 'Meeting Notes', icon: HiDocumentText, panel: 'notes' },
                  { label: 'Q&A', icon: HiQuestionMarkCircle, panel: 'qa' },
                  { label: 'AI Summary', icon: HiSparkles, panel: 'summary' },
                  { label: 'Settings', icon: HiAdjustments, panel: 'settings' },
                  { label: 'Fullscreen', icon: HiArrowsExpand, onClick: toggleFullscreen },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.panel) togglePanel(item.panel);
                      item.onClick?.();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End Call */}
        <button
          onClick={() => setShowEndCallDialog(true)}
          className="p-2 sm:p-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/30 flex-shrink-0"
          title="End Call"
          aria-label="End call"
        >
          <HiPhone className="w-4 h-4 sm:w-5 sm:h-5 rotate-135" />
        </button>
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {muted ? 'Microphone muted' : 'Microphone unmuted'}. {cameraOff ? 'Camera off' : 'Camera on'}. {handRaised ? 'Hand raised' : ''}. {recording ? 'Recording' : ''}. {screenSharing ? 'Screen sharing' : ''}
      </div>

      {/* End Call Dialog */}
      <Modal
        isOpen={showEndCallDialog}
        onClose={() => setShowEndCallDialog(false)}
        title="End Call?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEndCallDialog(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleEndCall(false)}>Leave Meeting</Button>
            {isHost && <Button variant="danger" icon={HiPhone} onClick={() => handleEndCall(true)}>End for All</Button>}
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-slate-300">
          {currentUserId === meeting?.host
            ? 'Ending for all will finish this meeting, record attendance, and generate reports for HR, Manager, Executive, and CEO.'
            : 'Are you sure you want to leave this meeting?'}
        </p>
      </Modal>

      {/* Keyboard Shortcuts Help */}
      <Modal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        title="Keyboard Shortcuts"
        size="sm"
      >
        <div className="space-y-3">
          {[
            ['M', 'Toggle microphone'],
            ['V', 'Toggle camera'],
            ['S', 'Screen share'],
            ['R', 'Raise / lower hand'],
            ['E', 'Send emoji reaction'],
            ['C', 'Toggle chat'],
            ['K', 'Start / stop recording'],
            ['F', 'Toggle fullscreen'],
            ['?', 'Toggle this help'],
            ['Ctrl+K', 'Command palette'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-300">{desc}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">{key}</kbd>
            </div>
          ))}
        </div>
      </Modal>
    </div>
    </>
  );
}
