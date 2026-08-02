import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import ChatPage from '../../pages/chat/ChatPage';

function setup(authUser, registeredUsers, messages) {
  localStorage.clear();
  localStorage.setItem('connectly-auth', JSON.stringify({ user: authUser, rememberMe: true, verified: true, onboardingComplete: true }));
  if (registeredUsers) localStorage.setItem('connectly-registered-users', JSON.stringify(registeredUsers));
  if (messages) localStorage.setItem('connectly-messages', JSON.stringify(messages));
}

describe('ChatRepro', () => {
  it('renders chat for a freshly registered user without crashing', () => {
    const authUser = { id: 'u9999', name: 'John Doe', email: 'john@acme.com', role: 'employee', department: 'Engineering', title: 'Dev' };
    setup(authUser, [authUser], [
      { id: 'm1', from: 'u2', to: 'general', text: 'hello team', timestamp: new Date().toISOString(), type: 'channel', read: true, pinned: false, replyTo: null },
      { id: 'm2', from: 'u9999', to: 'general', text: 'hi from john', timestamp: new Date().toISOString(), type: 'channel', read: true, pinned: false, replyTo: null },
    ]);
    render(
      <MemoryRouter>
        <HelmetProvider>
          <AuthProvider>
            <AppProvider>
              <ChatPage />
            </AppProvider>
          </AuthProvider>
        </HelmetProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('hello team')).toBeInTheDocument();
    expect(screen.getByText('hi from john')).toBeInTheDocument();
  });
});
