import { memo } from 'react';
import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';
import PropTypes from 'prop-types';

const Timeline = memo(function Timeline({ items, className = '' }) {
  return (
    <div className={`space-y-0 ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const Icon = item.icon;
        return (
          <div key={item.id || i} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />
            )}
            <div className="relative flex-shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.completed
                    ? 'bg-primary-600 text-white'
                    : item.active
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/30'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                }`}
              >
                {item.completed ? <HiCheck className="w-5 h-5" /> : Icon ? <Icon className="w-5 h-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
              </motion.div>
            </div>
            <div className="flex-1 min-w-0 pt-1.5">
              <p className={`text-sm font-medium ${item.completed || item.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.description}</p>
              )}
              {item.time && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{item.time}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

Timeline.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    time: PropTypes.string,
    icon: PropTypes.elementType,
    completed: PropTypes.bool,
    active: PropTypes.bool,
  })).isRequired,
  className: PropTypes.string,
};

Timeline.displayName = 'Timeline';

export default Timeline;
