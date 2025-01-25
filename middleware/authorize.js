// File: middleware/authorize.js

const Role = require('../models/Role');

const authorize = (roles) => {
    return async (req, res, next) => {
        try {
            const userRole = await Role.findById(req.user.role);
            if (!userRole || !roles.includes(userRole.name)) {
                return res.status(403).json({ message: 'Access denied' });
            }
            next();
        } catch (error) {
            res.status(500).json({ message: 'Authorization error', error: error.message });
        }
    };
};

module.exports = authorize;
