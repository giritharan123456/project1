import { useState, useEffect } from 'react';

export default function SkipToContent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') setVisible(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <a
      href="#main-content"
      onBlur={() => setVisible(false)}
      className={`fixed top-3 left-3 z-[200] px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-primary-300 ${
        visible ? 'translate-y-0' : '-translate-y-20'
      }`}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}

SkipToContent.displayName = 'SkipToContent';
