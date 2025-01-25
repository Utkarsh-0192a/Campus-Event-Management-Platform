// File: middleware/authenticate.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ...existing code...

const authenticate = async (req, res, next) => {
    let token = '';
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
    } else if (req.cookies.token) {
        token = req.cookies.token;
    } else {
        return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('Access denied, no token provided')}`);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('User not found or no longer exists')}`);
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('Invalid or expired token')}`);
    }
};

// ...existing code...

module.exports = authenticate;
