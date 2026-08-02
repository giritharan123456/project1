import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiVideoCamera, HiCalendar, HiChat, HiFolder, HiCollection, HiChartBar, HiCog, HiUserGroup, HiMicrophone, HiDesktopComputer, HiHand, HiAnnotation } from 'react-icons/hi';
import PropTypes from 'prop-types';

const actions = [
  { id: 'new-meeting', label: 'New Meeting', icon: HiVideoCamera, shortcut: 'Ctrl+N', path: '/app/meetings' },
  { id: 'join-meeting', label: 'Join Meeting', icon: HiVideoCamera, shortcut: 'Ctrl+J', path: '/app/meetings' },
  { id: 'schedule', label: 'Schedule Meeting', icon: HiCalendar, shortcut: 'Ctrl+Shift+N', path: '/app/calendar' },
  { id: 'chat', label: 'Open Chat', icon: HiChat, shortcut: 'Ctrl+Shift+C', path: '/app/chat' },
  { id: 'files', label: 'Open Files', icon: HiFolder, shortcut: 'Ctrl+Shift+F', path: '/app/files' },
  { id: 'recordings', label: 'View Recordings', icon: HiCollection, shortcut: 'Ctrl+Shift+R', path: '/app/recordings' },
  { id: 'analytics', label: 'Open Analytics', icon: HiChartBar, shortcut: 'Ctrl+Shift+A', path: '/app/analytics' },
  { id: 'settings', label: 'Open Settings', icon: HiCog, shortcut: 'Ctrl+,', path: '/app/settings' },
  { id: 'team', label: 'Team Directory', icon: HiUserGroup, shortcut: 'Ctrl+Shift+T', path: '/app/team' },
  { id: 'mute', label: 'Toggle Mute', icon: HiMicrophone, shortcut: 'Ctrl+D', actionId: 'mute' },
  { id: 'screen-share', label: 'Share Screen', icon: HiDesktopComputer, shortcut: 'Ctrl+Shift+S', actionId: 'screen-share' },
  { id: 'raise-hand', label: 'Raise Hand', icon: HiHand, shortcut: 'Ctrl+Shift+H', actionId: 'raise-hand' },
  { id: 'captions', label: 'Toggle Captions', icon: HiAnnotation, shortcut: 'Ctrl+Shift+L', actionId: 'captions' },
];

const CommandPalette = memo(function CommandPalette({ isOpen, onClose, inMeeting, onMeetingAction }) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase()))
    : inMeeting ? actions : actions.filter(a => a.path);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const execute = (action) => {
    onClose();
    if (action.actionId && onMeetingAction) {
      onMeetingAction(action.actionId);
    } else if (action.path) {
      navigate(action.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIdx]) { execute(filtered[selectedIdx]); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <HiSearch className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search actions..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">ESC</span>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8">
                  <HiSearch className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No results for "{query}"</p>
                </div>
              ) : (
                filtered.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => execute(action)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        i === selectedIdx
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">{action.shortcut}</kbd>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

CommandPalette.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  inMeeting: PropTypes.bool,
  onMeetingAction: PropTypes.func,
};

CommandPalette.displayName = 'CommandPalette';

export default CommandPalette;
