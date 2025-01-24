// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

const authorize = (roles) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('roles');
    const userRoles = user.roles.map((role) => role.name);

    if (!roles.some((role) => userRoles.includes(role))) {
      return res.status(403).json({ message: 'Access Forbidden' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { authenticate, authorize };
