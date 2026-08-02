import { memo } from 'react';
import PropTypes from 'prop-types';
import { HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitcher = memo(function ThemeSwitcher({ variant = 'navbar', className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 w-full transition-all ${className}`}
      >
        {isDark ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5" />}
        <span>Toggle Theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${className}`}
    >
      {isDark ? <HiSun className="w-5 h-5 text-amber-400" /> : <HiMoon className="w-5 h-5 text-gray-600" />}
    </button>
  );
});

ThemeSwitcher.propTypes = {
  variant: PropTypes.oneOf(['navbar', 'sidebar']),
  className: PropTypes.string,
};

ThemeSwitcher.displayName = 'ThemeSwitcher';

export default ThemeSwitcher;
