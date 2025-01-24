// File: routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

// User Registration
// User Registration
router.post('/register', async (req, res) => {
    const { name, username, email, password, role } = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Fetch the role by name
        const roled = await Role.findOne({ name: role });
        if (!roled) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Create a new user
        const newUser = new User({
            name,
            username,
            email,
            password,
            role: roled._id, // Assign the role to the user
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


router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Extract username and password from request body

    try {
        // Check if the user exists
        const user = await User.findOne({ username }).populate('role'); // Populate role details
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password{user}' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password{pass}' });
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
                role: user.role.name, // Send role name as part of the response
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});
module.exports = router;

