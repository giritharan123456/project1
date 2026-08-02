import { memo, useState, useRef, useCallback, useEffect } from 'react';
import { HiSearch, HiX, HiClock, HiTrendingUp } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const SearchBar = memo(function SearchBar({
  value = '', onChange, placeholder = 'Search...', className = '', onClear,
  recentSearches = [], suggestions = [], showHistory = true, onSuggestionClick,
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const handleClear = useCallback(() => { onChange?.(''); onClear?.(); }, [onChange, onClear]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showDropdown = focused && value && (suggestions.length > 0 || (showHistory && recentSearches.length > 0));

  return (
    <div ref={ref} className={`relative ${className}`}>
      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        aria-label={placeholder}
        role="searchbox"
        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
          aria-label="Clear search"
        >
          <HiX className="w-4 h-4" />
        </button>
      )}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { onChange?.(s); onSuggestionClick?.(s); setFocused(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <HiTrendingUp className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{s}</span>
              </button>
            ))}
            {showHistory && recentSearches.length > 0 && (
              <>
                <div className="px-4 py-1.5 text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <HiClock className="w-3 h-3" />
                  Recent
                </div>
                {recentSearches.slice(0, 5).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { onChange?.(s); onSuggestionClick?.(s); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <HiClock className="w-4 h-4 text-gray-300 shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  onClear: PropTypes.func,
  recentSearches: PropTypes.arrayOf(PropTypes.string),
  suggestions: PropTypes.arrayOf(PropTypes.string),
  showHistory: PropTypes.bool,
  onSuggestionClick: PropTypes.func,
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
