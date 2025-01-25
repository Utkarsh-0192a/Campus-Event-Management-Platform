// File: middleware/authenticate.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    let token = '';
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
    } else if (req.query.token) {
        token = req.query.token;
    } else {
        return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('Access denied, no token provided')}`);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || !user.sessionToken || decoded.sessionToken !== user.sessionToken) {
            return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('Invalid session token')}`);
        }

        req.user = user; // Attach user to request object

        // Add cache control header to prevent browser from caching protected pages
        res.set('Cache-Control', 'no-store');

        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.redirect('/login');
    }
};

module.exports = authenticate;
