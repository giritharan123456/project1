import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiMicrophone, HiSpeakerphone, HiUsers,
  HiCheckCircle, HiExclamationCircle, HiCog, HiPhotograph,
  HiDesktopComputer, HiEyeOff, HiPlay, HiCalendar, HiClock,
  HiLockClosed, HiStatusOnline,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import MeetingCountdown from '../../components/dashboard/MeetingCountdown';
import VirtualBackground from '../../components/meeting/VirtualBackground';
import BrowserSupportBanner from '../../components/common/BrowserSupportBanner';
import toast from 'react-hot-toast';

const backgroundOptions = [
  { value: 'none', label: 'None', icon: HiEyeOff },
  { value: 'blur', label: 'Blur', icon: HiPhotograph },
  { value: 'office', label: 'Office', icon: HiDesktopComputer },
  { value: 'custom', label: 'Custom', icon: HiPhotograph },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MeetingLobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, users, joinMeeting, getCurrentUser, respondToInvitation } = useApp();
  const currentUser = getCurrentUser();

  const meeting = meetings.find((m) => m.id === id || m.meetingId === id);
  const host = meeting ? users.find((u) => u.id === meeting.host) : null;

  const [passwordPrompt, setPasswordPrompt] = useState(!!(meeting?.password));
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [camera, setCamera] = useState('default');
  const [microphone, setMicrophone] = useState('default');
  const [speaker, setSpeaker] = useState('default');
  const [background, setBackground] = useState('none');
  const [micTested, setMicTested] = useState(false);
  const [speakerTested, setSpeakerTested] = useState(false);
  const [networkOk, setNetworkOk] = useState(true);
  const [networkChecking, setNetworkChecking] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const [realDevices, setRealDevices] = useState({ video: [], audio: [] });
  const videoRef = useRef(null);

  const [deviceStatus, setDeviceStatus] = useState({
    camera: { state: 'checking', label: 'Checking camera...' },
    microphone: { state: 'untested', label: 'Not tested yet' },
    speaker: { state: 'untested', label: 'Not tested yet' },
    network: { state: 'checking', label: 'Checking connection...' },
  });

  const setStatus = (key, state, label) => {
    setDeviceStatus((prev) => ({ ...prev, [key]: { state, label } }));
  };

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(devices => {
      const video = devices.filter(d => d.kind === 'videoinput').map(d => ({ value: d.deviceId, label: d.label || d.deviceId.slice(0, 8) }));
      const audio = devices.filter(d => d.kind === 'audioinput').map(d => ({ value: d.deviceId, label: d.label || d.deviceId.slice(0, 8) }));
      setRealDevices({ video, audio });
      if (video.length > 0) setCamera(video[0].value);
      if (audio.length > 0) setMicrophone(audio[0].value);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('camera', 'ok', 'Camera working');
      } catch {
        setStatus('camera', 'error', 'Camera unavailable');
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    checkNetwork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deviceOptions = realDevices.video.length > 0 ? realDevices.video : [
    { value: 'default', label: 'Default Camera' },
  ];

  const micOptions = realDevices.audio.length > 0 ? realDevices.audio : [
    { value: 'default', label: 'Default Microphone' },
  ];

  const speakerOptions = [
    { value: 'default', label: 'Default Speaker' },
  ];

  const testMicrophone = async () => {
    setStatus('microphone', 'checking', 'Testing microphone...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      await new Promise((r) => setTimeout(r, 800));
      stream.getTracks().forEach((t) => t.stop());
      setMicTested(true);
      setStatus('microphone', 'ok', 'Microphone working');
      toast.success('Microphone test passed');
    } catch {
      setMicTested(false);
      setStatus('microphone', 'error', 'Microphone not available');
      toast.error('Microphone not available');
    }
  };

  const testSpeaker = async () => {
    setStatus('speaker', 'checking', 'Playing test tone...');
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      await new Promise((r) => setTimeout(r, 800));
      osc.stop();
      ctx.close();
      setSpeakerTested(true);
      setStatus('speaker', 'ok', 'Speaker working');
      toast.success('Speaker test passed');
    } catch {
      setSpeakerTested(false);
      setStatus('speaker', 'error', 'Speaker test failed');
      toast.error('Speaker test failed');
    }
  };

  const checkNetwork = async () => {
    setNetworkChecking(true);
    setStatus('network', 'checking', 'Checking connection...');
    try {
      if (!navigator.onLine) throw new Error('offline');
      await fetch('https://clients3.google.com/generate_204', { mode: 'no-cors' });
      setNetworkOk(true);
      setStatus('network', 'ok', 'Connection stable');
      toast.success('Network connection is stable');
    } catch {
      setNetworkOk(false);
      setStatus('network', 'error', 'Connection issue detected');
      toast.error('Network connection issue detected');
    } finally {
      setNetworkChecking(false);
    }
  };

  const handleJoin = () => {
    if (meeting) {
      acceptInvitation();
      joinMeeting(meeting.id);
      navigate(`/app/meeting/room/${meeting.id}`);
    }
  };

  const [invitationStatus, setInvitationStatus] = useState('pending');
  const [waitingAdmit, setWaitingAdmit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvitationStatus('pending');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const acceptInvitation = () => {
    respondToInvitation(meeting?.id, 'accepted');
    setInvitationStatus('accepted');
    setWaitingAdmit(true);
    setTimeout(() => setWaitingAdmit(false), 3000);
  };
  const declineInvitation = () => {
    respondToInvitation(meeting?.id, 'declined');
    setInvitationStatus('declined');
  };

  if (passwordPrompt) {
    return (
      <>
        <Helmet>
          <title>Meeting Password - AdzConnect</title>
          <meta name="description" content="Enter meeting password to join." />
        </Helmet>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <div className="p-4 mb-4 inline-flex rounded-full bg-amber-50 dark:bg-amber-900/20">
                <HiLockClosed className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Meeting Password Required</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                This meeting is password protected
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{meeting?.title || 'a meeting'}</p>
              <div className="mb-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (passwordInput === meeting?.password) {
                        setPasswordPrompt(false);
                      } else {
                        setPasswordError(true);
                        toast.error('Incorrect password');
                      }
                    }
                  }}
                  placeholder="Enter meeting password"
                  className={`w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm rounded-lg px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 ${passwordError ? 'border-red-500 ring-2 ring-red-500/30' : 'border-gray-300 dark:border-slate-600'}`}
                  aria-label="Meeting password"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1.5 text-left">Incorrect password, please try again</p>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => navigate('/app')}>Cancel</Button>
                <Button
                  icon={HiLockClosed}
                  onClick={() => {
                    if (passwordInput === meeting?.password) {
                      setPasswordPrompt(false);
                    } else {
                      setPasswordError(true);
                      toast.error('Incorrect password');
                    }
                  }}
                >
                  Join Meeting
                </Button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </>
    );
  }

  if (invitationStatus === 'pending') {
    return (
      <>
        <Helmet>
          <title>Meeting Invitation - AdzConnect</title>
          <meta name="description" content="Meeting invitation for AdzConnect video conference." />
        </Helmet>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <div className="p-4 mb-4 inline-flex rounded-full bg-primary-50 dark:bg-primary-900/20">
                <HiVideoCamera className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Meeting Invitation</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                <strong className="text-gray-700 dark:text-slate-300">{host?.name || 'Someone'}</strong> invites you to join
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{meeting?.title || 'a meeting'}</p>
              <div className="flex items-center justify-center gap-4 mb-6 text-sm text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><HiCalendar className="w-4 h-4" /> {meeting ? new Date(meeting.date + 'T12:00:00').toLocaleDateString() : 'Today'}</span>
                <span className="flex items-center gap-1"><HiClock className="w-4 h-4" /> {meeting?.time || 'Now'}</span>
                <span className="flex items-center gap-1"><HiUsers className="w-4 h-4" /> {meeting?.participants?.length || 0} participants</span>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={declineInvitation} aria-label="Decline meeting invitation">Decline</Button>
                <Button icon={HiPlay} onClick={acceptInvitation} aria-label="Accept meeting invitation">Accept & Join</Button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </>
    );
  }

  if (waitingAdmit) {
    return (
      <>
        <Helmet>
          <title>Waiting Room - AdzConnect</title>
        </Helmet>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="p-4 mb-4 inline-flex rounded-full bg-amber-50 dark:bg-amber-900/20">
              <HiClock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Waiting in Lobby</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
              The meeting host <strong className="text-gray-700 dark:text-slate-300">{host?.name || 'the host'}</strong> will let you in shortly.
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">You will be automatically admitted once the host approves</p>
          </Card>
        </motion.div>
      </>
    );
  }

  if (invitationStatus === 'declined') {
    return (
      <>
        <Helmet>
          <title>Invitation Declined - AdzConnect</title>
        </Helmet>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <div className="p-4 mb-4 inline-flex rounded-full bg-red-50 dark:bg-red-900/20">
              <HiExclamationCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invitation Declined</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">You have declined the meeting invitation.</p>
            <Button variant="primary" onClick={() => navigate('/app')}>Return to Dashboard</Button>
          </Card>
        </motion.div>
      </>
    );
  }

  return (
    <>
    <Helmet>
      <title>Meeting Lobby - AdzConnect</title>
      <meta name="description" content="Prepare for your AdzConnect meeting. Configure your camera, microphone, and background before joining." />
    </Helmet>
    <div className="w-full px-4 pt-4">
      <BrowserSupportBanner className="max-w-6xl mx-auto" />
    </div>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - Preview & Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Camera Preview */}
          <motion.div variants={itemVariants}>
            <Card padding={false} className="overflow-hidden">
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                {!cameraStream && (
                  <div className="text-center">
                    <Avatar
                      src={currentUser?.avatar}
                      name={currentUser?.name}
                      size="2xl"
                      className="ring-4 ring-white/20 mx-auto mb-3"
                    />
                    <p className="text-white font-medium text-lg">{currentUser?.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Camera unavailable
                      </span>
                    </div>
                  </div>
                )}
                {cameraStream && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Camera on
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Mic on
                    </span>
                  </div>
                )}
                {/* Background preview overlay */}
                {background !== 'none' && cameraStream && (
                  <div className="absolute inset-0 z-10">
                    <VirtualBackground stream={cameraStream} background={background} overlay />
                  </div>
                )}
                {background === 'blur' && !cameraStream && (
                  <div className="absolute inset-0 backdrop-blur-xl bg-black/10" />
                )}
              </div>
              <div className="p-4 bg-white dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300">
                      <HiVideoCamera className="w-4 h-4 text-primary-500" />
                      {camera === 'default' ? 'Camera On' : camera}
                    </span>
                  </div>
                  <Badge variant={networkOk ? 'success' : 'danger'} size="sm" dot={!networkOk}>
                    {networkOk ? 'Stable connection' : 'Unstable'}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Device Check Results */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Device Check</h3>
                </div>
                <Badge variant={
                  Object.values(deviceStatus).every((s) => s.state === 'ok') ? 'success'
                    : Object.values(deviceStatus).some((s) => s.state === 'error') ? 'danger'
                      : 'warning'
                } size="sm" dot>
                  {Object.values(deviceStatus).every((s) => s.state === 'ok')
                    ? 'All ready'
                    : Object.values(deviceStatus).some((s) => s.state === 'error')
                      ? 'Needs attention'
                      : 'Pending checks'}
                </Badge>
              </div>
              <div className="space-y-2.5">
                {[
                  { key: 'camera', label: 'Camera', icon: HiVideoCamera, color: 'text-primary-600 dark:text-primary-400' },
                  { key: 'microphone', label: 'Microphone', icon: HiMicrophone, color: 'text-emerald-600 dark:text-emerald-400' },
                  { key: 'speaker', label: 'Speaker', icon: HiSpeakerphone, color: 'text-violet-600 dark:text-violet-400' },
                  { key: 'network', label: 'Network', icon: HiStatusOnline, color: 'text-amber-600 dark:text-amber-400' },
                ].map((item) => {
                  const status = deviceStatus[item.key];
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-slate-400">{status.label}</span>
                        {status.state === 'checking' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {status.state === 'ok' && <HiCheckCircle className="w-4 h-4 text-emerald-500" />}
                        {status.state === 'error' && <HiExclamationCircle className="w-4 h-4 text-red-500" />}
                        {status.state === 'untested' && <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Device Selection */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <HiCog className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Device Settings</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <HiVideoCamera className="w-3.5 h-3.5" /> Camera
                  </label>
                  <Select options={deviceOptions} value={camera} onChange={(e) => setCamera(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <HiMicrophone className="w-3.5 h-3.5" /> Microphone
                  </label>
                  <Select options={micOptions} value={microphone} onChange={(e) => setMicrophone(e.target.value)} />
                  <Button
                    size="xs"
                    variant={micTested ? 'success' : 'outline'}
                    icon={micTested ? HiCheckCircle : HiMicrophone}
                    onClick={testMicrophone}
                    className="w-full"
                    aria-label={micTested ? 'Microphone tested' : 'Test microphone'}
                  >
                    {micTested ? 'Tested' : 'Test Mic'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <HiSpeakerphone className="w-3.5 h-3.5" /> Speaker
                  </label>
                  <Select options={speakerOptions} value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
                  <Button
                    size="xs"
                    variant={speakerTested ? 'success' : 'outline'}
                    icon={speakerTested ? HiCheckCircle : HiSpeakerphone}
                    onClick={testSpeaker}
                    className="w-full"
                    aria-label={speakerTested ? 'Speaker tested' : 'Test speaker'}
                  >
                    {speakerTested ? 'Tested' : 'Test Speaker'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Background Options */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <HiPhotograph className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Background</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {backgroundOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = background === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setBackground(opt.value)}
                      aria-label={`Set background to ${opt.label}`}
                      aria-pressed={selected}
                      className={`
                        flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                        ${selected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                        }
                      `}
                    >
                      <div className={`w-12 h-8 rounded-lg flex items-center justify-center ${selected ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                        <Icon className={`w-4 h-4 ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs font-medium ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-300'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right - Meeting Info & Join */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meeting Info */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <HiVideoCamera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {meeting?.title || 'Meeting'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {meeting?.meetingId || id}
                  </p>
                </div>
              </div>

              {host && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 mb-3">
                  <Avatar src={host.avatar} name={host.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Hosted by {host.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{host.title}</p>
                  </div>
                </div>
              )}

              {meeting && (
                <div className="space-y-2 text-sm text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <HiCalendar className="w-4 h-4" />
                    <span>{new Date(meeting.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiClock className="w-4 h-4" />
                    <span>
                      {(meeting.time && !isNaN(new Date(`2000-01-01T${meeting.time}`).getTime()))
                        ? new Date(`2000-01-01T${meeting.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                        : (meeting.time || 'Now')}
                      {meeting.duration > 0 ? ` · ${meeting.duration} min` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiUsers className="w-4 h-4" />
                    <span>{meeting.participants.length} participants</span>
                  </div>
                </div>
              )}

              {meeting?.description && (
                <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <p className="text-sm text-gray-600 dark:text-slate-300">{meeting.description}</p>
                </div>
              )}

              {meeting?.password && (
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <HiLockClosed className="w-4 h-4" />
                  <span>Password protected meeting</span>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Meeting Countdown */}
          {meeting && meeting.date && meeting.time && (
            <motion.div variants={itemVariants}>
              <MeetingCountdown targetDate={meeting.date} targetTime={meeting.time} label="Meeting starts in" />
            </motion.div>
          )}

          {/* Network Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {networkChecking ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Checking connection...</span>
                    </>
                  ) : (
                    <>
                      <div className={`w-2 h-2 rounded-full ${networkOk ? 'bg-emerald-500' : 'bg-red-500'} ${networkOk ? '' : 'animate-pulse'}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {networkOk ? 'Network Stable' : 'Network Issue Detected'}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={checkNetwork}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Check again
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Join Button */}
          <motion.div variants={itemVariants}>
            <Button
              size="xl"
              fullWidth
              icon={HiPlay}
              onClick={handleJoin}
              className="shadow-xl shadow-primary-500/30"
              aria-label="Join meeting now"
            >
              Join Meeting
            </Button>
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">
              By joining, you agree to the terms of service
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
    </>
  );
}
