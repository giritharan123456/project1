const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

// Slow down brute-force attempts on sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

router.post('/signup', authLimiter, ctrl.signup);
router.post('/login', authLimiter, ctrl.login);
router.post('/verify-otp', authLimiter, ctrl.verifyOTP);
router.post('/2fa/verify', requireAuth, ctrl.verify2FA);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, ctrl.resetPassword);
router.post('/refresh', ctrl.refresh);
router.get('/profile', requireAuth, ctrl.getProfile);
router.post('/logout', ctrl.logout);

module.exports = router;
