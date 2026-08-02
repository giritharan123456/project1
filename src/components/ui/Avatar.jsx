import { memo } from 'react';
import PropTypes from 'prop-types';

const Avatar = memo(function Avatar({ src, name, size = 'md', status, className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg', xl: 'w-16 h-16 text-xl', '2xl': 'w-20 h-20 text-2xl' };
  const statusSizes = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-3.5 h-3.5', '2xl': 'w-4 h-4' };
  const statusColors = { online: 'bg-emerald-500', away: 'bg-amber-500', offline: 'bg-gray-400', busy: 'bg-red-500' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-800 ${statusColors[status]} ${statusSizes[size]}`} />
      )}
    </div>
  );
});

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  status: PropTypes.oneOf(['online', 'away', 'offline', 'busy']),
  className: PropTypes.string,
};

Avatar.displayName = 'Avatar';

export default Avatar;
