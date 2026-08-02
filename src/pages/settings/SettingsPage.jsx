import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser, HiLockClosed, HiColorSwatch, HiMicrophone, HiVideoCamera,
  HiBell, HiCog, HiViewGrid, HiHeart, HiQuestionMarkCircle,
  HiInformationCircle, HiSave, HiTrash, HiCamera, HiUpload,
  HiDesktopComputer, HiDeviceMobile, HiPhone, HiChevronRight,
  HiExternalLink, HiDocumentText, HiShieldCheck,
  HiSearch, HiStar, HiChat, HiX,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function loadPref(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem('connectly-platform-settings'));
    if (stored && typeof stored[key] !== 'undefined') return stored[key];
  } catch {}
  return fallback;
}

const settingsNav = [
  { id: 'profile', label: 'Profile', icon: HiUser },
  { id: 'account', label: 'Account', icon: HiLockClosed },
  { id: 'sso', label: 'SSO & SAML', icon: HiShieldCheck },
  { id: 'appearance', label: 'Appearance', icon: HiColorSwatch },
  { id: 'language', label: 'Language', icon: HiViewGrid },
  { id: 'audio', label: 'Audio', icon: HiMicrophone },
  { id: 'video', label: 'Video', icon: HiVideoCamera },
  { id: 'notifications', label: 'Notifications', icon: HiBell },
  { id: 'meeting', label: 'Meeting Preferences', icon: HiCog },
  { id: 'keyboard', label: 'Keyboard Shortcuts', icon: HiViewGrid },
  { id: 'accessibility', label: 'Accessibility', icon: HiHeart },
  { id: 'devices', label: 'Connected Devices', icon: HiDeviceMobile },
  { id: 'saved', label: 'Saved Meetings', icon: HiSave },
  { id: 'recent', label: 'Recent Searches', icon: HiSearch },
  { id: 'feedback', label: 'Feedback', icon: HiHeart },
  { id: 'help', label: 'Help Center', icon: HiQuestionMarkCircle },
  { id: 'about', label: 'About', icon: HiInformationCircle },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const audioDevices = [
  { value: 'default', label: 'Default (Realtek Audio)' },
  { value: 'headset', label: 'Logitech H390 Headset' },
  { value: 'speakers', label: 'Speakers (Realtek)' },
];

const videoDevices = [
  { value: 'default', label: 'HD Webcam (Integrated)' },
  { value: 'external', label: 'Logitech C920 Pro' },
];

const keyboardShortcuts = [
  { keys: 'Ctrl+D', action: 'Mute / Unmute' },
  { keys: 'Ctrl+E', action: 'Start / Stop Video' },
  { keys: 'Ctrl+Shift+S', action: 'Share Screen' },
  { keys: 'Ctrl+Shift+R', action: 'Record' },
  { keys: 'Ctrl+Shift+H', action: 'Raise Hand' },
  { keys: 'Ctrl+Shift+C', action: 'Chat' },
  { keys: 'Ctrl+Shift+P', action: 'Participants' },
  { keys: 'Ctrl+Shift+F', action: 'Fullscreen' },
  { keys: 'Ctrl+Shift+L', action: 'Leave Meeting' },
  { keys: 'Ctrl+.', action: 'Toggle Controls' },
];

const faqItems = [
  { q: 'How do I start a meeting?', a: 'Click "New Meeting" from the dashboard or use the schedule feature to plan ahead.' },
  { q: 'Can I record meetings?', a: 'Yes, hosts can record meetings. Recordings are saved to the cloud and available in the Recordings tab.' },
  { q: 'How many participants can join?', a: 'Free plans support up to 100 participants. Premium plans support up to 1,000.' },
  { q: 'Is my data encrypted?', a: 'All meetings are end-to-end encrypted. Data in transit uses TLS 1.3.' },
];

const helpModalContent = {
  docs: {
    title: 'Documentation',
    body: [
      ['Getting Started', 'Learn the basics of AdzConnect — join your first meeting, set up your profile, and invite teammates.'],
      ['Meetings & Scheduling', 'Schedule, join, and manage meetings. Discover recording, transcription, and live captions.'],
      ['Collaboration', 'Use chat, whiteboard, file sharing, and AI Assistant to work together in real time.'],
      ['Account & Billing', 'Manage your profile, security, SSO, and connected devices from Settings.'],
    ],
  },
  status: {
    title: 'System Status',
    body: [
      ['Video & Audio Service', 'Operational', 'All systems normal'],
      ['Messaging & Collaboration', 'Operational', 'All systems normal'],
      ['Recordings & Storage', 'Operational', 'Serving normally'],
      ['AI Assistant', 'Operational', 'All systems normal'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [['Terms of Service', 'This is a demonstration application. The Terms of Service describe the rules and guidelines for using AdzConnect. By continuing to use the application you agree to use it responsibly and lawfully. This demo does not collect, store, or transmit any personal data to a server.']],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [['Privacy Policy', 'AdzConnect values your privacy. This demo application stores your settings and preferences locally in your browser only. No personal data is sent to external servers. You can clear all locally stored data at any time by clearing your browser site data.']],
  },
  licenses: {
    title: 'Open Source Licenses',
    body: [
      ['React', 'MIT License'],
      ['React Router', 'MIT License'],
      ['Framer Motion', 'MIT License'],
      ['React Icons', 'MIT License'],
      ['Vite', 'MIT License'],
      ['Tailwind CSS', 'MIT License'],
    ],
  },
};

const themes = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'system', label: 'System', icon: '💻' },
];

const accentColors = [
  { id: 'blue', class: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'indigo', class: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'purple', class: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'green', class: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'orange', class: 'bg-orange-500', ring: 'ring-orange-500' },
  { id: 'red', class: 'bg-red-500', ring: 'ring-red-500' },
];

const ACCENT_PALETTES = {
  indigo: {
    '--color-primary-50': '#eef2ff', '--color-primary-100': '#e0e7ff', '--color-primary-200': '#c7d2fe',
    '--color-primary-300': '#a5b4fc', '--color-primary-400': '#818cf8', '--color-primary-500': '#6366f1',
    '--color-primary-600': '#4f46e5', '--color-primary-700': '#4338ca', '--color-primary-800': '#3730a3',
    '--color-primary-900': '#312e81',
  },
  blue: {
    '--color-primary-50': '#eff6ff', '--color-primary-100': '#dbeafe', '--color-primary-200': '#bfdbfe',
    '--color-primary-300': '#93c5fd', '--color-primary-400': '#60a5fa', '--color-primary-500': '#3b82f6',
    '--color-primary-600': '#2563eb', '--color-primary-700': '#1d4ed8', '--color-primary-800': '#1e40af',
    '--color-primary-900': '#1e3a8a',
  },
  purple: {
    '--color-primary-50': '#faf5ff', '--color-primary-100': '#f3e8ff', '--color-primary-200': '#e9d5ff',
    '--color-primary-300': '#d8b4fe', '--color-primary-400': '#c084fc', '--color-primary-500': '#a855f7',
    '--color-primary-600': '#9333ea', '--color-primary-700': '#7e22ce', '--color-primary-800': '#6b21a8',
    '--color-primary-900': '#581c87',
  },
  emerald: {
    '--color-primary-50': '#ecfdf5', '--color-primary-100': '#d1fae5', '--color-primary-200': '#a7f3d0',
    '--color-primary-300': '#6ee7b7', '--color-primary-400': '#34d399', '--color-primary-500': '#10b981',
    '--color-primary-600': '#059669', '--color-primary-700': '#047857', '--color-primary-800': '#065f46',
    '--color-primary-900': '#064e3b',
  },
  orange: {
    '--color-primary-50': '#fff7ed', '--color-primary-100': '#ffedd5', '--color-primary-200': '#fed7aa',
    '--color-primary-300': '#fdba74', '--color-primary-400': '#fb923c', '--color-primary-500': '#f97316',
    '--color-primary-600': '#ea580c', '--color-primary-700': '#c2410c', '--color-primary-800': '#9a3412',
    '--color-primary-900': '#7c2d12',
  },
  red: {
    '--color-primary-50': '#fef2f2', '--color-primary-100': '#fee2e2', '--color-primary-200': '#fecaca',
    '--color-primary-300': '#fca5a5', '--color-primary-400': '#f87171', '--color-primary-500': '#ef4444',
    '--color-primary-600': '#dc2626', '--color-primary-700': '#b91c1c', '--color-primary-800': '#991b1b',
    '--color-primary-900': '#7f1d1d',
  },
};

const fontSizes = ['Small', 'Medium', 'Large'];
const layoutDensities = ['Comfortable', 'Compact'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { getCurrentUser, meetings } = useApp();
  const { setUser } = useAuth();
  const { theme: activeTheme, isDark, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTestMic, setShowTestMic] = useState(false);

  // Profile state
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('connectly-profile'));
      if (stored) return stored;
    } catch {}
    return {
      name: currentUser?.name || 'Alex Johnson',
      email: currentUser?.email || 'alex@connectly.io',
      phone: currentUser?.phone || '+1 (555) 123-4567',
      bio: currentUser?.bio || 'Product designer passionate about remote collaboration.',
      location: currentUser?.location || 'New York, USA',
    };
  });
  const [avatarData, setAvatarData] = useState(() => currentUser?.avatar || '');
  const avatarInputRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarData(ev.target.result);
      toast.success(`Profile photo selected: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarData('');
    toast.success('Profile photo removed');
  };

  const saveProfile = () => {
    const updatedProfile = { ...profile, avatar: avatarData };
    try { localStorage.setItem('connectly-profile', JSON.stringify(updatedProfile)); } catch {}
    try { setUser({ ...currentUser, ...profile, avatar: avatarData || currentUser?.avatar }); } catch {}
    toast.success('Profile saved');
  };

  // Account state
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [newEmail, setNewEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Support / legal modals
  const [helpModal, setHelpModal] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [supportText, setSupportText] = useState('');

  const submitFeedback = () => {
    if (supportText.trim().length < 10) {
      toast.error('Please describe your request in at least 10 characters');
      return;
    }
    toast.success(feedbackModal === 'feature' ? 'Feature request submitted. Thank you!' : 'Problem reported. Our team will follow up shortly.');
    setFeedbackModal(null);
    setSupportText('');
  };

  // SSO / SAML / OIDC / SCIM state
  const [ssoConfig, setSsoConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-sso-config');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      saml: { idpUrl: '', entityId: 'https://connectly.com/saml/metadata', certificate: '', forceSAML: false },
      oidc: { clientId: '', clientSecret: '', authorizeUrl: '', tokenUrl: '' },
      scim: { enabled: false, apiToken: '' },
    };
  });

  const updateSso = (section, field, value) => {
    setSsoConfig((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const saveSSOConfig = () => {
    try {
      localStorage.setItem('connectly-sso-config', JSON.stringify(ssoConfig));
    } catch {}
    toast.success('SSO configuration saved');
  };

  const handleEmailUpdate = () => {
    const email = newEmail.trim();
    if (!email) {
      toast.error('Please enter a new email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (email === profile.email) {
      toast.error('New email is the same as the current email');
      return;
    }
    const updatedProfile = { ...profile, email };
    setProfile(updatedProfile);
    try { localStorage.setItem('connectly-profile', JSON.stringify(updatedProfile)); } catch {}
    try { setUser({ ...currentUser, email }); } catch {}
    setNewEmail('');
    toast.success('Email updated');
  };

  const handlePasswordUpdate = () => {
    if (!passwordForm.current) {
      toast.error('Enter your current password');
      return;
    }
    if (passwordForm.newPass.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    toast.success('Password updated');
  };

  // Appearance state
  const [theme, setTheme] = useState(activeTheme);
  const [accent, setAccent] = useState(() => loadPref('accent', 'indigo'));
  const [density, setDensity] = useState(() => loadPref('density', 'Comfortable'));
  const [fontSize, setFontSize] = useState(() => loadPref('fontSize', 'Medium'));
  const [animations, setAnimations] = useState(() => loadPref('animations', true));

  const selectTheme = (id) => {
    setTheme(id);
    try {
      if (id === 'system') {
        localStorage.removeItem('connectly-theme');
      } else {
        localStorage.setItem('connectly-theme', id);
      }
    } catch {}
    if (id === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark !== prefersDark) toggleTheme();
    } else if (isDark !== (id === 'dark')) {
      toggleTheme();
    }
  };

  const applyAppearance = () => {
    const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.indigo;
    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.style.fontSize = fontSize === 'Small' ? '14px' : fontSize === 'Large' ? '18px' : '16px';
    document.documentElement.setAttribute('data-density', String(density).toLowerCase());
    document.documentElement.classList.toggle('no-animations', !animations);
  };

  useEffect(() => {
    applyAppearance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, density, fontSize, animations]);

  // Audio state
  const [audioInput, setAudioInput] = useState(() => loadPref('audioInput', 'default'));
  const [audioOutput, setAudioOutput] = useState(() => loadPref('audioOutput', 'default'));
  const [noiseSuppression, setNoiseSuppression] = useState(() => loadPref('noiseSuppression', true));
  const [echoCancel, setEchoCancel] = useState(() => loadPref('echoCancel', true));
  const [autoGain, setAutoGain] = useState(() => loadPref('autoGain', true));

  // Video state
  const [videoInput, setVideoInput] = useState(() => loadPref('videoInput', 'default'));
  const [mirrorVideo, setMirrorVideo] = useState(() => loadPref('mirrorVideo', true));
  const [hdVideo, setHdVideo] = useState(() => loadPref('hdVideo', true));
  const [touchUp, setTouchUp] = useState(() => loadPref('touchUp', false));
  const [lowLight, setLowLight] = useState(() => loadPref('lowLight', false));

  // Live device / media state
  const [availableDevices, setAvailableDevices] = useState({ audioInput: [], audioOutput: [], videoInput: [] });
  const [micLevel, setMicLevel] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [camStream, setCamStream] = useState(null);
  const [camError, setCamError] = useState(null);
  const camVideoRef = useRef(null);
  const camStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const micRafRef = useRef(null);

  const refreshDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableDevices({
        audioInput: devices.filter((d) => d.kind === 'audioinput'),
        audioOutput: devices.filter((d) => d.kind === 'audiooutput'),
        videoInput: devices.filter((d) => d.kind === 'videoinput'),
      });
    } catch {}
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        setAvailableDevices({
          audioInput: devices.filter((d) => d.kind === 'audioinput'),
          audioOutput: devices.filter((d) => d.kind === 'audiooutput'),
          videoInput: devices.filter((d) => d.kind === 'videoinput'),
        });
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (camStream && camVideoRef.current) {
      camVideoRef.current.srcObject = camStream;
      camVideoRef.current.play().catch(() => {});
    }
  }, [camStream]);

  useEffect(() => {
    return () => {
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const stopMicTest = () => {
    if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    analyserRef.current = null;
    setIsMicActive(false);
    setMicLevel(0);
  };

  const startMicTest = async () => {
    if (isMicActive) {
      stopMicTest();
      setShowTestMic(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: audioInput && audioInput !== 'default' ? { exact: audioInput } : undefined,
          echoCancellation: echoCancel,
          noiseSuppression,
          autoGainControl: autoGain,
        },
      });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        analyserRef.current = analyser;
        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setMicLevel(Math.min(100, Math.round(rms * 260)));
          micRafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }
      setIsMicActive(true);
      setShowTestMic(true);
      toast.success('Microphone test started');
    } catch (err) {
      stopMicTest();
      setShowTestMic(false);
      toast.error(err.name === 'NotAllowedError' ? 'Microphone permission denied' : 'Could not access microphone');
    }
  };

  const playTestSound = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        toast.error('Audio playback not supported');
        return;
      }
      const ctx = audioCtxRef.current && audioCtxRef.current.state !== 'closed' ? audioCtxRef.current : new AudioCtx();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (audioOutput && audioOutput !== 'default' && ctx.destination.setSinkId) {
        try {
          await ctx.destination.setSinkId(audioOutput);
        } catch {}
      }
      osc.start();
      osc.stop(ctx.currentTime + 1.1);
      toast.success('Playing test tone...');
    } catch {
      toast.error('Could not play test sound');
    }
  };

  const startCameraPreview = async () => {
    if (camStream) {
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      setCamStream(null);
      setCamError(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: videoInput && videoInput !== 'default' ? { exact: videoInput } : undefined,
          width: { ideal: hdVideo ? 1920 : 1280 },
          height: { ideal: hdVideo ? 1080 : 720 },
        },
      });
      camStreamRef.current = stream;
      setCamStream(stream);
      setCamError(null);
      refreshDevices();
      toast.success('Camera preview started');
    } catch (err) {
      setCamError(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Could not access camera');
      toast.error(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Could not start camera preview');
    }
  };

  // Notifications state
  const [notifReminders, setNotifReminders] = useState(() => loadPref('notifReminders', true));
  const [notifMessages, setNotifMessages] = useState(() => loadPref('notifMessages', true));
  const [notifEmail, setNotifEmail] = useState(() => loadPref('notifEmail', false));
  const [notifSound, setNotifSound] = useState(() => loadPref('notifSound', true));
  const [notifDesktop, setNotifDesktop] = useState(() => loadPref('notifDesktop', true));
  const [dndEnabled, setDndEnabled] = useState(() => loadPref('dndEnabled', false));

  // Meeting preferences
  const [autoMicOff, setAutoMicOff] = useState(() => loadPref('autoMicOff', false));
  const [autoCamOff, setAutoCamOff] = useState(() => loadPref('autoCamOff', true));
  const [showNames, setShowNames] = useState(() => loadPref('showNames', true));
  const [alwaysControls, setAlwaysControls] = useState(() => loadPref('alwaysControls', false));

  // Accessibility
  const [highContrast, setHighContrast] = useState(() => loadPref('highContrast', false));
  const [largeCursor, setLargeCursor] = useState(() => loadPref('largeCursor', false));
  const [screenReader, setScreenReader] = useState(() => loadPref('screenReader', false));
  const [captions, setCaptions] = useState(() => loadPref('captions', true));
  const [visualNotifs, setVisualNotifs] = useState(() => loadPref('visualNotifs', false));
  const [reduceMotion, setReduceMotion] = useState(() => loadPref('reduceMotion', false));

  // Language
  const [appLanguage, setAppLanguage] = useState(() => loadPref('appLanguage', 'english'));
  const [speechLang, setSpeechLang] = useState(() => loadPref('speechLang', 'english'));
  const [translationLang, setTranslationLang] = useState(() => loadPref('translationLang', 'english'));
  const [dateFormat, setDateFormat] = useState(() => loadPref('dateFormat', 'MM/DD/YYYY'));

  // Connected Devices
  const [connectedDevices, setConnectedDevices] = useState([
    { id: 1, name: 'MacBook Pro', type: 'computer', lastActive: 'Active now', icon: HiDesktopComputer },
    { id: 2, name: 'iPhone 15', type: 'phone', lastActive: '2 min ago', icon: HiDeviceMobile },
    { id: 3, name: 'iPad Air', type: 'tablet', lastActive: '1 hour ago', icon: HiDeviceMobile },
    { id: 4, name: 'AirPods Pro', type: 'audio', lastActive: '3 hours ago', icon: HiPhone },
  ]);

  // Saved Meetings
  const savedMeetings = useMemo(() => {
    if (!Array.isArray(meetings)) return [];
    return meetings
      .filter((m) => ['live', 'upcoming', 'pending_approval'].includes(m.status))
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        title: m.title || 'Untitled meeting',
        date: m.date || '—',
        time: m.time || '—',
      }));
  }, [meetings]);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState([
    'Q3 roadmap', 'meeting recordings', 'Sarah Chen', 'Connectly Spaces', 'pricing plans'
  ]);

  // Feedback
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');

  useEffect(() => {
    try {
      localStorage.setItem('connectly-platform-settings', JSON.stringify({
        theme, accent, density, fontSize, animations,
        audioInput, audioOutput, noiseSuppression, echoCancel, autoGain,
        videoInput, mirrorVideo, hdVideo, touchUp, lowLight,
        notifReminders, notifMessages, notifEmail, notifSound, notifDesktop, dndEnabled,
        autoMicOff, autoCamOff, showNames, alwaysControls,
        highContrast, largeCursor, screenReader, captions, visualNotifs, reduceMotion,
        appLanguage, speechLang, translationLang, dateFormat,
      }));
    } catch {}
  }, [theme, accent, density, fontSize, animations, audioInput, audioOutput, noiseSuppression, echoCancel, autoGain, videoInput, mirrorVideo, hdVideo, touchUp, lowLight, notifReminders, notifMessages, notifEmail, notifSound, notifDesktop, dndEnabled, autoMicOff, autoCamOff, showNames, alwaysControls, highContrast, largeCursor, screenReader, captions, visualNotifs, reduceMotion, appLanguage, speechLang, translationLang, dateFormat]);

  const volumeBars = [20, 40, 55, 70, 85, 65, 45, 30, 50, 60, 75, 90, 80, 55, 35, 50, 65, 85, 70, 40];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfile();
      case 'account': return renderAccount();
      case 'sso': return renderSSO();
      case 'appearance': return renderAppearance();
      case 'language': return renderLanguage();
      case 'audio': return renderAudio();
      case 'video': return renderVideo();
      case 'notifications': return renderNotifications();
      case 'meeting': return renderMeetingPrefs();
      case 'keyboard': return renderKeyboard();
      case 'accessibility': return renderAccessibility();
      case 'devices': return renderDevices();
      case 'saved': return renderSavedMeetings();
      case 'recent': return renderRecentSearches();
      case 'feedback': return renderFeedback();
      case 'help': return renderHelp();
      case 'about': return renderAbout();
      default: return null;
    }
  };

  const renderProfile = () => (
    <motion.div key="profile" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your personal information</p></div>
      <Card>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar src={avatarData || currentUser?.avatar} name={profile.name} size="2xl" />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => avatarInputRef.current?.click()} aria-label="Change profile photo">
                <HiCamera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">JPG or PNG. Max 5MB.</p>
              <div className="mt-3 flex gap-3">
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} aria-label="Choose a profile photo" />
                <Button variant="secondary" size="sm" icon={HiUpload} onClick={() => avatarInputRef.current?.click()}>Upload</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={removeAvatar}>Remove</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <Input label="Phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="Location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Bio</label>
            <textarea className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Write a short bio..." />
          </div>
          <div className="flex justify-end"><Button icon={HiSave} onClick={saveProfile}>Save Changes</Button></div>
        </div>
      </Card>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div key="account" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your account settings and security</p></div>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Change Email</h3>
        <div className="max-w-md space-y-4">
          <Input label="Current Email" type="email" value={profile.email} disabled />
          <Input label="New Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email address" />
          <Button size="sm" onClick={handleEmailUpdate}>Update Email</Button>
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
        <div className="max-w-md space-y-4">
          <Input label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Enter current password" />
          <Input label="New Password" type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} placeholder="Enter new password" />
          <Input label="Confirm New Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm new password" />
          <Button size="sm" onClick={handlePasswordUpdate}>Update Password</Button>
        </div>
      </Card>
      <Card className="border-red-200 dark:border-red-800">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <Button variant="danger" size="sm" icon={HiTrash} onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
      </Card>
    </motion.div>
  );

  const renderSSO = () => (
    <motion.div key="sso" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">SSO & SAML</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure single sign-on and identity provider settings</p></div>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">SAML Configuration</h3>
        <div className="space-y-4 max-w-md">
          <Input label="Identity Provider URL" value={ssoConfig.saml.idpUrl} onChange={(e) => updateSso('saml', 'idpUrl', e.target.value)} placeholder="https://your-idp.com/saml" />
          <Input label="Entity ID" value={ssoConfig.saml.entityId} onChange={(e) => updateSso('saml', 'entityId', e.target.value)} placeholder="https://connectly.com/saml/metadata" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Certificate (x509)</label>
            <textarea rows={4} value={ssoConfig.saml.certificate} onChange={(e) => updateSso('saml', 'certificate', e.target.value)} placeholder="-----BEGIN CERTIFICATE-----" className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Force SAML Login</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Require SSO for all users</p>
            </div>
            <Toggle enabled={ssoConfig.saml.forceSAML} onChange={(v) => updateSso('saml', 'forceSAML', v)} />
          </div>
          <Button size="sm" onClick={saveSSOConfig}>Save Configuration</Button>
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">OIDC / OAuth 2.0</h3>
        <div className="space-y-4 max-w-md">
          <Input label="Client ID" value={ssoConfig.oidc.clientId} onChange={(e) => updateSso('oidc', 'clientId', e.target.value)} placeholder="your-client-id" />
          <Input label="Client Secret" type="password" value={ssoConfig.oidc.clientSecret} onChange={(e) => updateSso('oidc', 'clientSecret', e.target.value)} placeholder="Enter client secret" />
          <Input label="Authorize URL" value={ssoConfig.oidc.authorizeUrl} onChange={(e) => updateSso('oidc', 'authorizeUrl', e.target.value)} placeholder="https://your-idp.com/oauth/authorize" />
          <Input label="Token URL" value={ssoConfig.oidc.tokenUrl} onChange={(e) => updateSso('oidc', 'tokenUrl', e.target.value)} placeholder="https://your-idp.com/oauth/token" />
          <Button size="sm" onClick={saveSSOConfig}>Save Configuration</Button>
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Provisioning</h3>
        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">SCIM Provisioning</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Automatically provision users from your identity provider</p>
            </div>
            <Toggle enabled={ssoConfig.scim.enabled} onChange={(v) => updateSso('scim', 'enabled', v)} />
          </div>
          <Input label="SCIM Endpoint" value="https://connectly.com/api/scim/v2" disabled />
          <Input label="API Token" type="password" value={ssoConfig.scim.apiToken} onChange={(e) => updateSso('scim', 'apiToken', e.target.value)} placeholder="Generate a SCIM API token" />
          <Button size="sm" variant="secondary" onClick={() => { updateSso('scim', 'apiToken', 'scim-' + Math.random().toString(36).slice(2) + Date.now().toString(36)); toast.success('Token generated'); }}>Generate New Token</Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderAppearance = () => (
    <motion.div key="appearance" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Customize your visual experience</p></div>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button key={t.id} onClick={() => selectTheme(t.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${theme === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Accent Color</h3>
        <div className="flex gap-3">
          {accentColors.map((c) => (
            <button key={c.id} onClick={() => setAccent(c.id)} className={`w-9 h-9 rounded-full ${c.class} ${accent === c.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : ''} ${c.ring} transition-all hover:scale-110`} title={c.id} />
          ))}
        </div>
      </Card>
      <Card>
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Layout Density</h3>
            <div className="flex gap-3">
              {layoutDensities.map((d) => (
                <button key={d} onClick={() => setDensity(d)} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${density === d ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Font Size</h3>
            <div className="flex gap-3">
              {fontSizes.map((s) => (
                <button key={s} onClick={() => setFontSize(s)} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${fontSize === s ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
            <Toggle enabled={animations} onChange={setAnimations} label="Enable animations" />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderAudio = () => (
    <motion.div key="audio" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audio</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure your microphone and speaker settings</p></div>
      <Card>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Microphone</label>
              <select value={audioInput} onChange={(e) => { setAudioInput(e.target.value); if (isMicActive) { stopMicTest(); setShowTestMic(false); } }} className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="default">Default</option>
                {(availableDevices.audioInput.length > 0 ? availableDevices.audioInput : audioDevices).map((d) => (
                  <option key={d.deviceId || d.value} value={d.deviceId || d.value}>{d.label || `Microphone ${(d.deviceId || d.value).slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Speaker</label>
              <select value={audioOutput} onChange={(e) => setAudioOutput(e.target.value)} className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="default">Default</option>
                {(availableDevices.audioOutput.length > 0 ? availableDevices.audioOutput : audioDevices).map((d) => (
                  <option key={d.deviceId || d.value} value={d.deviceId || d.value}>{d.label || `Speaker ${(d.deviceId || d.value).slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" icon={HiDesktopComputer} onClick={startMicTest}>{isMicActive ? 'Stop Microphone Test' : 'Test Microphone'}</Button>
            <Button variant="secondary" size="sm" icon={HiPhone} onClick={playTestSound}>Test Speaker</Button>
          </div>
          {showTestMic && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                {isMicActive ? `Live input · level ${micLevel}%` : 'Click "Test Microphone" to check your input level'}
              </p>
              <div className="flex items-end gap-1 h-16">
                {volumeBars.map((h, i) => {
                  const active = isMicActive && micLevel > (i / volumeBars.length) * 100;
                  const height = isMicActive ? Math.max(5, (h * Math.max(micLevel, 5)) / 100) : 5;
                  return (
                    <motion.div key={i} animate={{ height: `${height}%`, opacity: active ? 1 : 0.25 }} transition={{ duration: 0.08 }} className={`flex-1 rounded-t-sm ${active ? 'bg-emerald-500' : 'bg-primary-500'}`} />
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">Speak now — the meter reacts to your microphone input.</p>
            </motion.div>
          )}
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Audio Processing</h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between"><Toggle enabled={noiseSuppression} onChange={setNoiseSuppression} label="Noise suppression" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={echoCancel} onChange={setEchoCancel} label="Echo cancellation" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={autoGain} onChange={setAutoGain} label="Auto gain control" /></div>
        </div>
      </Card>
    </motion.div>
  );

  const renderVideo = () => (
    <motion.div key="video" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure your camera and video settings</p></div>
      <Card>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Camera</label>
              <select value={videoInput} onChange={(e) => { setVideoInput(e.target.value); if (camStream) startCameraPreview(); }} className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="default">Default</option>
                {(availableDevices.videoInput.length > 0 ? availableDevices.videoInput : videoDevices).map((d) => (
                  <option key={d.deviceId || d.value} value={d.deviceId || d.value}>{d.label || `Camera ${(d.deviceId || d.value).slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <Button variant={camStream ? 'danger' : 'primary'} size="sm" icon={HiVideoCamera} onClick={startCameraPreview}>{camStream ? 'Stop Camera' : 'Start Camera'}</Button>
            </div>
          </div>
          <div className="w-full aspect-video rounded-xl bg-gray-200 dark:bg-slate-600 overflow-hidden relative border-2 border-dashed border-gray-300 dark:border-slate-500">
            {camStream ? (
              <video
                ref={camVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${mirrorVideo ? '-scale-x-100' : ''}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <HiVideoCamera className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Camera Preview</p>
                  <Badge variant={camError ? 'danger' : 'default'} size="sm" className="mt-1">{camError || 'No camera active'}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Video Settings</h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between"><Toggle enabled={mirrorVideo} onChange={setMirrorVideo} label="Mirror my video" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={hdVideo} onChange={setHdVideo} label="HD video (1080p)" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={touchUp} onChange={setTouchUp} label="Touch up my appearance" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={lowLight} onChange={setLowLight} label="Low light adjustment" /></div>
        </div>
      </Card>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div key="notifications" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Control how and when you receive notifications</p></div>
      <Card>
        <div className="space-y-5">
          <div className="flex items-center justify-between"><Toggle enabled={notifReminders} onChange={setNotifReminders} label="Meeting reminders" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={notifMessages} onChange={setNotifMessages} label="Message notifications" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={notifEmail} onChange={setNotifEmail} label="Email notifications" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={notifSound} onChange={setNotifSound} label="Sound when someone joins/leaves" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={notifDesktop} onChange={setNotifDesktop} label="Desktop notifications" /></div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Do Not Disturb</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Schedule quiet hours for notifications</p>
          </div>
          <Toggle enabled={dndEnabled} onChange={setDndEnabled} />
        </div>
        {dndEnabled && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">From</label>
              <input type="time" defaultValue="22:00" className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">To</label>
              <input type="time" defaultValue="08:00" className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );

  const renderMeetingPrefs = () => (
    <motion.div key="meeting" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meeting Preferences</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure default meeting behavior</p></div>
      <Card>
        <div className="space-y-5">
          <div className="flex items-center justify-between"><Toggle enabled={autoMicOff} onChange={setAutoMicOff} label="Auto-join with microphone off" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={autoCamOff} onChange={setAutoCamOff} label="Auto-join with camera off" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={showNames} onChange={setShowNames} label="Show participant names on video" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={alwaysControls} onChange={setAlwaysControls} label="Always show meeting controls" /></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {keyboardShortcuts.slice(0, 4).map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/30">
              <span className="text-sm text-gray-700 dark:text-slate-300">{s.action}</span>
              <kbd className="px-2 py-1 text-xs font-mono rounded bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-600 dark:text-slate-300 shadow-sm">{s.keys}</kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">View all shortcuts in the Keyboard Shortcuts tab</p>
      </Card>
    </motion.div>
  );

  const renderKeyboard = () => (
    <motion.div key="keyboard" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Master Connectly with keyboard shortcuts</p></div>
      <Card padding={false}>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {keyboardShortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{s.action}</span>
              <kbd className="px-3 py-1.5 text-xs font-mono rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 shadow-sm">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );

  const renderAccessibility = () => (
    <motion.div key="accessibility" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Make Connectly work better for you</p></div>
      <Card>
        <div className="space-y-5">
          <div className="flex items-center justify-between"><Toggle enabled={highContrast} onChange={setHighContrast} label="High contrast mode" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={largeCursor} onChange={setLargeCursor} label="Larger cursor" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={screenReader} onChange={setScreenReader} label="Screen reader support" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={captions} onChange={setCaptions} label="Show captions during meetings" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={visualNotifs} onChange={setVisualNotifs} label="Visual notifications for sounds" /></div>
          <div className="flex items-center justify-between"><Toggle enabled={reduceMotion} onChange={setReduceMotion} label="Reduce motion" /></div>
        </div>
      </Card>
    </motion.div>
  );

  const renderLanguage = () => (
    <motion.div key="language" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Language & Region</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure language and regional preferences</p></div>
      <Card>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">App Language</label>
            <select value={appLanguage} onChange={(e) => setAppLanguage(e.target.value)} className="block w-full max-w-md rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              {['english', 'spanish', 'french', 'german', 'japanese', 'chinese', 'portuguese', 'arabic'].map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Speech Recognition Language</label>
            <select value={speechLang} onChange={(e) => setSpeechLang(e.target.value)} className="block w-full max-w-md rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              {['english', 'spanish', 'french', 'german', 'japanese', 'chinese'].map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Translation Target Language</label>
            <select value={translationLang} onChange={(e) => setTranslationLang(e.target.value)} className="block w-full max-w-md rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              {['english', 'spanish', 'french', 'german', 'japanese', 'chinese', 'portuguese', 'arabic', 'hindi', 'korean'].map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Time Zone</label>
            <p className="text-sm text-gray-500 dark:text-slate-400">(UTC-5:00) Eastern Time - New York</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Date Format</label>
            <div className="flex gap-3">
              {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((fmt) => (
                <button key={fmt} onClick={() => setDateFormat(fmt)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${dateFormat === fmt ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>{fmt}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderDevices = () => (
    <motion.div key="devices" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connected Devices</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage devices connected to your account</p></div>
      <Card>
        <div className="space-y-4">
          {connectedDevices.map((device) => {
            const Icon = device.icon;
            return (
              <div key={device.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{device.type} · {device.lastActive}</p>
                </div>
                <Button variant="ghost" size="xs" className="text-red-500 hover:text-red-600" onClick={() => { setConnectedDevices((prev) => prev.filter((d) => d.id !== device.id)); toast.success('Device removed'); }}>Remove</Button>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );

  const renderSavedMeetings = () => (
    <motion.div key="saved" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Saved Meetings</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Access your bookmarked meetings</p></div>
      <Card padding={false}>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {savedMeetings.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <HiStar className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{m.date} at {m.time}</p>
                </div>
              </div>
              <Button variant="ghost" size="xs" onClick={() => navigate(`/app/meeting/${m.id}`)}>Open</Button>
            </div>
          ))}
          {savedMeetings.length === 0 && (
            <div className="text-center py-8">
              <HiStar className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No saved meetings yet</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  const renderRecentSearches = () => (
    <motion.div key="recent" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Searches</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">View and manage your search history</p></div>
      <Card>
        <div className="space-y-2">
          {recentSearches.map((search, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <HiSearch className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-slate-300">{search}</span>
              </div>
              <button onClick={() => setRecentSearches((prev) => prev.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-400 transition-colors"><HiX className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" icon={HiTrash} onClick={() => { setRecentSearches([]); toast.success('Search history cleared'); }}>Clear Search History</Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderFeedback = () => (
    <motion.div key="feedback" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feedback</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Help us improve Connectly</p></div>
      <Card>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Category</label>
            <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className="block w-full max-w-md rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              {[{ value: 'general', label: 'General Feedback' }, { value: 'bug', label: 'Bug Report' }, { value: 'feature', label: 'Feature Request' }, { value: 'performance', label: 'Performance Issue' }].map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setFeedbackRating(star)} className={`p-1 transition-colors ${star <= feedbackRating ? 'text-amber-500' : 'text-gray-300 dark:text-slate-600'}`}>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Your Feedback</label>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Tell us what you think..." />
          </div>
          <div className="flex justify-end"><Button icon={HiChat} disabled={!feedbackRating || !feedbackText.trim()} onClick={() => { toast.success('Thank you for your feedback!'); setFeedbackRating(0); setFeedbackText(''); }}>Submit Feedback</Button></div>
        </div>
      </Card>
    </motion.div>
  );

  const renderHelp = () => (
    <motion.div key="help" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Help Center</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Get support and find answers</p></div>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details key={i} className="group rounded-xl bg-gray-50 dark:bg-slate-700/30 open:bg-primary-50 dark:open:bg-primary-900/10 transition-colors">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</span>
                <HiChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-500 dark:text-slate-400">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="secondary" fullWidth icon={HiQuestionMarkCircle} onClick={() => navigate('/app/chat')}>Contact Support</Button>
          <Button variant="secondary" fullWidth icon={HiDocumentText} onClick={() => setHelpModal('docs')}>Documentation</Button>
          <Button variant="secondary" fullWidth icon={HiExternalLink} onClick={() => setHelpModal('status')}>Status Page</Button>
          <Button variant="secondary" fullWidth icon={HiShieldCheck} onClick={() => setFeedbackModal('problem')}>Report a Problem</Button>
        </div>
        <div className="mt-4">
          <Button variant="outline" fullWidth icon={HiExternalLink} onClick={() => setFeedbackModal('feature')}>Request a Feature</Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderAbout = () => (
    <motion.div key="about" variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      <div><h2 className="text-xl font-semibold text-gray-900 dark:text-white">About</h2><p className="text-sm text-gray-500 dark:text-slate-400 mt-1">App information and legal</p></div>
      <Card>
        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl">C</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connectly</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Version <span className="font-mono font-medium text-gray-700 dark:text-slate-300">v3.2.1</span></p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Last updated: July 28, 2026</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <p className="text-sm font-medium text-gray-900 dark:text-white">License</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">MIT License</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Build</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Build 2026.07.28-1342</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="ghost" size="sm" icon={HiExternalLink} onClick={() => setHelpModal('terms')}>Terms of Service</Button>
            <Button variant="ghost" size="sm" icon={HiExternalLink} onClick={() => setHelpModal('privacy')}>Privacy Policy</Button>
            <Button variant="ghost" size="sm" icon={HiDocumentText} onClick={() => setHelpModal('licenses')}>Open Source Licenses</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <>
    <Helmet>
      <title>Settings - AdzConnect</title>
      <meta name="description" content="Manage your AdzConnect account settings, profile, appearance, notifications, and connected devices." />
    </Helmet>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <motion.nav variants={itemVariants} className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} title="Delete Account" size="sm"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancel</Button>
          <Button variant="danger" size="sm" disabled={deleteConfirm !== 'DELETE'} onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); toast.success('Account deletion request submitted'); }}>Permanently Delete</Button>
        </>}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-slate-400">This action is irreversible. All your data, meetings, recordings, and account information will be permanently deleted.</p>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2"><HiInformationCircle className="w-4 h-4 shrink-0 mt-0.5" />Please type <strong className="font-mono">DELETE</strong> to confirm.</p>
          </div>
          <Input placeholder='Type "DELETE" to confirm' value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
        </div>
      </Modal>

      {/* Help / Legal Modal */}
      <Modal isOpen={!!helpModal} onClose={() => setHelpModal(null)} title={helpModalContent[helpModal]?.title || ''} size="sm">
        <div className="space-y-4">
          {helpModalContent[helpModal]?.body.map(([heading, detail, extra], i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{heading}</p>
              <p className={`text-sm text-gray-500 dark:text-slate-400 ${extra ? 'mt-1' : 'mt-1.5'}`}>{detail}</p>
              {extra && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{extra}</p>}
            </div>
          ))}
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal isOpen={!!feedbackModal} onClose={() => { setFeedbackModal(null); setSupportText(''); }} title={feedbackModal === 'feature' ? 'Request a Feature' : 'Report a Problem'} size="sm"
        footer={<>
          <Button variant="secondary" size="sm" onClick={() => { setFeedbackModal(null); setSupportText(''); }}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={submitFeedback}>Submit</Button>
        </>}>
        <textarea
          rows={5}
          value={supportText}
          onChange={(e) => setSupportText(e.target.value)}
          placeholder={feedbackModal === 'feature' ? 'Describe the feature you would like to see...' : 'Describe the problem you encountered...'}
          className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </Modal>
    </motion.div>
    </>
  );
}
