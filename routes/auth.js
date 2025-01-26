const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const authenticate = require('../middleware/authenticate'); // Authentication middleware

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    const { name, username, email, password, role } = req.body;

    try {
        // Check if the email or username is already registered
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username is already registered' });
        }

        // Fetch the role by name
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            username,
            email,
            password: password,
            role: roleDoc._id, // Assign the role to the user
        });

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
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ username }).populate('role'); // Populate role details
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role.name }, // Include user role in the token payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Set the token as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set secure flag in production
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour in milliseconds
        });

        // Return the user info
        res.status(200).json({
            message: 'Login successful',
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

// Get Current User Info (Optional Endpoint)
router.get('/me', authenticate, async (req, res) => {
    try {
        console.log('Fetching user info for:', req.user._id);
        const user = await User.findById(req.user._id).populate('role');
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role.name,
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Error fetching user info', error });
    }
});

// Route to check token
router.get('/check-token', authenticate, (req, res) => {
    console.log('Check token route accessed');
    res.status(200).json({ message: 'Token is valid' });
});

module.exports = router;
