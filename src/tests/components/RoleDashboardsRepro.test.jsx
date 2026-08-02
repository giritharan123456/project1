import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import HostDashboard from '../../pages/dashboards/HostDashboard';
import CEODashboard from '../../pages/dashboards/CEODashboard';
import ExecutiveDashboard from '../../pages/dashboards/ExecutiveDashboard';
import HRDashboard from '../../pages/dashboards/HRDashboard';
import AdminDashboard from '../../pages/dashboards/AdminDashboard';
import EmployeeHomePage from '../../pages/employee/EmployeeHomePage';
import EmployeeDashboard from '../../pages/dashboards/EmployeeDashboard';

function setup(authUser) {
  localStorage.clear();
  localStorage.setItem('connectly-auth', JSON.stringify({ user: authUser, rememberMe: true, verified: true, onboardingComplete: true }));
}

function renderDashboard(authUser, Dashboard) {
  setup(authUser);
  return render(
    <MemoryRouter>
      <HelmetProvider>
        <AuthProvider>
          <AppProvider>
            <Dashboard />
          </AppProvider>
        </AuthProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('RoleDashboardsRepro', () => {
  it('renders the host dashboard for a logged-in host without crashing', () => {
    renderDashboard({ id: 'u-host1', name: 'Host One', email: 'host@acme.com', role: 'host', department: 'General', title: 'Host' }, HostDashboard);
    expect(screen.getByText('Top Host Tips')).toBeInTheDocument();
  });

  it('renders the CEO dashboard for a logged-in ceo without crashing', () => {
    renderDashboard({ id: 'u-ceo1', name: 'CEO One', email: 'ceo@acme.com', role: 'ceo', department: 'Executive', title: 'CEO' }, CEODashboard);
    expect(screen.getByText('Top Priorities')).toBeInTheDocument();
  });

  it('renders the executive dashboard for a logged-in executive without crashing', () => {
    renderDashboard({ id: 'u-exec1', name: 'Exec One', email: 'exec@acme.com', role: 'executive', department: 'Leadership', title: 'Executive' }, ExecutiveDashboard);
    expect(screen.getByText('Upcoming Exec Meetings')).toBeInTheDocument();
  });

  it('renders the HR dashboard for a logged-in hr without crashing', () => {
    renderDashboard({ id: 'u-hr1', name: 'HR One', email: 'hr@acme.com', role: 'hr', department: 'HR', title: 'HR Manager' }, HRDashboard);
    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
  });

  it('renders the admin dashboard for a logged-in admin without crashing', () => {
    renderDashboard({ id: 'u-admin1', name: 'Admin One', email: 'admin@acme.com', role: 'admin', department: 'Engineering', title: 'VP Engineering' }, AdminDashboard);
    expect(screen.getByText('Pending Invitations')).toBeInTheDocument();
  });

  it('renders the employee home page for a logged-in employee with non-zero KPIs', async () => {
    renderDashboard({ id: 'u-emp1', name: 'Employee One', email: 'emp@acme.com', role: 'employee', department: 'Engineering', title: 'Developer' }, EmployeeHomePage);
    expect(await screen.findByText("Today's Overview", {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.getAllByText('Meetings Today').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pending Tasks').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Unread Notifications').length).toBeGreaterThan(0);
    expect(screen.getByText('Team Online')).toBeInTheDocument();
    expect(screen.getByText("Today's Priorities")).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders the employee dashboard for a logged-in employee without crashing', async () => {
    renderDashboard({ id: 'u-emp1', name: 'Employee One', email: 'emp@acme.com', role: 'employee', department: 'Engineering', title: 'Developer' }, EmployeeDashboard);
    expect(await screen.findByText('My Priorities', {}, { timeout: 2000 })).toBeInTheDocument();
  });
});
