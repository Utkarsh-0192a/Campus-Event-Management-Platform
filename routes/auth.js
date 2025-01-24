// File: routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    const { username, email, password, roleName } = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Check if the role exists
        const role = await Role.findOne({ name: roleName });
        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
            role: role._id, // Assign the role to the user
        });

        // Hash the password
        newUser.password = await bcrypt.hash(password, 10);

        // Save the new user
        await newUser.save();

        // Respond with success message
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email }).populate('role'); // Populate role details
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token will expire in 1 hour
        );

        // Return the token and user info
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role.name,  // Send role name as part of the response
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

module.exports = router;
