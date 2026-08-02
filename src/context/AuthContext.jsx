/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import usersData from '../data/users.json';
import { simpleHash, verifyHash } from '../utils/hash';

const ROLE_DASHBOARD_MAP = {
  employee: '/app/dashboard/employee',
  host: '/app/dashboard/host',
  admin: '/app/dashboard/admin',
  hr: '/app/dashboard/hr',
  manager: '/app/dashboard/manager',
  executive: '/app/dashboard/executive',
  ceo: '/app/dashboard/ceo',
};

export const SSO_PROVIDERS = {
  Google: { email: 'user@gmail.com', label: 'Google' },
  GitHub: { email: 'user@github.com', label: 'GitHub' },
  Microsoft: { email: 'user@outlook.com', label: 'Microsoft' },
  Okta: { email: 'user@okta.com', label: 'Okta' },
  'Azure AD': { email: 'user@azure.com', label: 'Azure AD' },
  'SAML SSO': { email: 'user@enterprise.com', label: 'SAML SSO' },
  PingOne: { email: 'user@pingone.com', label: 'PingOne' },
  OneLogin: { email: 'user@onelogin.com', label: 'OneLogin' },
  Auth0: { email: 'user@auth0.com', label: 'Auth0' },
  'Network SSO': { email: 'user@corpnet.com', label: 'Network SSO' },
};

function loadPersistedAuth() {
  try {
    const stored = localStorage.getItem('connectly-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.user) {
        return parsed.user;
      }
    }
  } catch {}
  return null;
}

function isVerified() {
  try {
    const stored = localStorage.getItem('connectly-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return !!parsed.verified;
    }
  } catch {}
  return false;
}

const AuthContext = createContext();

function notifyAuthChanged() {
  try {
    window.dispatchEvent(new Event('connectly-auth-changed'));
  } catch {
    // noop
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadPersistedAuth);
  const [isAuthenticated, setIsAuthenticated] = useState(!!loadPersistedAuth());
  const [isVerifiedState, setIsVerifiedState] = useState(isVerified);

  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem('connectly-auth');
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem('connectly-auth', JSON.stringify({ ...parsed, user, rememberMe: true, verified: isVerifiedState }));
      } catch {
        localStorage.setItem('connectly-auth', JSON.stringify({ user, rememberMe: true, verified: isVerifiedState }));
      }
    }
  }, [user, isVerifiedState]);

  const login = useCallback((email, password, rememberMe = false) => {
    // Check static users.json first (these users don't require password verification for demo)
    let found = usersData.find(u => u.email === email);

    // If not found in static data, check localStorage for newly registered users
    if (!found) {
      try {
        const registeredUsers = localStorage.getItem('connectly-registered-users');
        if (registeredUsers) {
          const users = JSON.parse(registeredUsers);
          found = users.find(u => u.email === email && verifyHash(password, u.password));
          if (found) {
            // Enforce email verification (admin approval is informational only and does not block login)
            if (found.verified !== true) {
              return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
            }
          }
        }
      } catch (e) {
        console.error('Error reading registered users:', e);
      }
    }

    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      setIsVerifiedState(false); // Must pass OTP + 2FA
      if (rememberMe) {
        localStorage.setItem('connectly-auth', JSON.stringify({ user: found, rememberMe: true, verified: false, onboardingComplete: true }));
      } else {
        localStorage.setItem('connectly-auth', JSON.stringify({ user: found, rememberMe: false, verified: false, onboardingComplete: true }));
      }
      notifyAuthChanged();
      return { success: true, user: found, redirect: '/auth/otp-verification' };
    }
    return { success: false, error: 'Invalid credentials' };
  }, []);

  const verify2FA = useCallback(() => {
    setIsVerifiedState(true);
    const stored = localStorage.getItem('connectly-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.verified = true;
      localStorage.setItem('connectly-auth', JSON.stringify(parsed));
    }
    notifyAuthChanged();
  }, []);

  const verifyEmail = useCallback((email) => {
    try {
      const stored = localStorage.getItem('connectly-registered-users');
      if (stored) {
        const users = JSON.parse(stored);
        const updated = users.map((u) => (u.email === email ? { ...u, verified: true } : u));
        localStorage.setItem('connectly-registered-users', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to verify email', e);
    }
  }, []);

  const ssoLogin = useCallback((provider, role = 'employee') => {
    const meta = SSO_PROVIDERS[provider];
    const email = meta ? meta.email : `user@${provider.toLowerCase().replace(/\s+/g, '')}.com`;
    localStorage.setItem(`connectly-sso-${provider}`, 'true');
    let result = login(email, 'sso-mock-password');
    if (!result.success) {
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('connectly-registered-users') || '[]');
        const existing = registeredUsers.find((u) => u.email === email);
        if (!existing) {
          registeredUsers.push({
            id: `u${Date.now()}`,
            name: `${provider} User`,
            email,
            password: simpleHash('sso-mock-password'),
            role,
            department: 'General',
            title: 'Team Member',
            status: 'active',
            joined: new Date().toISOString().split('T')[0],
            verified: true,
            approved: true,
          });
          localStorage.setItem('connectly-registered-users', JSON.stringify(registeredUsers));
          result = login(email, 'sso-mock-password');
        } else {
          // Existing account keeps its own password. SSO authenticates directly
          // without overwriting credentials, so the user's original password still works.
          setUser(existing);
          setIsAuthenticated(true);
          setIsVerifiedState(false);
          localStorage.setItem('connectly-auth', JSON.stringify({ user: existing, rememberMe: true, verified: false, onboardingComplete: true }));
          notifyAuthChanged();
          result = { success: true, user: existing, redirect: '/auth/otp-verification' };
        }
      } catch (e) {
        console.error('SSO provisioning failed', e);
      }
    }
    return result;
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsVerifiedState(false);
    localStorage.removeItem('connectly-auth');
    notifyAuthChanged();
  }, []);

  const register = useCallback((data) => {
    const newUser = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      password: simpleHash(data.password),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      role: data.role || 'employee',
      department: data.department || 'General',
      title: data.title || 'Team Member',
      status: 'active',
      joined: new Date().toISOString().split('T')[0],
      verified: true,
      approved: true,
    };

    // Save to localStorage for login verification
    try {
      let registeredUsers = [];
      const stored = localStorage.getItem('connectly-registered-users');
      if (stored) {
        registeredUsers = JSON.parse(stored);
      }
      // Check if email already exists
      if (registeredUsers.find(u => u.email === newUser.email)) {
        return { success: false, error: 'Email already registered' };
      }
      registeredUsers.push(newUser);
      localStorage.setItem('connectly-registered-users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }

    // New users sign in after email verification; admin approval is optional tracking
    return { success: true, user: newUser, redirect: '/auth/login' };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isVerified: isVerifiedState, verify2FA, verifyEmail, ssoLogin, login, logout, register, setUser, ROLE_DASHBOARD_MAP }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
