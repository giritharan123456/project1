import { memo, useState, useCallback } from 'react';
import { HiFilter, HiX, HiChevronDown, HiSearch } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const AdvancedFilters = memo(function AdvancedFilters({
  filters = [],
  values = {},
  onChange,
  onClear,
  searchPlaceholder = 'Search...',
  className = '',
}) {
  const [open, setOpen] = useState(false);

  const handleChange = useCallback((key, val) => {
    onChange?.({ ...values, [key]: val });
  }, [values, onChange]);

  const activeCount = Object.values(values).filter(v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)).length;

  const renderField = (filter) => {
    const val = values[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={filter.placeholder || searchPlaceholder}
              value={val || ''}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
          </div>
        );

      case 'select':
        return (
          <div className="relative">
            <select
              value={val || ''}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 appearance-none transition-colors"
            >
              <option value="">{filter.placeholder || 'All'}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'multi-select':
        return (
          <div className="flex flex-wrap gap-1.5">
            {filter.options?.map((opt) => {
              const selected = Array.isArray(val) && val.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    const arr = Array.isArray(val) ? [...val] : [];
                    const idx = arr.indexOf(opt.value);
                    if (idx >= 0) arr.splice(idx, 1);
                    else arr.push(opt.value);
                    handleChange(filter.key, arr);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selected
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={val || ''}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
        );

      case 'date-range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={val?.start || ''}
              onChange={(e) => handleChange(filter.key, { ...(val || {}), start: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={val?.end || ''}
              onChange={(e) => handleChange(filter.key, { ...(val || {}), end: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = activeCount > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            hasActiveFilters
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-700'
          }`}
        >
          <HiFilter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-semibold">
              {activeCount}
            </span>
          )}
          <HiChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1"
          >
            <HiX className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 space-y-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  {filter.label && (
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      {filter.label}
                    </label>
                  )}
                  {renderField(filter)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(values).map(([key, val]) => {
            if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) return null;
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;
            const label = filter.label || key;
            let display = val;
            if (Array.isArray(val)) {
              display = val.map(v => filter.options?.find(o => o.value === v)?.label || v).join(', ');
            }
            if (filter.type === 'date-range') {
              display = `${val.start || '...'} - ${val.end || '...'}`;
            }
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium border border-primary-200 dark:border-primary-800"
              >
                {label}: {display}
                <button onClick={() => handleChange(key, filter.type === 'multi-select' ? [] : '')} className="hover:opacity-70 ml-0.5">
                  <HiX className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});

AdvancedFilters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['search', 'select', 'multi-select', 'date', 'date-range']).isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })),
  })),
  values: PropTypes.object,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  className: PropTypes.string,
};

AdvancedFilters.displayName = 'AdvancedFilters';

export default AdvancedFilters;
