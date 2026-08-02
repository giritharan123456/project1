import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { ReducedMotionProvider } from '../../context/ReducedMotionContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AppLayout from '../../components/layouts/AppLayout';
import HRDashboard from '../../pages/dashboards/HRDashboard';

window.matchMedia = window.matchMedia || ((query) => ({
  matches: false,
  media: query,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

function renderLogoutFlow() {
  localStorage.clear();
  localStorage.setItem('connectly-auth', JSON.stringify({ user: { id: 'u-hr1', name: 'HR One', email: 'hr@acme.com', role: 'hr', department: 'HR', title: 'HR Manager' }, rememberMe: true, verified: true, onboardingComplete: true }));
  const router = createMemoryRouter([
    { path: '/app', element: <ProtectedRoute><AppLayout /></ProtectedRoute>, children: [
      { path: 'dashboard/hr', element: <HRDashboard /> },
    ]},
    { path: '/auth/login', element: <div>LoginPage</div> },
    { path: '/', element: <div>LandingPage</div> },
  ], { initialEntries: ['/app/dashboard/hr'] });
  return render(
    <HelmetProvider>
      <ThemeProvider>
        <ReducedMotionProvider>
          <AuthProvider>
            <AppProvider>
              <RouterProvider router={router} />
            </AppProvider>
          </AuthProvider>
        </ReducedMotionProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

describe('LogoutSidebarRepro', () => {
  it('hides the sidebar after logout', async () => {
    renderLogoutFlow();
    expect(screen.getByRole('navigation', { name: /Main navigation/i })).toBeInTheDocument();
    expect(screen.queryByText('HR Dashboard')).not.toBeInTheDocument();
    const logoutBtn = screen.getAllByLabelText('Logout')[0];
    fireEvent.click(logoutBtn);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('navigation', { name: /Main navigation/i })).not.toBeInTheDocument();
    expect(screen.getByText('LandingPage')).toBeInTheDocument();
  });
});
