// File: middleware/authorize.js

const Role = require('../models/Role');

const authorize = (roles) => {
    return async (req, res, next) => {
        try {
            const userRole = await Role.findById(req.user.role);
            if (!userRole || !roles.includes(userRole.name)) {
                return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('You do not have the required role to access this page')}`);
            }
            next();
        } catch (error) {
            return res.redirect(`/template/unauthorized.html?reason=${encodeURIComponent('Authorization error')}`);
        }
    };
};

module.exports = authorize;
