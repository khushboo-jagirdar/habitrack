import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'habittrack_secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@habittrack.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, userType } = req.body;
    if (!fullName || !email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
    });
    await newUser.save();

    // Auto-login: return token + user so frontend can log in immediately
    const token = signToken({ id: newUser._id, email: newUser.email, userType: newUser.userType, isAdmin: false });
    res.status(201).json({
      message: 'Account created successfully.',
      userId: newUser._id,
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        userType: newUser.userType,
        avatar: newUser.avatar,
        aadhaarVerified: newUser.aadhaarVerified,
        isAdmin: false,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration failed.' });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken({ id: user._id, email: user.email, userType: user.userType, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        aadhaarVerified: user.aadhaarVerified,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed.' });
  }
});

// ─── Admin Login ─────────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    // Check env-based admin credentials first
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const token = signToken({ id: 'admin', email: ADMIN_EMAIL, userType: 'admin', isAdmin: true });
      return res.json({
        token,
        user: {
          id: 'admin',
          fullName: 'Administrator',
          email: ADMIN_EMAIL,
          userType: 'admin',
          isAdmin: true,
          avatar: '',
        },
      });
    }

    // Also allow DB users with isAdmin: true
    const user = await User.findOne({ email: email.toLowerCase(), isAdmin: true });
    if (!user) return res.status(401).json({ message: 'Invalid admin credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid admin credentials.' });

    const token = signToken({ id: user._id, email: user.email, userType: 'admin', isAdmin: true });
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: 'admin',
        isAdmin: true,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Admin login failed.' });
  }
});

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Reset failed.' });
  }
});

// ─── Aadhaar: Send OTP ────────────────────────────────────────────────────────
// Supported providers (set AADHAAR_PROVIDER in .env):
//   surepass  → https://surepass.io          (easiest — just email signup, instant token)
//   digio     → https://www.digio.in         (email signup, sandbox available)
//   (blank)   → dev mode: OTP shown on screen
router.post('/aadhaar/send-otp', async (req, res) => {
  try {
    const { aadhaarNumber, userId } = req.body;
    if (!aadhaarNumber || !userId)
      return res.status(400).json({ message: 'Aadhaar number and userId are required.' });
    if (!/^\d{12}$/.test(aadhaarNumber))
      return res.status(400).json({ message: 'Invalid Aadhaar number. Must be 12 digits.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    let otp = null;
    let refId = null;
    const provider = process.env.AADHAAR_PROVIDER;
    const apiKey   = process.env.AADHAAR_API_KEY;

    // ── Surepass ─────────────────────────────────────────────────────────────
    // Sign up: https://surepass.io → Dashboard → API Token (no business docs needed)
    // Docs: https://docs.surepass.io/aadhaar-otp-based-verification
    if (provider === 'surepass' && apiKey) {
      const r = await fetch('https://kyc-api.surepass.io/api/v1/aadhaar-v2/generate-otp', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: aadhaarNumber }),
      });
      const d = await r.json();
      if (!r.ok || !d.success)
        return res.status(502).json({ message: d.message || 'Surepass: failed to send OTP.' });
      refId = d.data?.client_id;

    // ── Digio ─────────────────────────────────────────────────────────────────
    // Sign up: https://www.digio.in/developer.html → sandbox credentials via email
    // Docs: https://developer.digio.in/#aadhaar-esign
    } else if (provider === 'digio' && apiKey && process.env.AADHAAR_API_SECRET) {
      const creds = Buffer.from(`${apiKey}:${process.env.AADHAAR_API_SECRET}`).toString('base64');
      const r = await fetch('https://ext.digio.in:444/client/kyc/aadhaar/initiate_request', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: aadhaarNumber, purpose: 'KYC verification' }),
      });
      const d = await r.json();
      if (!r.ok || d.error)
        return res.status(502).json({ message: d.message || 'Digio: failed to send OTP.' });
      refId = d.id;

    // ── Dev / demo mode ───────────────────────────────────────────────────────
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[DEV] Aadhaar OTP for user ${userId}: ${otp}`);
    }

    user.aadhaarNumber    = aadhaarNumber;
    user.aadhaarOtp       = otp || '';
    user.aadhaarOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    if (refId) user.aadhaarRefId = refId;
    await user.save();

    res.json({
      message: 'OTP sent to your Aadhaar-linked mobile number.',
      ...(process.env.NODE_ENV !== 'production' && otp ? { devOtp: otp } : {}),
    });
  } catch (err) {
    console.error('[Aadhaar send-otp]', err.message);
    res.status(500).json({ message: err.message || 'Failed to send OTP.' });
  }
});

// ─── Aadhaar: Verify OTP ──────────────────────────────────────────────────────
router.post('/aadhaar/verify-otp', async (req, res) => {
  try {
    const { otp, userId } = req.body;
    if (!otp || !userId)
      return res.status(400).json({ message: 'OTP and userId are required.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.aadhaarOtpExpiry)
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    if (new Date() > user.aadhaarOtpExpiry)
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    const provider = process.env.AADHAAR_PROVIDER;
    const apiKey   = process.env.AADHAAR_API_KEY;

    // ── Surepass verify ───────────────────────────────────────────────────────
    if (provider === 'surepass' && apiKey && user.aadhaarRefId) {
      const r = await fetch('https://kyc-api.surepass.io/api/v1/aadhaar-v2/submit-otp', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: user.aadhaarRefId, otp }),
      });
      const d = await r.json();
      if (!r.ok || !d.success)
        return res.status(400).json({ message: d.message || 'Invalid OTP.' });

    // ── Digio verify ──────────────────────────────────────────────────────────
    } else if (provider === 'digio' && apiKey && process.env.AADHAAR_API_SECRET && user.aadhaarRefId) {
      const creds = Buffer.from(`${apiKey}:${process.env.AADHAAR_API_SECRET}`).toString('base64');
      const r = await fetch(`https://ext.digio.in:444/client/kyc/aadhaar/verify_otp`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.aadhaarRefId, otp }),
      });
      const d = await r.json();
      if (!r.ok || d.error)
        return res.status(400).json({ message: d.message || 'Invalid OTP.' });

    // ── Dev / demo mode ───────────────────────────────────────────────────────
    } else {
      if (!user.aadhaarOtp || user.aadhaarOtp !== otp)
        return res.status(400).json({ message: 'Invalid OTP.' });
    }

    user.aadhaarVerified  = true;
    user.aadhaarOtp       = '';
    user.aadhaarOtpExpiry = null;
    user.aadhaarRefId     = '';
    await user.save();

    res.json({ message: 'Aadhaar verified successfully.', aadhaarVerified: true });
  } catch (err) {
    console.error('[Aadhaar verify-otp]', err.message);
    res.status(500).json({ message: err.message || 'OTP verification failed.' });
  }
});

export default router;
