// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Update interest
router.put('/update-interest', authenticate, authController.updateInterest);

// Logout user
router.post('/logout', authenticate, authController.logout);

module.exports = router;