import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const Dropdown = memo(function Dropdown({ trigger, items, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
    if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const menuItems = ref.current?.querySelectorAll('[role="menuitem"]');
      if (!menuItems?.length) return;
      const currentIndex = Array.from(menuItems).indexOf(document.activeElement);
      const nextIndex = e.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, menuItems.length - 1)
        : Math.max(currentIndex - 1, 0);
      menuItems[nextIndex]?.focus();
    }
  };

  return (
    <div ref={ref} className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      <div
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className={`absolute z-50 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 py-1 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {items.map((item, i) => {
              if (item.divider) {
                return <div key={i} role="separator" className="my-1 border-t border-gray-100 dark:border-slate-700" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  role="menuitem"
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    item.disabled
                      ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
                      : item.destructive
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${item.destructive ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`} />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.elementType,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    destructive: PropTypes.bool,
    divider: PropTypes.bool,
  })).isRequired,
  align: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
