const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const header = req.get('Authorization');
    const cookieToken = req.cookies && req.cookies.token;
    const token = header ? header.split(' ')[1] : cookieToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'You are not authorized.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid user.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = auth;
