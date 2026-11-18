const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user to the request.
module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists. Please log in again.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};
