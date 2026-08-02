import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const MegaMenu = memo(function MegaMenu({ trigger, sections = [], align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignClasses = { left: 'left-0', center: 'left-1/2 -translate-x-1/2', right: 'right-0' };

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {trigger}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full pt-2 z-50 ${alignClasses[align]}`}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-2 min-w-[600px] grid grid-cols-3 gap-1">
              {sections.map((section, i) => (
                <div key={i} className="p-2">
                  {section.title && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-3 pb-2 mb-2 border-b border-gray-100 dark:border-slate-700">
                      {section.title}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map((item, j) => (
                      <button
                        key={j}
                        onClick={() => { setOpen(false); item.onClick?.(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white transition-all group"
                      >
                        {item.icon && (
                          <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {item.icon}
                          </span>
                        )}
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{item.description}</div>
                          )}
                        </div>
                        {item.badge && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">{item.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MegaMenu.propTypes = {
  trigger: PropTypes.node.isRequired,
  sections: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      icon: PropTypes.node,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      badge: PropTypes.string,
      onClick: PropTypes.func,
    })),
  })),
  align: PropTypes.oneOf(['left', 'center', 'right']),
};

MegaMenu.displayName = 'MegaMenu';

export default MegaMenu;
