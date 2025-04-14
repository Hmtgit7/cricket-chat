// routes/message.routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate, canWriteMessages } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all messages (read access for all)
router.get('/', messageController.getAllMessages);

// Send message (only for users with "Playing Cricket" interest)
router.post('/', canWriteMessages, messageController.sendMessage);

// Update message status
router.put('/:messageId/status', messageController.updateMessageStatus);

module.exports = router;