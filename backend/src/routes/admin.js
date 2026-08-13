const express = require('express');
const crypto = require('crypto');
const { User } = require('../models');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

const sanitizeUser = (user) => {
  const sanitized = user.toObject();
  delete sanitized.salt;
  delete sanitized.hash;
  return sanitized;
};

router.use(auth, isAdmin);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-salt -hash');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const user = new User({ name, email, salt, hash, role: role || 'user' });
    await user.save();
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error creating user', error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      user.salt = crypto.randomBytes(16).toString('hex');
      user.hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    }
    await user.save();
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating user', error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await User.findByIdAndDelete(id);
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error deleting user', error: err.message });
  }
});

module.exports = router;
