import { memo, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import SkipToContent from '../common/SkipToContent';
import Sidebar from '../navigation/Sidebar';
import Navbar from '../navigation/Navbar';
import Breadcrumb from '../ui/Breadcrumb';
import MobileBottomNav from '../navigation/MobileBottomNav';
import RouteLoadingBar from '../ui/RouteLoadingBar';
import { useApp } from '../../context/AppContext';
import useMeetingReminders from '../../hooks/useMeetingReminders';

const breadcrumbMap = {
  '/app': { label: 'Dashboard' },
  '/app/meetings': { label: 'Meetings' },
  '/app/calendar': { label: 'Calendar' },
  '/app/chat': { label: 'Chat' },
  '/app/files': { label: 'Files' },
  '/app/recordings': { label: 'Recordings' },
  '/app/analytics': { label: 'Analytics' },
  '/app/reports': { label: 'Reports' },
  '/app/notifications': { label: 'Notifications' },
  '/app/security': { label: 'Security' },
  '/app/settings': { label: 'Settings' },
  '/app/team': { label: 'Team Directory' },
};

const AppLayout = memo(function AppLayout() {
  const { sidebarOpen, inMeeting, unreadNotifications } = useApp();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const mainRef = useRef(null);

  useMeetingReminders();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
      const ann = document.getElementById('announcements');
      if (ann) {
        ann.textContent = '';
        requestAnimationFrame(() => {
          ann.textContent = `Navigated to ${breadcrumbMap[location.pathname]?.label || 'page'}`;
        });
      }
    }
  }, [location.pathname]);

  if (inMeeting) return <Outlet />;

  const currentCrumb = breadcrumbMap[location.pathname];
  const breadcrumbItems = currentCrumb ? [currentCrumb] : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <RouteLoadingBar />
      <SkipToContent />
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-[72px]'} pb-16 lg:pb-0`}>
        <Navbar />
        <main id="main-content" ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-6 focus:outline-none" tabIndex={-1} aria-label="Main content">
          <nav aria-label="Breadcrumb" className="mb-4">
            {breadcrumbItems.length > 0 && (
              <Breadcrumb items={breadcrumbItems} />
            )}
          </nav>
          <motion.div
            role="region"
            aria-label="Page content"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <MobileBottomNav unreadCount={unreadNotifications} />
    </div>
  );
});

AppLayout.propTypes = {};

AppLayout.displayName = 'AppLayout';

export default AppLayout;
