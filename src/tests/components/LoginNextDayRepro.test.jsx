import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import { simpleHash, verifyHash } from '../../utils/hash';

function Capture({ onReady }) {
  const ctx = useAuth();
  onReady(ctx);
  return null;
}

function Wrap({ onReady }) {
  return (
    <MemoryRouter>
      <HelmetProvider>
        <AuthProvider>
          <AppProvider>
            <Capture onReady={onReady} />
          </AppProvider>
        </AuthProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

describe('LoginNextDayRepro', () => {
  it('hash is deterministic across calls', () => {
    expect(simpleHash('Password123!')).toBe(simpleHash('Password123!'));
    expect(verifyHash('Password123!', simpleHash('Password123!'))).toBe(true);
  });

  it('registered user persists and can log in again later (same localStorage)', () => {
    localStorage.clear();
    const email = 'dayuser@acme.com';
    const password = 'DayPass123!';

    let register;
    render(<Wrap onReady={(ctx) => { register = ctx.register; }} />);

    const result = register({ name: 'Day User', email, password, department: 'Engineering', role: 'employee' });
    expect(result.success).toBe(true);

    const stored = JSON.parse(localStorage.getItem('connectly-registered-users'));
    const record = stored.find((u) => u.email === email);
    expect(record).toBeTruthy();
    expect(verifyHash(password, record.password)).toBe(true);

    const users = JSON.parse(localStorage.getItem('connectly-registered-users'));
    expect(users.some((u) => u.email === email && verifyHash(password, u.password))).toBe(true);
  });

  it('login succeeds for a previously registered user with matching password', () => {
    localStorage.clear();
    const email = 'again@acme.com';
    const password = 'Again123!';

    let ctx;
    render(<Wrap onReady={(c) => { ctx = c; }} />);

    ctx.register({ name: 'Again', email, password, department: 'Sales', role: 'employee' });
    const result = ctx.login(email, password, false);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('ssoLogin preserves an existing registered user password (original credentials still work)', () => {
    localStorage.clear();
    const email = 'user@gmail.com'; // matches SSO_PROVIDERS.Google
    const password = 'OriginalPass123!';

    let ctx;
    render(<Wrap onReady={(c) => { ctx = c; }} />);

    // Day 1: user registers with their own password for the Google SSO email
    const reg = ctx.register({ name: 'Gmail User', email, password, department: 'Engineering', role: 'employee' });
    expect(reg.success).toBe(true);
    expect(ctx.login(email, password, false).success).toBe(true);

    // Day 2: user logs in via Google SSO
    const sso = ctx.ssoLogin('Google', 'employee');
    expect(sso.success).toBe(true);

    // Original password must STILL work after SSO
    const after = ctx.login(email, password, false);
    expect(after.success).toBe(true);
    expect(after.error).toBeUndefined();
  });
});
