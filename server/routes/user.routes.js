// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Get all users
router.get('/', userController.getAllUsers);

// Search users
router.get('/search', userController.searchUsers);

// Update user profile
router.put('/profile', userController.updateProfile);

module.exports = router;