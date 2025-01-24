// // routes/users.js
// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Role = require('../models/Role');
// const authenticate = require('../middleware/authenticate');
// const authorize = require('../middleware/authorize');
// const router = express.Router();

// // Register a new user
// router.post('/register', async (req, res) => {
//   const { username, password, name, email, role } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, password: hashedPassword, name, email, role });

//     await user.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Login user
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const user = await User.findOne({ username }).populate('role');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token, role: user.role.name });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
