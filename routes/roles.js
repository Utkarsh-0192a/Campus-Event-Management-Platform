// File: routes/roles.js

const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Create a new role (Admin only)
router.post('/create', authenticate, authorize(['admin']), async (req, res) => {
  const { name } = req.body;

  try {
    const role = new Role({ name });
    await role.save();
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error });
  }
});

// Get all roles (Admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error });
  }
});

// Assign role to a user (Admin only)
router.put('/assign/:userId', authenticate, authorize(['admin']), async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  try {
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role._id;
    await user.save();
    res.status(200).json({ message: 'Role assigned to user', user });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning role', error });
  }
});

module.exports = router;
