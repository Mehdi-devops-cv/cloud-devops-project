const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middlewares/auth');
const { loginSuccessTotal, loginFailedTotal } = require('../metrics');

const router = express.Router();

const generateSaltAndHashForPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const comparePassword = async (password, salt, hash) => {
  if (!salt || !hash) throw new Error('Salt or hash is missing');
  const inputHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === inputHash;
};

const sanitizeUser = (user) => {
  const sanitized = user.toObject();
  delete sanitized.salt;
  delete sanitized.hash;
  return sanitized;
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      loginFailedTotal.inc();
      return res.status(400).json({ success: false, message: 'Could not find user with this email address, please try again.' });
    }
    if (!await comparePassword(password, user.salt, user.hash)) {
      loginFailedTotal.inc();
      return res.status(400).json({ success: false, message: 'Unable to log in with provided credentials.' });
    }
    const payload = { id: user._id, name: user.name, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    loginSuccessTotal.inc();
    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }
    const { salt, hash } = generateSaltAndHashForPassword(password);
    const user = new User({ name, email, salt, hash });
    await user.save();
    const payload = { id: user._id, name: user.name, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json({ success: true, token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email });
  user.salt = crypto.randomBytes(16).toString('hex');
  user.hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
  await user.save();
  const payload = { id: user._id, name: user.name, email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return res.status(200).json({ success: true, token });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ success: true, message: 'Logged out' });
});

router.get('/user', auth, async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return res.json({ success: true, user: sanitizeUser(req.user) });
});

router.get('/user/profile', auth, async (req, res) => {
  return res.json({ success: true, user: sanitizeUser(req.user) });
});

router.put('/user/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    await req.user.save();
    return res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    return res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

module.exports = router;
