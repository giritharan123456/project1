import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSearch, HiChat, HiHashtag, HiUser, HiPaperAirplane,
  HiEmojiHappy, HiPaperClip, HiMicrophone, HiDotsHorizontal,
  HiBookmark, HiReply, HiUsers, HiFolder, HiX,
  HiStop, HiPlay, HiPlus, HiVideoCamera,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const teamChannels = [
  { id: 'general', name: 'General', icon: HiHashtag, kind: 'team' },
  { id: 'engineering', name: 'Engineering', icon: HiHashtag, kind: 'team' },
  { id: 'marketing', name: 'Marketing', icon: HiHashtag, kind: 'team' },
  { id: 'sales', name: 'Sales', icon: HiHashtag, kind: 'team' },
  { id: 'random', name: 'Random', icon: HiHashtag, kind: 'team' },
];

function loadGroupChats() {
  try {
    const stored = localStorage.getItem('connectly-group-chats');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

const statusColors = { online: 'bg-emerald-500', away: 'bg-amber-500', offline: 'bg-gray-400' };

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}



export default function ChatPage() {
  const { messages, users, meetings, getCurrentUser, broadcastMessage, markMessagesRead } = useApp();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState('general');
  const [activeDM, setActiveDM] = useState(null);
  const [groupChats, setGroupChats] = useState(loadGroupChats);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [threadOpen, setThreadOpen] = useState(null);
  const [threadInput, setThreadInput] = useState('');
  const [voiceModal, setVoiceModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const recordingTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const chatMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel, activeDM, scrollToBottom]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current && !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current && !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!showChatMenu) return;
    const handleClickOutside = (e) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChatMenu]);

  const filteredMessages = useMemo(() => {
    if (activeDM) {
      return messages.filter(
        (m) => m.type === 'direct' && ((m.from === activeDM && m.to === currentUser?.id) || (m.from === currentUser?.id && m.to === activeDM))
      );
    }
    return messages.filter((m) => m.type === 'channel' && m.to === activeChannel);
  }, [messages, activeChannel, activeDM, currentUser]);

  useEffect(() => {
    if (activeDM) {
      markMessagesRead('direct', activeDM);
    } else if (activeChannel) {
      markMessagesRead('channel', activeChannel);
    }
  }, [activeDM, activeChannel, messages, markMessagesRead]);

  const unreadCount = useCallback((channelId) => {
    return messages.filter((m) => m.type === 'channel' && m.to === channelId && !m.read && m.from !== currentUser?.id).length;
  }, [messages, currentUser]);

  const unreadDMCount = useCallback((userId) => {
    return messages.filter((m) => m.type === 'direct' && m.from === userId && m.to === currentUser?.id && !m.read).length;
  }, [messages, currentUser]);

  const getUser = (id) => users.find((u) => u.id === id);
  const isChannel = !activeDM;

  const meetingChats = useMemo(
    () => meetings.map((m) => ({ id: `meeting-${m.id}`, name: m.title, icon: HiVideoCamera, kind: 'meeting', meetingId: m.id })),
    [meetings],
  );

  useEffect(() => {
    try { localStorage.setItem('connectly-group-chats', JSON.stringify(groupChats)); } catch {}
  }, [groupChats]);

  const allChannels = useMemo(() => [...teamChannels, ...meetingChats, ...groupChats], [meetingChats, groupChats]);
  const findChannel = useCallback((id) => allChannels.find((c) => c.id === id), [allChannels]);

  const channelMembers = useMemo(() => {
    if (isChannel) {
      const participants = new Set();
      messages.filter((m) => m.type === 'channel' && m.to === activeChannel).forEach((m) => participants.add(m.from));
      return users.filter((u) => participants.has(u.id));
    }
    return [];
  }, [messages, activeChannel, isChannel, users]);

  const pinnedMessages = useMemo(() => {
    return messages.filter((m) => m.pinned && (activeDM ? m.type === 'direct' && (m.from === activeDM || m.to === activeDM) : m.type === 'channel' && m.to === activeChannel));
  }, [messages, activeChannel, activeDM]);

  const sidebarItems = useMemo(() => {
    const filtered = users.filter((u) => u.id !== currentUser?.id);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return filtered.filter((u) => u.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [users, currentUser, searchQuery]);

  const getHeaderTitle = () => {
    if (activeDM) {
      const u = getUser(activeDM);
      return u?.name || 'Direct Message';
    }
    const ch = findChannel(activeChannel);
    return ch ? `# ${ch.name}` : 'Chat';
  };

  const handleSend = useCallback(() => {
    if (!messageInput.trim() && !attachedFile) return;
    broadcastMessage({
      text: messageInput,
      from: currentUser?.id || 'u7',
      to: activeDM || activeChannel,
      type: activeDM ? 'direct' : 'channel',
      sender: currentUser?.name || 'User',
      senderRole: currentUser?.role || 'employee',
      ...(replyTo && { replyTo: replyTo.id }),
      ...(attachedFile && { attachment: { name: attachedFile.name, size: attachedFile.size, type: attachedFile.type } }),
    });
    setMessageInput('');
    setAttachedFile(null);
    setReplyTo(null);
  }, [messageInput, attachedFile, broadcastMessage, currentUser, activeDM, activeChannel, replyTo]);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🙌', '💯', '🎈', '🚀', '⭐'];

  const insertEmoji = (emoji) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newText = messageInput.substring(0, start) + emoji + messageInput.substring(end);
      setMessageInput(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + emoji.length;
      });
    } else {
      setMessageInput((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getThreadMessages = (replyToId) => {
    return messages.filter((m) => m.replyTo === replyToId);
  };

  const startRecording = async () => {
    setRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        recorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          const url = audioChunksRef.current.length > 0
            ? URL.createObjectURL(new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
            : null;
          const note = { id: Date.now(), duration: recordingTime, timestamp: Date.now(), url };
          setVoiceNotes(prev => [note, ...prev]);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        mediaStreamRef.current = stream;
      } catch {
        toast('Microphone unavailable - recording simulated');
      }
    } else {
      toast('Microphone not supported - recording simulated');
    }
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(recordingTimerRef.current);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.stop(); } catch {}
      mediaRecorderRef.current = null;
    } else {
      const note = { id: Date.now(), duration: recordingTime, timestamp: Date.now(), url: null };
      setVoiceNotes(prev => [note, ...prev]);
    }
    setRecordingTime(0);
  };

  const toggleVoiceNote = (vn) => {
    if (vn.url) {
      if (playingVoiceId === vn.id) {
        audioRef.current?.pause();
        setPlayingVoiceId(null);
      } else {
        audioRef.current?.pause();
        const audio = new Audio(vn.url);
        audioRef.current = audio;
        audio.onended = () => setPlayingVoiceId(null);
        audio.play();
        setPlayingVoiceId(vn.id);
      }
    } else {
      setPlayingVoiceId(playingVoiceId === vn.id ? null : vn.id);
    }
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const openThread = (msg) => {
    setThreadOpen(msg);
  };

  const handleThreadReply = () => {
    if (!threadInput.trim() || !threadOpen) return;
    broadcastMessage({
      text: threadInput,
      from: currentUser?.id || 'u7',
      to: activeDM || activeChannel,
      type: activeDM ? 'direct' : 'channel',
      replyTo: threadOpen.id,
      sender: currentUser?.name || 'User',
      senderRole: currentUser?.role || 'employee',
    });
    setThreadInput('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-6rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Helmet>
        <title>Chat - AdzConnect</title>
        <meta name="description" content="Send messages, share files, and collaborate with your team in AdzConnect chat channels." />
      </Helmet>
      <Card padding={false} className="h-full flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Team Channels */}
            <div className="p-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">Team Channels</h4>
              <div className="space-y-0.5">
                {teamChannels.map((ch) => {
                  const Icon = ch.icon;
                  const unread = unreadCount(ch.id);
                  const isActive = isChannel && activeChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { setActiveChannel(ch.id); setActiveDM(null); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{ch.name}</span>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-600 text-white min-w-[18px] text-center">{unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Meeting Chats */}
            <div className="p-3 pt-0">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">Meeting Chats</h4>
              <div className="space-y-0.5">
                {meetingChats.length > 0 ? (
                  meetingChats.slice(0, 12).map((ch) => {
                    const Icon = ch.icon;
                    const unread = unreadCount(ch.id);
                    const isActive = isChannel && activeChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => { setActiveChannel(ch.id); setActiveDM(null); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{ch.name}</span>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-600 text-white min-w-[18px] text-center">{unread}</span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 dark:text-slate-500 px-2">No meetings yet</p>
                )}
              </div>
            </div>
            {/* Group Chats */}
            <div className="p-3 pt-0">
              <div className="flex items-center justify-between mb-2 px-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Group Chats</h4>
                <button
                  onClick={() => { setShowGroupModal(true); setGroupName(''); setGroupMembers([]); }}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  title="Create group chat"
                  aria-label="Create group chat"
                >
                  <HiPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-0.5">
                {groupChats.length > 0 ? (
                  groupChats.map((ch) => {
                    const Icon = HiUsers;
                    const unread = unreadCount(ch.id);
                    const isActive = isChannel && activeChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => { setActiveChannel(ch.id); setActiveDM(null); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">{ch.name}</span>
                        {unread > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-600 text-white min-w-[18px] text-center">{unread}</span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 dark:text-slate-500 px-2">No group chats yet</p>
                )}
              </div>
            </div>
            {/* Direct Messages */}
            <div className="p-3 pt-0">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">Direct Messages</h4>
              <div className="space-y-0.5">
                {sidebarItems.map((u) => {
                  const isActive = activeDM === u.id;
                  const unread = unreadDMCount(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => { setActiveDM(u.id); setActiveChannel(null); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar src={u.avatar} name={u.name} size="xs" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white dark:ring-slate-800 ${statusColors[u.status] || 'bg-gray-400'}`} />
                      </div>
                      <span className="flex-1 text-left truncate">{u.name}</span>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-600 text-white min-w-[18px] text-center">{unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area + Thread Panel */}
        <div className="flex-1 flex min-w-0">
          {/* Main Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {activeDM ? (
                  <div className="relative">
                    <Avatar src={getUser(activeDM)?.avatar} name={getUser(activeDM)?.name} size="sm" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${statusColors[getUser(activeDM)?.status] || 'bg-gray-400'}`} />
                  </div>
                ) : (
                  <HiHashtag className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white">{getHeaderTitle()}</h3>
                {activeDM && (
                  <Badge size="sm" variant={getUser(activeDM)?.status === 'online' ? 'success' : getUser(activeDM)?.status === 'away' ? 'warning' : 'default'}>
                    {getUser(activeDM)?.status}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowRightPanel(!showRightPanel)} className={`p-2 rounded-lg transition-colors ${showRightPanel ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                  <HiUsers className="w-4 h-4" />
                </button>
                <div className="relative" ref={chatMenuRef}>
                  <button onClick={() => setShowChatMenu(!showChatMenu)} className={`p-2 rounded-lg transition-colors ${showChatMenu ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400'}`} aria-label="Conversation options">
                    <HiDotsHorizontal className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showChatMenu && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-40">
                        <button onClick={() => { setShowChatMenu(false); navigate('/app/search'); }} className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <HiSearch className="w-4 h-4 text-gray-400" /> Search in conversation
                        </button>
                        <button onClick={() => { setShowChatMenu(false); markMessagesRead(activeDM ? 'direct' : 'channel', activeDM || activeChannel); toast.success('Conversation marked as read'); }} className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <HiBookmark className="w-4 h-4 text-gray-400" /> Mark all as read
                        </button>
                        <button onClick={() => { setShowChatMenu(false); setShowRightPanel(true); }} className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <HiUsers className="w-4 h-4 text-gray-400" /> View members
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <HiChat className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                      {isChannel ? `No messages in #${findChannel(activeChannel)?.name}` : 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Start a conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-6 space-y-0.5">
                  {filteredMessages.map((msg) => {
                    const fromUser = getUser(msg.from);
                    const replies = getThreadMessages(msg.id);
                    const threadReplies = replies.length;
                    return (
                      <div key={msg.id} className="group flex gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <Avatar src={fromUser?.avatar} name={fromUser?.name} size="sm" className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{fromUser?.name}</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">{formatTime(msg.timestamp)}</span>
                            {msg.pinned && <HiBookmark className="w-3 h-3 text-amber-500" />}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{msg.text}</p>
                          {/* Thread replies indicator */}
                          {threadReplies > 0 && (
                            <button
                              onClick={() => openThread(msg)}
                              className="flex items-center gap-1.5 mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <HiReply className="w-3 h-3" />
                              {threadReplies} {threadReplies === 1 ? 'reply' : 'replies'}
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                            title="Reply in thread"
                          >
                            <HiReply className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openThread(msg)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                            title="Open thread"
                          >
                            <HiDotsHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Voice notes in chat */}
              {voiceNotes.map((vn) => (
                <div key={vn.id} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary-50/50 dark:bg-primary-900/10">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    <HiMicrophone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-primary-500 rounded-full animate-pulse"
                            style={{ height: `${Math.random() * 12 + 4}px`, animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{formatDuration(vn.duration)}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Voice message · {formatTime(vn.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => toggleVoiceNote(vn)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${playingVoiceId === vn.id ? 'text-primary-600' : 'text-gray-400'}`}
                    aria-label={playingVoiceId === vn.id ? 'Stop voice note' : 'Play voice note'}
                  >
                    {playingVoiceId === vn.id ? <HiStop className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
                  </button>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyTo && (
              <div className="px-6 py-2 bg-gray-50 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <HiReply className="w-3.5 h-3.5" />
                  Replying to <span className="font-medium text-gray-700 dark:text-slate-300">{getUser(replyTo.from)?.name}</span>
                </div>
                <button onClick={() => setReplyTo(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700">
              {attachedFile && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
                  <HiPaperClip className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-slate-300 flex-1 truncate">{attachedFile.name}</span>
                  <button
                    onClick={removeAttachedFile}
                    className="p-0.5 rounded hover:bg-primary-100 dark:hover:bg-primary-800/30 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-12 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 z-50"
                    >
                      <div className="grid grid-cols-4 gap-1.5">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => insertEmoji(emoji)}
                            className="w-9 h-9 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Message ${activeDM ? getUser(activeDM)?.name || 'user' : '#' + (findChannel(activeChannel)?.name || 'channel')}`}
                    rows={1}
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button
                      ref={emojiButtonRef}
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        showEmojiPicker
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                      }`}
                    >
                      <HiEmojiHappy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <HiPaperClip className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceModal(true)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  title="Voice message"
                >
                  <HiMicrophone className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <HiPaperAirplane className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Thread Panel */}
          <AnimatePresence>
            {threadOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-l border-gray-100 dark:border-slate-700 flex-shrink-0 overflow-hidden"
              >
                <div className="w-[360px] h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <HiReply className="w-4 h-4" /> Thread
                    </h4>
                    <button onClick={() => setThreadOpen(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400">
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Original message */}
                    <div className="flex gap-3 pb-3 border-b border-gray-100 dark:border-slate-700">
                      <Avatar src={getUser(threadOpen.from)?.avatar} name={getUser(threadOpen.from)?.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{getUser(threadOpen.from)?.name}</span>
                          <span className="text-xs text-gray-400">{formatTime(threadOpen.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{threadOpen.text}</p>
                      </div>
                    </div>
                    {/* Replies */}
                    {getThreadMessages(threadOpen.id).map((reply) => {
                      const ru = getUser(reply.from);
                      return (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar src={ru?.avatar} name={ru?.name} size="xs" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">{ru?.name}</span>
                              <span className="text-xs text-gray-400">{formatTime(reply.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-slate-300 mt-0.5">{reply.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={threadInput}
                        onChange={(e) => setThreadInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleThreadReply()}
                        placeholder="Reply in thread..."
                        className="flex-1 bg-gray-100 dark:bg-slate-700/50 text-sm rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 border-0"
                      />
                      <button
                        onClick={handleThreadReply}
                        disabled={!threadInput.trim()}
                        className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <HiPaperAirplane className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-gray-100 dark:border-slate-700 flex-shrink-0 overflow-hidden"
            >
              <div className="w-72 p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Channel Details</h4>
                  <button onClick={() => setShowRightPanel(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400"><HiX className="w-4 h-4" /></button>
                </div>

                {isChannel ? (
                  <>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">About</h5>
                      <p className="text-xs text-gray-600 dark:text-slate-400">
                        {findChannel(activeChannel)?.name} channel discussions
                      </p>
                    </div>

                    {/* Members */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Members</h5>
                        <Badge size="sm">{channelMembers.length}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        {channelMembers.map((u) => (
                          <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <Avatar src={u.avatar} name={u.name} size="xs" />
                            <span className="text-xs text-gray-700 dark:text-slate-300 truncate flex-1">{u.name}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors[u.status] || 'bg-gray-400'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <HiUser className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-slate-400">Direct message details</p>
                  </div>
                )}

                {/* Pinned Messages */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pinned</h5>
                    <Badge size="sm">{pinnedMessages.length}</Badge>
                  </div>
                  {pinnedMessages.length > 0 ? (
                    <div className="space-y-2">
                      {pinnedMessages.map((msg) => (
                        <div key={msg.id} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                          <div className="flex items-center gap-1.5 mb-1">
                            <HiBookmark className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-gray-500 dark:text-slate-400">{getUser(msg.from)?.name}</span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-slate-300 line-clamp-2">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-slate-500">No pinned messages</p>
                  )}
                </div>

                {/* Shared Files */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Shared Files</h5>
                    <Badge size="sm">{voiceNotes.length}</Badge>
                  </div>
                  {voiceNotes.length > 0 ? (
                    <div className="space-y-2">
                      {voiceNotes.map((vn) => (
                        <div key={vn.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                          <HiMicrophone className="w-4 h-4 text-primary-500" />
                          <span className="text-xs text-gray-600 dark:text-slate-400 flex-1">Voice note</span>
                          <span className="text-xs text-gray-400">{formatDuration(vn.duration)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HiFolder className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 dark:text-slate-500">No files shared yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Voice Recording Modal */}
      <Modal isOpen={voiceModal} onClose={() => { if (!recording) setVoiceModal(false); }} title="Voice Message" size="sm"
        footer={
          <div className="flex gap-3 w-full justify-between">
            <Button variant="ghost" onClick={() => setVoiceModal(false)} disabled={recording}>Cancel</Button>
            {recording ? (
              <Button variant="danger" icon={HiStop} onClick={stopRecording}>
                Stop Recording ({formatDuration(recordingTime)})
              </Button>
            ) : (
              <Button variant="primary" icon={HiMicrophone} onClick={startRecording}>Start Recording</Button>
            )}
          </div>
        }
      >
        <div className="text-center py-8">
          {recording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-500">Recording</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 h-12">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, Math.random() * 32 + 8, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                    className="w-1.5 bg-primary-500 rounded-full"
                  />
                ))}
              </div>
              <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">{formatDuration(recordingTime)}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto">
                <HiMicrophone className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Record a voice message</p>
              {voiceNotes.length > 0 && (
                <p className="text-xs text-gray-400">{voiceNotes.length} previous recording{voiceNotes.length > 1 ? 's' : ''}</p>
              )}
            </div>
          )}
        </div>
      </Modal>
      {/* Create Group Chat Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Create Group Chat"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowGroupModal(false)}>Cancel</Button>
            <Button
              icon={HiPlus}
              disabled={!groupName.trim() || groupMembers.length === 0}
              onClick={() => {
                const id = `group-${Date.now()}`;
                const chat = {
                  id,
                  name: groupName.trim(),
                  kind: 'group',
                  members: [...groupMembers, currentUser?.id],
                  createdAt: new Date().toISOString(),
                };
                setGroupChats((prev) => [...prev, chat]);
                setActiveChannel(id);
                setActiveDM(null);
                setShowGroupModal(false);
                toast.success(`Group chat "${chat.name}" created`);
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Group Name" placeholder="e.g. Q3 Planning Team" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Select Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {users.filter((u) => u.id !== currentUser?.id).map((u) => (
                <label key={u.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={groupMembers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) setGroupMembers((prev) => [...prev, u.id]);
                      else setGroupMembers((prev) => prev.filter((m) => m !== u.id));
                    }}
                    className="rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                  />
                  <Avatar src={u.avatar} name={u.name} size="xs" />
                  <span className="text-sm text-gray-700 dark:text-slate-300 flex-1">{u.name}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{u.department}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}