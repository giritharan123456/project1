import { memo } from 'react';
import PropTypes from 'prop-types';

const AvatarGroup = memo(function AvatarGroup({ avatars = [], max = 4, size = 'md', overlap = true, onOverflowClick }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg', xl: 'w-16 h-16 text-xl' };
  const overlapClasses = { xs: '-ml-1.5', sm: '-ml-2', md: '-ml-2.5', lg: '-ml-3', xl: '-ml-4' };
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center">
      {visible.map((avatar, i) => (
        <div
          key={i}
          className={`${sizes[size]} ${i > 0 && overlap ? overlapClasses[size] : ''} rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shrink-0 overflow-hidden`}
          title={avatar.name}
        >
          {avatar.src ? (
            <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(avatar.name)
          )}
        </div>
      ))}
      {overflow > 0 && (
        <button
          onClick={onOverflowClick}
          className={`${sizes[size]} ${overlap ? overlapClasses[size] : ''} rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shrink-0 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors`}
        >
          +{overflow}
        </button>
      )}
    </div>
  );
});

AvatarGroup.propTypes = {
  avatars: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string,
    name: PropTypes.string,
  })),
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  overlap: PropTypes.bool,
  onOverflowClick: PropTypes.func,
};

AvatarGroup.displayName = 'AvatarGroup';

export default AvatarGroup;
