/* oxlint-disable react/only-export-components */
import { createContext, useContext } from 'react';
import { useReducedMotion as useReducedMotionHook } from '../hooks/useReducedMotion';

const ReducedMotionContext = createContext(false);

function userPrefersReducedMotion() {
  try {
    const stored = JSON.parse(localStorage.getItem('connectly-platform-settings'));
    if (stored && stored.animations === false) return true;
  } catch {}
  return false;
}

export function ReducedMotionProvider({ children }) {
  const prefersReducedMotion = useReducedMotionHook() || userPrefersReducedMotion();
  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}
