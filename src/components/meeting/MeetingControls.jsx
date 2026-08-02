import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiMicrophone, HiVideoCamera, HiDesktopComputer, HiChat,
  HiUsers, HiHand, HiEmojiHappy, HiPencilAlt, HiCollection,
  HiViewGrid, HiDotsVertical, HiArrowsExpand, HiShieldCheck,
  HiTemplate, HiSupport, HiViewList, HiFolder, HiDocumentText,
  HiAdjustments, HiSparkles,
} from 'react-icons/hi';
import PropTypes from 'prop-types';

const REACTIONS = [
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '👏', label: 'Clap' },
];

const PANEL_ITEMS = [
  { label: 'Host Controls', icon: HiShieldCheck, panel: 'host' },
  { label: 'Polls', icon: HiTemplate, panel: 'polls' },
  { label: 'Breakout Rooms', icon: HiSupport, panel: 'breakout' },
  { label: 'Captions', icon: HiViewList, panel: 'captions' },
  { label: 'Voice Commands', icon: HiMicrophone, panel: 'voice' },
  { label: 'AI Summary', icon: HiSparkles, panel: 'summary' },
  { label: 'Whiteboard', icon: HiPencilAlt, panel: 'whiteboard' },
  { label: 'File Sharing', icon: HiFolder, panel: 'files' },
  { label: 'Meeting Notes', icon: HiDocumentText, panel: 'notes' },
  { label: 'Settings', icon: HiAdjustments },
];

function MeetingControls({
  muted, setMuted, cameraOff, setCameraOff, screenSharing, setScreenSharing,
  chatOpen, setChatOpen, participantsOpen, setParticipantsOpen, handRaised, setHandRaised,
  activePanel, setActivePanel, showMoreMenu, setShowMoreMenu,
  speakerView, setSpeakerView, recording, setRecording,
  togglePanel, toggleFullscreen, handleReaction, setShowEndCallDialog,
}) {
  return (
    <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 overflow-x-auto scrollbar-thin">
      <button
        onClick={() => setMuted(!muted)}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${muted ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
      >
        <HiMicrophone className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => setCameraOff(!cameraOff)}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${cameraOff ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        aria-label={cameraOff ? 'Turn camera on' : 'Turn camera off'}
      >
        <HiVideoCamera className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => { setScreenSharing(prev => !prev); if (!screenSharing) { /* will be handled in parent */ } }}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${screenSharing ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title="Share Screen"
        aria-label={screenSharing ? 'Stop sharing screen' : 'Share screen'}
      >
        <HiDesktopComputer className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false); setActivePanel(null); }}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${chatOpen ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title="Chat"
        aria-label={chatOpen ? 'Close chat' : 'Open chat'}
      >
        <HiChat className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false); setActivePanel(null); }}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${participantsOpen ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title="Participants"
        aria-label={participantsOpen ? 'Close participants panel' : 'Open participants panel'}
      >
        <HiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => setHandRaised(!handRaised)}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${handRaised ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title={handRaised ? 'Lower Hand' : 'Raise Hand'}
        aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
      >
        <HiHand className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <ReactionButton reactions={REACTIONS} onReact={handleReaction} />

      <button
        onClick={() => togglePanel('whiteboard')}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${activePanel === 'whiteboard' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title="Whiteboard"
      >
        <HiPencilAlt className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => { setRecording(prev => !prev); if (!recording) toast.success('Recording started'); }}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${recording ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title={recording ? 'Stop Recording' : 'Record'}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
      >
        <HiCollection className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={() => setSpeakerView(!speakerView)}
        className={`p-2 sm:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${speakerView ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        title={speakerView ? 'Grid View' : 'Speaker View'}
        aria-label={speakerView ? 'Switch to grid view' : 'Switch to speaker view'}
      >
        <HiViewGrid className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

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
        {showMoreMenu && (
          <div className="absolute bottom-full right-0 mb-2 w-52 sm:w-56 bg-gray-800 rounded-xl border border-gray-700 shadow-xl py-1 z-40">
            {PANEL_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  if (item.panel) togglePanel(item.panel);
                  item.onClick?.();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-700 my-1" />
            <button
              onClick={() => { toggleFullscreen(); setShowMoreMenu(false); }}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <HiArrowsExpand className="w-4 h-4 flex-shrink-0" />
              Fullscreen
            </button>
            <div className="border-t border-gray-700 my-1" />
            <button
              onClick={() => { setShowMoreMenu(false); setShowEndCallDialog(true); }}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
            >
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

MeetingControls.propTypes = {
  muted: PropTypes.bool,
  setMuted: PropTypes.func,
  cameraOff: PropTypes.bool,
  setCameraOff: PropTypes.func,
  screenSharing: PropTypes.bool,
  setScreenSharing: PropTypes.func,
  chatOpen: PropTypes.bool,
  setChatOpen: PropTypes.func,
  participantsOpen: PropTypes.bool,
  setParticipantsOpen: PropTypes.func,
  handRaised: PropTypes.bool,
  setHandRaised: PropTypes.func,
  activePanel: PropTypes.string,
  setActivePanel: PropTypes.func,
  showMoreMenu: PropTypes.bool,
  setShowMoreMenu: PropTypes.func,
  setCommandPaletteOpen: PropTypes.func,
  fullscreen: PropTypes.bool,
  setFullscreen: PropTypes.func,
  speakerView: PropTypes.bool,
  setSpeakerView: PropTypes.func,
  recording: PropTypes.bool,
  setRecording: PropTypes.func,
  togglePanel: PropTypes.func,
  toggleFullscreen: PropTypes.func,
  handleReaction: PropTypes.func,
};

MeetingControls.displayName = 'MeetingControls';

function ReactionButton({ reactions, onReact }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative group flex-shrink-0">
      <button
        className="p-2 sm:p-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
        title="Reactions"
        aria-label="Send reaction"
        onClick={() => setOpen(!open)}
      >
        <HiEmojiHappy className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 p-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => { onReact(r.emoji); setOpen(false); }}
              className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors text-lg sm:text-xl"
              title={r.label}
              aria-label={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

ReactionButton.propTypes = {
  reactions: PropTypes.arrayOf(PropTypes.shape({ emoji: PropTypes.string, label: PropTypes.string })),
  onReact: PropTypes.func,
};

ReactionButton.displayName = 'ReactionButton';

export { MeetingControls, ReactionButton };