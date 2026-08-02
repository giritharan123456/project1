import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider, SEED_DATA_VERSION } from '../../context/AppContext';
import MeetingRoom from '../../pages/meeting/MeetingRoom';

function setup() {
  localStorage.clear();
  localStorage.setItem('connectly-seed-version', SEED_DATA_VERSION);
  localStorage.setItem('connectly-auth', JSON.stringify({ user: { id: 'u7', name: 'Michael Brown', email: 'michael@acme.com', role: 'employee' }, rememberMe: true, verified: true, onboardingComplete: true }));
  localStorage.setItem('connectly-meetings', JSON.stringify([
    {
      id: 'm9999',
      title: 'Meeting 3:30 PM',
      type: 'instant',
      date: '2026-07-31',
      time: '3:30 PM',
      duration: 0,
      host: 'u7',
      hostRole: 'employee',
      participants: [],
      status: 'live',
      password: '',
      recording: false,
      description: 'Instant meeting',
      meetingId: 'con-test1234',
      joinUrl: 'https://connectly.com/join/con-test1234',
    },
  ]));
}

describe('MeetingRoomRepro', () => {
  it('renders meeting room for a fresh instant meeting without crashing', () => {
    setup();
    render(
      <HelmetProvider>
        <AuthProvider>
          <AppProvider>
            <MemoryRouter initialEntries={['/app/meeting/room/m9999']}>
              <Routes>
                <Route path="/app/meeting/room/:id" element={<MeetingRoom />} />
              </Routes>
            </MemoryRouter>
          </AppProvider>
        </AuthProvider>
      </HelmetProvider>
    );
    expect(screen.getByText(/Meeting 3:30 PM/)).toBeInTheDocument();
  });
});
