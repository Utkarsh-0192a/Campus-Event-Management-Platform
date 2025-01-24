// routes/roles.js
const express = require('express');
const Role = require('../models/Role');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Create a new role
router.post('/', authenticate, authorize(['Admin']), async (req, res) => {
  const { name } = req.body;
  try {
    const role = new Role({ name });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
