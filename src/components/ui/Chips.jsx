import { memo } from 'react';
import { HiX } from 'react-icons/hi';
import PropTypes from 'prop-types';

const Chips = memo(function Chips({ items = [], variant = 'primary', size = 'sm', removable = false, onRemove, onClick, className = '' }) {
  const variants = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    info: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    gray: 'bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600',
  };
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3 py-1.5 text-sm', lg: 'px-4 py-2 text-sm' };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((item, i) => (
        <span
          key={i}
          onClick={() => onClick?.(item)}
          className={`inline-flex items-center gap-1.5 border rounded-lg font-medium transition-all ${variants[item.variant || variant]} ${sizes[item.size || size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
        >
          {item.icon && <span className="w-3.5 h-3.5">{item.icon}</span>}
          {item.avatar && (
            <span className="w-5 h-5 rounded-full bg-primary-200 dark:bg-primary-700 text-xs flex items-center justify-center font-semibold">
              {item.avatar}
            </span>
          )}
          {item.label || item}
          {removable && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.(item, i); }}
              className="hover:opacity-70 transition-opacity ml-0.5"
              aria-label={`Remove ${item.label || item}`}
            >
              <HiX className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
});

Chips.propTypes = {
  items: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.string,
      size: PropTypes.string,
      icon: PropTypes.node,
      avatar: PropTypes.string,
    }),
  ])),
  variant: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Chips.displayName = 'Chips';

export default Chips;
