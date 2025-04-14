// models/message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Making it not required so bot messages can have null sender
        default: null
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'file'],
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    botMessage: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;