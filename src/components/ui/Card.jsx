import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const variantStyles = {
  default: 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm',
  glass: 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-black/5',
  elevated: 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20',
  gradient: 'bg-gradient-to-br from-white to-primary-50 dark:from-slate-800 dark:to-primary-900/20 border border-primary-100 dark:border-primary-900/30 shadow-lg shadow-primary-500/10',
};

const Card = memo(function Card({ children, className = '', padding = true, hover = false, onClick, variant = 'default' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`
        rounded-2xl transition-all duration-300
        ${variantStyles[variant] || variantStyles.default}
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-lg hover:shadow-primary-500/5 hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  padding: PropTypes.bool,
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'glass', 'elevated', 'gradient']),
};

Card.displayName = 'Card';

export default Card;
