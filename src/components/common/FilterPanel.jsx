import { memo } from 'react';
import { HiXMark } from 'react-icons/hi2';
import PropTypes from 'prop-types';

const FilterPanel = memo(function FilterPanel({ filters = [], onRemove, onClear, className = '' }) {
  if (!filters.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((filter, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm rounded-lg border border-primary-200 dark:border-primary-800"
        >
          {filter.label && <span className="font-medium">{filter.label}:</span>}
          <span>{filter.value}</span>
          {onRemove && (
            <button onClick={() => onRemove(filter.key || i)} className="hover:text-primary-900 dark:hover:text-primary-100">
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </span>
      ))}
      {onClear && filters.length > 1 && (
        <button onClick={onClear} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 ml-1">
          Clear all
        </button>
      )}
    </div>
  );
});

FilterPanel.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    value: PropTypes.string,
  })),
  onRemove: PropTypes.func,
  onClear: PropTypes.func,
  className: PropTypes.string,
};

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
