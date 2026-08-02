import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import PropTypes from 'prop-types';

const Accordion = memo(function Accordion({ items, allowMultiple = false, className = '' }) {
  const [openItems, setOpenItems] = useState([]);

  const toggle = (id) => {
    if (allowMultiple) {
      setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setOpenItems(prev => prev.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className={`divide-y divide-gray-100 dark:divide-slate-700 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/30 rounded-lg"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <HiChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 text-sm text-gray-600 dark:text-slate-400">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
});

Accordion.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
  })).isRequired,
  allowMultiple: PropTypes.bool,
  className: PropTypes.string,
};

Accordion.displayName = 'Accordion';

export default Accordion;
