import { memo } from 'react';

const HRSectionTabs = memo(function HRSectionTabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 -mb-1 ${className}`}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-selected={isActive}
            role="tab"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
});

HRSectionTabs.displayName = 'HRSectionTabs';

export default HRSectionTabs;
