import { useState, useEffect, useCallback, useRef } from 'react';

export function useAnnouncer() {
  const announcerRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.padding = '0';
      announcer.style.margin = '-1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.whiteSpace = 'nowrap';
      announcer.style.border = '0';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }
    announcerRef.current.textContent = '';
    announcerRef.current.setAttribute('aria-live', priority);
    announcerRef.current.textContent = message;
  }, []);

  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive');
  }, [announce]);

  return { announce, announceAssertive };
}

export function useFocusTrap() {
  const containerRef = useRef(null);

  const trapFocus = useCallback(() => {
    if (!containerRef.current) return;
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => containerRef.current?.removeEventListener('keydown', handleTab);
  }, []);

  return { containerRef, trapFocus };
}

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      for (const [key, { ctrl, shift, alt, meta, action }] of Object.entries(shortcuts)) {
        const match =
          e.key.toLowerCase() === key.toLowerCase() &&
          !!e.ctrlKey === !!ctrl &&
          !!e.shiftKey === !!shift &&
          !!e.altKey === !!alt &&
          !!e.metaKey === !!meta;
        if (match) {
          e.preventDefault();
          action(e);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

export function useSkipLink() {
  const skipLinkRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        e.preventDefault();
        skipLinkRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return skipLinkRef;
}