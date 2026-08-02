import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import PropTypes from 'prop-types';

const BottomSheet = memo(function BottomSheet({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-h-[85vh] bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-600 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <HiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

BottomSheet.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
};

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
