// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
    );
};

/**
 * Register new user
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON(),
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

/**
 * Login user
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update online status
        user.isOnline = true;
        user.lastSeen = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

/**
 * Update user interest
 */
const updateInterest = async (req, res) => {
    try {
        const { interest } = req.body;

        // Validate interest value
        if (!interest || !['Playing Cricket', 'Watching Cricket'].includes(interest)) {
            return res.status(400).json({
                message: 'Valid interest is required. Choose either "Playing Cricket" or "Watching Cricket"'
            });
        }

        // Get user from auth middleware
        const user = req.user;

        // Update interest
        user.interest = interest;
        await user.save();

        res.status(200).json({
            message: 'Interest updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update interest error:', error);
        res.status(500).json({ message: 'Failed to update interest', error: error.message });
    }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
    try {
        // Get user from auth middleware
        const user = req.user;

        // Update online status
        user.isOnline = false;
        user.lastSeen = Date.now();
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed', error: error.message });
    }
};

module.exports = {
    register,
    login,
    updateInterest,
    logout
};