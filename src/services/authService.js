const API_BASE = typeof window !== 'undefined' && window.__ENV__?.API_URL
  ? window.__ENV__.API_URL
  : '/api';

let authToken = null;
let refreshPromise = null;

function getToken() {
  return authToken || localStorage.getItem('connectly-token');
}

function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('connectly-token', token);
  } else {
    localStorage.removeItem('connectly-token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401 && !options._retry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request(endpoint, { ...options, _retry: true });
    }
    logout();
    window.location.href = '/auth/login';
    throw new Error('Session expired');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

async function refreshToken() {
  if (refreshPromise) return refreshPromise;
  const refresh = localStorage.getItem('connectly-refresh');
  if (!refresh) return null;

  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  }).then(r => r.json()).then(data => {
    if (data.token) {
      setToken(data.token);
      if (data.refreshToken) localStorage.setItem('connectly-refresh', data.refreshToken);
      return data.token;
    }
    return null;
  }).catch(() => null).finally(() => { refreshPromise = null; });

  return refreshPromise;
}

function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then(data => {
    if (data.token) setToken(data.token);
    if (data.refreshToken) localStorage.setItem('connectly-refresh', data.refreshToken);
    return data;
  });
}

function signup(data) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => {
    if (res.token) setToken(res.token);
    if (res.refreshToken) localStorage.setItem('connectly-refresh', res.refreshToken);
    return res;
  });
}

function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

function resetPassword(token, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

function verifyOTP(email, code) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

function verify2FA(code) {
  return request('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

function getProfile() {
  return request('/auth/profile');
}

function logout() {
  setToken(null);
  localStorage.removeItem('connectly-refresh');
  localStorage.removeItem('connectly-auth');
}

const authService = {
  login, signup, forgotPassword, resetPassword,
  verifyOTP, verify2FA, getProfile, logout,
  getToken, refreshToken,
};
export default authService;
