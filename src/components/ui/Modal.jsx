import { memo, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import PropTypes from 'prop-types';
import useFocusTrap from '../../hooks/useFocusTrap';

const Modal = memo(function Modal({ isOpen, onClose, title, children, size = 'md', footer, variant = 'default', role = 'dialog', triggerRef }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  const titleId = useId();
  const contentId = useId();
  const isGlass = variant === 'glass';
  const closeButtonRef = useRef(null);
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    const trigger = triggerRef?.current;
    return () => {
      trigger?.focus();
    };
  }, [isOpen, triggerRef]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={trapRef} className="fixed inset-0 z-50 flex items-center justify-center p-4" role={role} aria-modal="true" aria-labelledby={titleId} aria-describedby={contentId} onKeyDown={handleKeyDown}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden
              ${isGlass
                ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50'
                : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700'
              }
            `}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700/50">
              <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button ref={closeButtonRef} onClick={onClose} aria-label="Close dialog" className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><HiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div id={contentId} className="p-6 overflow-y-auto max-h-[60vh]" role="document">{children}</div>
            {footer && <div className="p-6 border-t border-gray-100 dark:border-slate-700/50 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'glass']),
  role: PropTypes.oneOf(['dialog', 'alertdialog']),
  triggerRef: PropTypes.shape({ current: PropTypes.any }),
};

Modal.displayName = 'Modal';

export default Modal;
