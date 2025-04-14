// controllers/user.controller.js
const User = require('../models/user.model');

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res) => {
    try {
        // User is already attached from auth middleware
        res.status(200).json({ user: req.user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Failed to get user profile', error: error.message });
    }
};

/**
 * Get all users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
};

/**
 * Search users by name or email
 */
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }, '-password');

        res.status(200).json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Failed to search users', error: error.message });
    }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const updates = {};

        // Only update fields that are provided
        if (name) updates.name = name;
        if (avatar) updates.avatar = avatar;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

module.exports = {
    getCurrentUser,
    getAllUsers,
    searchUsers,
    updateProfile
};