// create_admin.js - run with node create_admin.js
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./User');
const crypto = require('crypto');

const generateSaltAndHashForPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
};

(async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists:', email);
    process.exit(0);
  }

  const { salt, hash } = generateSaltAndHashForPassword(password);
  const user = new User({ name, email, salt, hash, role: 'admin' });
  await user.save();
  console.log('Created admin user:', email);
  process.exit(0);
})();
