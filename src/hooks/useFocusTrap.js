import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useFocusTrap(isActive) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;
    const container = ref.current;
    const prevFocus = document.activeElement;

    const focusable = container.querySelectorAll(FOCUSABLE);
    if (focusable.length) focusable[0].focus();

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      const els = container.querySelectorAll(FOCUSABLE);
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (prevFocus?.focus) prevFocus.focus();
    };
  }, [isActive]);

  return ref;
}
