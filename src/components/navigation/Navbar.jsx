import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiSearch, HiQuestionMarkCircle, HiCog, HiUser, HiLogout, HiX, HiLightningBolt, HiDocumentText, HiMail, HiXCircle } from 'react-icons/hi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ThemeSwitcher from '../common/ThemeSwitcher';
import NotificationCenter from '../common/NotificationCenter';
import CommandPalette from '../meeting/CommandPalette';

const keyboardShortcuts = [
  { keys: 'Ctrl / Cmd + K', action: 'Open command palette' },
  { keys: 'Esc', action: 'Close dialogs and menus' },
  { keys: 'Ctrl / Cmd + S', action: 'Save the current document' },
];

const Navbar = memo(function Navbar() {
  const { sidebarOpen, setSidebarOpen, userNotifications, unreadNotifications, markAllNotificationsRead } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const submitMobileSearch = (e) => {
    e.preventDefault();
    if (!mobileSearchQuery.trim()) return;
    setShowSearch(false);
    setMobileSearchQuery('');
    navigate(`/app/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
  };

  return (
    <header role="banner" className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <HiMenu className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <button onClick={() => setShowSearch(!showSearch)} aria-label="Toggle search" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors lg:hidden">
            <HiSearch className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
          <div className="hidden lg:flex items-center ml-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="w-80 pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700/50 border-0 rounded-xl text-sm text-left text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-text hover:bg-gray-200 dark:hover:bg-slate-600/50 transition-colors"
              >
                Search meetings, messages, files...
              </button>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">⌘K</span>
            </div>
          </div>
        </div>

        <nav role="navigation" aria-label="Quick actions" className="flex items-center gap-1">
          <ThemeSwitcher />
          <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} />

          <button aria-label="Help" onClick={() => setShowHelp(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <HiQuestionMarkCircle className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>

          <div className="relative ml-2">
            <button onClick={() => setShowProfile(!showProfile)} aria-label="User menu" aria-expanded={showProfile} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <Avatar src={user?.avatar} name={user?.name} size="sm" status="online" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Avatar src={user?.avatar} name={user?.name} size="lg" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
                        <Badge variant="success" size="sm" dot>Online</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: HiUser, label: 'Profile', path: '/app/profile' },
                      { icon: HiCog, label: 'Settings', path: '/app/settings' },
                    ].map((item, i) => (
                      <Link key={i} to={item.path || '#'} onClick={item.onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-slate-700">
                    <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors">
                      <HiLogout className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-100 dark:border-slate-700 p-3">
            <form onSubmit={submitMobileSearch} className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={mobileSearchQuery} onChange={(e) => setMobileSearchQuery(e.target.value)} placeholder="Search meetings, messages, files..." className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-slate-700/50 border-0 rounded-xl text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" autoFocus />
              <button type="button" onClick={() => setShowSearch(false)} className="absolute right-3 top-1/2 -translate-y-1/2"><HiX className="w-4 h-4 text-gray-400" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Help & Support" size="sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><HiLightningBolt className="w-4 h-4 text-amber-500" /> Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {keyboardShortcuts.map((s) => (
                <div key={s.action} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/30 text-sm">
                  <span className="text-gray-600 dark:text-slate-300">{s.action}</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-slate-600 text-xs font-mono text-gray-700 dark:text-slate-200">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><HiDocumentText className="w-4 h-4 text-primary-500" /> Resources</h3>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => { setShowHelp(false); navigate('/app/meeting-notes'); }} className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-left text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <HiDocumentText className="w-4 h-4 text-primary-500" /> Read the Documentation
              </button>
              <button onClick={() => { setShowHelp(false); navigate('/contact'); }} className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-left text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <HiMail className="w-4 h-4 text-emerald-500" /> Contact Support
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
          <Button size="sm" variant="secondary" icon={HiXCircle} onClick={() => setShowHelp(false)}>Close</Button>
        </div>
      </Modal>
    </header>
  );
});

Navbar.propTypes = {};

Navbar.displayName = 'Navbar';

export default Navbar;
