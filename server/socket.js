// socket.js
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const Message = require('./models/message.model');

/**
 * Set up socket.io event handlers
 * @param {Object} io - Socket.IO instance
 */
const setupSocket = (io) => {
    // Track connected users
    const connectedUsers = new Map();

    // Auto-respond bot
    const cricketBot = {
        _id: 'bot-cricket-123',
        name: 'Cricket Bot',
        interest: 'Playing Cricket',
        isBot: true,
    };

    // Bot responses
    const botResponses = [
        "How's everyone enjoying the cricket season?",
        "Did you catch the last match? It was incredible!",
        "Who's your favorite cricket player?",
        "I think we have a good chance in the upcoming tournament.",
        "Cricket is not just a game, it's an emotion!",
        "What do you think about the new batting lineup?",
        "The pitch conditions are favorable today.",
        "Remember that amazing six from the last over?",
        "Which team are you supporting this season?",
        "Always good to see cricket fans having a chat!"
    ];

    // Middleware for socket authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: Token required'));
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by id
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            // Attach user to socket
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

        // Add user to connectedUsers map
        connectedUsers.set(socket.user._id.toString(), socket.id);

        // Update user's online status
        User.findByIdAndUpdate(
            socket.user._id,
            { isOnline: true, lastSeen: Date.now() }
        ).exec();

        // Broadcast user's online status to all connected clients
        io.emit('user_status_changed', {
            userId: socket.user._id,
            isOnline: true
        });

        // Send active users list to the connected client
        socket.emit('active_users', Array.from(connectedUsers.keys()));

        // Fetch recent messages and send to the newly connected user
        const sendRecentMessages = async () => {
            try {
                const recentMessages = await Message.find()
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .populate('sender', 'name email avatar interest')
                    .lean();

                if (recentMessages.length > 0) {
                    socket.emit('recent_messages', recentMessages.reverse());
                } else {
                    // If no messages exist, have the bot send a welcome message
                    const welcomeMessage = {
                        _id: `bot-welcome-${Date.now()}`,
                        sender: cricketBot,
                        content: `Welcome to Cricket Chat, ${socket.user.name}! Feel free to start a conversation.`,
                        timestamp: new Date(),
                        status: 'delivered'
                    };

                    socket.emit('message_received', welcomeMessage);

                    // Save the welcome message to the database
                    const dbMessage = new Message({
                        sender: null, // Special case for bot messages
                        content: welcomeMessage.content,
                        timestamp: welcomeMessage.timestamp,
                        status: 'delivered',
                        botMessage: true
                    });

                    await dbMessage.save();
                }
            } catch (err) {
                console.error('Error fetching recent messages:', err);
            }
        };

        sendRecentMessages();

        // Handle new message
        socket.on('new_message', async (data) => {
            try {
                // Check if user has permission to send messages
                if (socket.user.interest !== 'Playing Cricket') {
                    socket.emit('error', {
                        message: 'You do not have permission to send messages'
                    });
                    return;
                }

                const { content, attachments } = data;

                // Create new message
                const message = new Message({
                    sender: socket.user._id,
                    content,
                    attachments: attachments || []
                });

                await message.save();

                // Populate sender info
                await message.populate('sender', 'name email avatar interest');

                // Broadcast message to all connected clients
                io.emit('message_received', message);

                // Acknowledge message to sender
                socket.emit('message_sent', {
                    messageId: message._id,
                    status: 'sent'
                });

                // Determine if bot should respond (respond to about 70% of messages)
                const shouldBotRespond = Math.random() < 0.7;

                if (shouldBotRespond) {
                    // Add a delay to make the bot response feel more natural (1-3 seconds)
                    const responseDelay = Math.floor(Math.random() * 2000) + 1000;

                    setTimeout(async () => {
                        try {
                            // Generate typing indicator first
                            io.emit('user_typing', {
                                userId: cricketBot._id,
                                name: cricketBot.name
                            });

                            // Select a random response from the bot responses
                            const randomIndex = Math.floor(Math.random() * botResponses.length);
                            const botResponse = botResponses[randomIndex];

                            // Create bot message
                            const botMessage = {
                                _id: `bot-${Date.now()}`,
                                sender: cricketBot,
                                content: botResponse,
                                timestamp: new Date(),
                                status: 'delivered'
                            };

                            // Broadcast bot message after a short delay to simulate typing
                            setTimeout(() => {
                                io.emit('message_received', botMessage);

                                // Save the bot message to the database
                                const dbBotMessage = new Message({
                                    sender: null, // Special case for bot messages
                                    content: botResponse,
                                    timestamp: botMessage.timestamp,
                                    status: 'delivered',
                                    botMessage: true
                                });

                                dbBotMessage.save().catch(err => console.error('Error saving bot message:', err));
                            }, 1500); // Delay to simulate typing

                        } catch (error) {
                            console.error('Bot response error:', error);
                        }
                    }, responseDelay);
                }
            } catch (error) {
                console.error('New message error:', error);
                socket.emit('error', {
                    message: 'Failed to send message'
                });
            }
        });

        // Handle message status update
        socket.on('update_message_status', async (data) => {
            try {
                const { messageId, status } = data;

                // Validate status
                if (!status || !['sent', 'delivered', 'seen'].includes(status)) {
                    socket.emit('error', {
                        message: 'Invalid message status'
                    });
                    return;
                }

                // Update message status
                const message = await Message.findByIdAndUpdate(
                    messageId,
                    { status },
                    { new: true }
                );

                if (!message) {
                    socket.emit('error', {
                        message: 'Message not found'
                    });
                    return;
                }

                // Broadcast status update to all clients
                io.emit('message_status_updated', {
                    messageId,
                    status
                });
            } catch (error) {
                console.error('Update message status error:', error);
                socket.emit('error', {
                    message: 'Failed to update message status'
                });
            }
        });

        // Handle typing indicator
        socket.on('typing', () => {
            // Broadcast typing indicator to all except sender
            socket.broadcast.emit('user_typing', {
                userId: socket.user._id,
                name: socket.user.name
            });
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);

            // Remove user from connectedUsers map
            connectedUsers.delete(socket.user._id.toString());

            // Update user's online status
            await User.findByIdAndUpdate(
                socket.user._id,
                { isOnline: false, lastSeen: Date.now() }
            );

            // Broadcast user's offline status to all connected clients
            io.emit('user_status_changed', {
                userId: socket.user._id,
                isOnline: false
            });
        });
    });
};

module.exports = setupSocket;