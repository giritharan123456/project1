import { memo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Tabs = memo(function Tabs({ tabs, defaultTab = 0, onChange, className = '' }) {
  const [active, setActive] = useState(defaultTab);
  const tablistRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const next = (active + direction + tabs.length) % tabs.length;
      setActive(next);
      onChange?.(next, tabs[next]?.key);
    }
  };

  return (
    <div className={className}>
      <div ref={tablistRef} role="tablist" onKeyDown={handleKeyDown} className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            onClick={() => { setActive(i); onChange?.(i, tab.key); }}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active === i ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'}`}>
            {active === i && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-slate-600 rounded-lg shadow-sm" />}
            <span className="relative z-10 flex items-center gap-2">{tab.icon}{tab.label}</span>
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="mt-4"
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
});

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    key: PropTypes.string,
    icon: PropTypes.elementType,
    content: PropTypes.node,
  })).isRequired,
  defaultTab: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  className: PropTypes.string,
};

Tabs.displayName = 'Tabs';

export default Tabs;
