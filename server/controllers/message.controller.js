// controllers/message.controller.js
const Message = require('../models/message.model');

/**
 * Send a new message
 */
const sendMessage = async (req, res) => {
    try {
        const { content, attachments } = req.body;

        // Validate content
        if (!content && (!attachments || attachments.length === 0)) {
            return res.status(400).json({ message: 'Message content or attachments are required' });
        }

        // Create new message
        const message = new Message({
            sender: req.user._id,
            content,
            attachments: attachments || []
        });

        await message.save();

        // Populate sender info
        await message.populate('sender', 'name email avatar interest');

        // Return the new message
        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

/**
 * Get all messages
 */
const getAllMessages = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Get messages
        const messages = await Message.find()
            .sort({ createdAt: -1 }) // Latest messages first
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email avatar interest');

        // Add bot info for bot messages
        const processedMessages = messages.map(msg => {
            const msgObj = msg.toObject();

            // Add bot info for messages with botMessage flag
            if (msgObj.botMessage && !msgObj.sender) {
                msgObj.sender = {
                    _id: 'bot-cricket-123',
                    name: 'Cricket Bot',
                    interest: 'Playing Cricket',
                    isBot: true
                };
            }

            return msgObj;
        });

        // Count total messages
        const total = await Message.countDocuments();

        res.status(200).json({
            messages: processedMessages.reverse(), // Reverse to get chronological order
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to get messages', error: error.message });
    }
};

/**
 * Update message status
 */
const updateMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status || !['sent', 'delivered', 'seen'].includes(status)) {
            return res.status(400).json({
                message: 'Valid status is required. Choose from "sent", "delivered", or "seen"'
            });
        }

        // Update message status
        const message = await Message.findByIdAndUpdate(
            messageId,
            { status },
            { new: true }
        ).populate('sender', 'name email avatar interest');

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({
            message: 'Message status updated',
            data: message
        });
    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({ message: 'Failed to update message status', error: error.message });
    }
};

module.exports = {
    sendMessage,
    getAllMessages,
    updateMessageStatus
};