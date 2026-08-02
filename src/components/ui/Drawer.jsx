import { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import PropTypes from 'prop-types';

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const Drawer = memo(function Drawer({ isOpen, onClose, title, children, side = 'right', size = 'md' }) {
  const drawerRef = useRef(null);
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'max-w-2xl' };
  const sideOffset = side === 'left' ? { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } } : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const previouslyFocused = document.activeElement;

    const focusableElements = drawer.querySelectorAll(focusableSelector);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const elements = drawer.querySelectorAll(focusableSelector);
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleKeyDown);
    return () => {
      drawer.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={drawerRef} className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={sideOffset.initial}
            animate={sideOffset.animate}
            exit={sideOffset.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`absolute ${side === 'left' ? 'left-0' : 'right-0'} top-0 h-full ${widths[size]} w-full bg-white dark:bg-slate-800 shadow-2xl border-l border-gray-100 dark:border-slate-700 flex flex-col`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button onClick={onClose} aria-label="Close drawer" className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <HiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  side: PropTypes.oneOf(['left', 'right']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
};

Drawer.displayName = 'Drawer';

export default Drawer;
