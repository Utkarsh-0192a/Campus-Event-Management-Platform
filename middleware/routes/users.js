// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, roles } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    if (roles) {
      const roleDocs = await Role.find({ name: { $in: roles } });
      user.roles = roleDocs.map((role) => role._id);
    }

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).populate('roles');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, roles: user.roles.map((role) => role.name) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
