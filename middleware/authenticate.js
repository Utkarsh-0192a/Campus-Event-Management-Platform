// File: middleware/authenticate.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found or no longer exists' });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
