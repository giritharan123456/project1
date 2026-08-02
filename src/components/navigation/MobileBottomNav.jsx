import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { HiHome, HiVideoCamera, HiCalendar, HiChat, HiBell } from 'react-icons/hi';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';

const ALL_ITEMS = [
  { to: '/app', icon: HiHome, label: 'Home', roles: ['*'] },
  { to: '/app/meetings', icon: HiVideoCamera, label: 'Meetings', roles: ['*'] },
  { to: '/app/calendar', icon: HiCalendar, label: 'Calendar', roles: ['*'] },
  { to: '/app/chat', icon: HiChat, label: 'Chat', roles: ['*'] },
  { to: '/app/notifications', icon: HiBell, label: 'Alerts', roles: ['*'] },
];

const MobileBottomNav = memo(function MobileBottomNav({ unreadCount }) {
  const { user } = useAuth();
  const NAV_ITEMS = user?.role
    ? ALL_ITEMS.filter((item) => item.roles.includes('*') || item.roles.includes(user.role))
    : ALL_ITEMS;
  return (
    <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-14 h-12 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {label === 'Alerts' && unreadCount > 0 && (
                    <Badge variant="danger" size="dot" className="absolute -top-0.5 -right-0.5" />
                  )}
                </div>
                <span className="mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
});

MobileBottomNav.propTypes = {
  unreadCount: PropTypes.number,
};

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;
