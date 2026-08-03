const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { pool } = require('../config/db');
const {
  signAccessToken, signRefreshToken, verifyRefreshToken,
} = require('../utils/jwt');

const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES) || 5;

function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

function generateCode(len = 6) {
  return String(Math.floor(Math.random() * 10 ** len)).padStart(len, '0');
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function storeRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?,?,?,?)',
    [randomUUID(), userId, token, expiresAt]
  );
}

async function issueTokens(user) {
  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user.id, refreshToken);
  return { token, refreshToken };
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password, role, department, title } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, department, title, status, is_verified)
       VALUES (?,?,?,?,?,?,?,?,0)`,
      [id, name, email, passwordHash, role || 'employee', department || null, title || null, 'offline']
    );

    const user = await findUserById(id);
    const { token, refreshToken } = await issueTokens(user);

    res.status(201).json({ token, refreshToken, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Send an OTP the way the frontend flow expects (login -> OTP verification -> 2FA -> dashboard)
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
    await pool.query(
      `INSERT INTO auth_codes (id, user_id, code, type, expires_at) VALUES (?,?,?,?,?)`,
      [randomUUID(), user.id, codeHash, 'otp', expiresAt]
    );
    // NOTE: in production this would be emailed/texted, not logged.
    console.log(`[DEV ONLY] OTP for ${email}: ${code}`);

    const { token, refreshToken } = await issueTokens(user);

    res.json({
      token,
      refreshToken,
      user: publicUser(user),
      requiresOtp: true,
      redirect: '/auth/otp-verification',
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/verify-otp
async function verifyOTP(req, res, next) {
  try {
    const { email, code } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const [rows] = await pool.query(
      `SELECT * FROM auth_codes WHERE user_id = ? AND type = 'otp' AND consumed = 0
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    const record = rows[0];
    if (!record || new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Code expired, please request a new one' });
    }

    const valid = await bcrypt.compare(code, record.code);
    if (!valid) return res.status(400).json({ message: 'Incorrect code' });

    await pool.query('UPDATE auth_codes SET consumed = 1 WHERE id = ?', [record.id]);
    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/2fa/verify
async function verify2FA(req, res, next) {
  try {
    const { code } = req.body;
    // Demo 2FA acceptance: any 6-digit code passes once OTP has already been verified.
    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Enter a valid 6-digit code' });
    }
    await pool.query(
      'UPDATE users SET is_verified = 1 WHERE id = ?',
      [req.user?.sub]
    );
    res.json({ success: true, message: '2FA verified' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    // Always respond success to avoid leaking which emails exist
    if (user) {
      const resetToken = randomUUID();
      const tokenHash = await bcrypt.hash(resetToken, 10);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await pool.query(
        `INSERT INTO auth_codes (id, user_id, code, type, expires_at) VALUES (?,?,?,?,?)`,
        [randomUUID(), user.id, tokenHash, 'password_reset', expiresAt]
      );
      // NOTE: in production this would be emailed as a reset link, not logged.
      console.log(`[DEV ONLY] Password reset token for ${email}: ${resetToken}`);
    }
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, password, email } = req.body;
    if (!token || !password || !email) {
      return res.status(400).json({ message: 'token, email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    const [rows] = await pool.query(
      `SELECT * FROM auth_codes WHERE user_id = ? AND type = 'password_reset' AND consumed = 0
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );
    const record = rows[0];
    if (!record || new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const valid = await bcrypt.compare(token, record.code);
    if (!valid) return res.status(400).json({ message: 'Invalid or expired reset link' });

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
    await pool.query('UPDATE auth_codes SET consumed = 1 WHERE id = ?', [record.id]);

    res.json({ success: true, message: 'Password updated, you can now log in' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0 LIMIT 1',
      [refreshToken]
    );
    if (!rows[0]) return res.status(401).json({ message: 'Invalid refresh token' });

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const token = signAccessToken(user);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [refreshToken]);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup, login, verifyOTP, verify2FA, forgotPassword, resetPassword,
  refresh, getProfile, logout,
};
