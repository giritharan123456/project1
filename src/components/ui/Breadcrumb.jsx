import { memo } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronRight, HiHome } from 'react-icons/hi';
import PropTypes from 'prop-types';

const Breadcrumb = memo(function Breadcrumb({ items = [], homePath = '/app' }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
      <Link to={homePath} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Home">
        <HiHome className="w-4 h-4" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <HiChevronRight className="w-3.5 h-3.5" />
          {item.path && i < items.length - 1 ? (
            <Link to={item.path} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
});

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
  })),
  homePath: PropTypes.string,
};

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
