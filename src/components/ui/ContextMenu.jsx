import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const ContextMenu = memo(function ContextMenu({ items = [], children, className = '' }) {
  const [state, setState] = useState({ show: false, x: 0, y: 0 });
  const ref = useRef(null);

  const handleContext = useCallback((e) => {
    e.preventDefault();
    setState({ show: true, x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setState(s => ({ ...s, show: false }));
    };
    const close = () => setState(s => ({ ...s, show: false }));
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('scroll', close, true); };
  }, []);

  return (
    <div ref={ref} onContextMenu={handleContext} className={className}>
      {children}
      <AnimatePresence>
        {state.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            style={{ left: state.x, top: state.y, position: 'fixed' }}
            className="z-[100] min-w-[180px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-1.5"
            role="menu"
          >
            {items.map((item, i) => (
              item.separator ? (
                <div key={i} className="my-1 border-t border-gray-100 dark:border-slate-700" />
              ) : (
                <button
                  key={i}
                  onClick={() => { item.onClick?.(); setState(s => ({ ...s, show: false })); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    item.danger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && <span className="text-xs text-gray-400 dark:text-slate-500">{item.shortcut}</span>}
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ContextMenu.propTypes = {
  id: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.node,
    onClick: PropTypes.func,
    shortcut: PropTypes.string,
    danger: PropTypes.bool,
    disabled: PropTypes.bool,
    separator: PropTypes.bool,
  })),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
