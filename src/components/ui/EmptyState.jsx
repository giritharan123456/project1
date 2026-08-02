import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const EmptyState = memo(function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800">
          <Icon className="w-12 h-12 text-gray-300 dark:text-slate-600" />
        </div>
      )}
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
      {description && <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
});

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
