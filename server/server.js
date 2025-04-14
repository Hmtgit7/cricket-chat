// server.js - Main entry point for our application
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');

// Import socket handler
const setupSocket = require('./socket');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers but allow cross-origin resource sharing
app.use(compression()); // Compress responses
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Setup Socket.IO connection handler
setupSocket(io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// Export for testing
module.exports = server;