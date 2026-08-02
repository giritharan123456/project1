import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiGlobeAlt } from 'react-icons/hi';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
];

function changeLanguage(lng) {
  localStorage.setItem('connectly-lang', lng);
  window.location.reload();
}

const LanguageSwitcher = memo(function LanguageSwitcher({ variant = 'navbar', languages }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'en';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const langs = languages || LANGUAGES;
  const current = langs.find(l => l.code === currentLang) || langs[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (variant === 'navbar') {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Switch language"
        >
          <HiGlobeAlt className="w-4 h-4" />
          <span className="hidden sm:inline">{current.native}</span>
          <HiChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-1 z-50"
            >
              {langs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    lang.code === currentLang
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{lang.native}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{lang.label}</div>
                  </div>
                  {lang.code === currentLang && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
      >
        <span className="text-base">{current.flag}</span>
        <span>{current.native}</span>
        <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 py-1 z-50"
          >
            {langs.map((lang) => (
              <button
                key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.native} <span className="text-gray-400 dark:text-slate-500">({lang.label})</span></span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

LanguageSwitcher.propTypes = {
  variant: PropTypes.oneOf(['navbar', 'settings']),
  languages: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string,
    label: PropTypes.string,
    native: PropTypes.string,
    flag: PropTypes.string,
  })),
};

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;
