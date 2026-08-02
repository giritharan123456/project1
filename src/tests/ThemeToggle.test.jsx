import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import ThemeSwitcher from '../components/common/ThemeSwitcher';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  window.matchMedia = window.matchMedia || (() => ({ matches: false, media: '', onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} }));
});

function Probe() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="state">{isDark ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeContext + ThemeSwitcher', () => {
  it('toggles theme state and document class', () => {
    render(
      <ThemeProvider>
        <Probe />
        <ThemeSwitcher />
      </ThemeProvider>
    );
    expect(screen.getByTestId('state')).toHaveTextContent('light');
    fireEvent.click(screen.getByRole('button', { name: /switch to dark/i }));
    expect(screen.getByTestId('state')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles back to light', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('state')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
