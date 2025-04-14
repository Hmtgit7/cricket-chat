// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Authentication error' });
    }
};

/**
 * Role-based authorization middleware for chat access
 * Checks if user has 'Playing Cricket' interest for write access
 */
const canWriteMessages = (req, res, next) => {
    try {
        // Requires authentication middleware to run first
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if user has 'Playing Cricket' interest
        if (req.user.interest !== 'Playing Cricket') {
            return res.status(403).json({
                message: 'Access denied: Only users with "Playing Cricket" interest can send messages'
            });
        }

        next();
    } catch (error) {
        console.error('Authorization middleware error:', error);
        res.status(500).json({ message: 'Authorization error' });
    }
};

module.exports = {
    authenticate,
    canWriteMessages
};