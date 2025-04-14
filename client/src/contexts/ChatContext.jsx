import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = 'https://cricket-chat-backend.onrender.com/api'|| 'http://localhost:5000/api';
const SOCKET_URL = 'https://cricket-chat-backend.onrender.com' ||'http://localhost:5000';

// Create chat context
const ChatContext = createContext();

// Custom hook to use chat context
export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const { currentUser, token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [typing, setTyping] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Reference to socket.io connection
    const socketRef = useRef(null);

    // Connect to Socket.IO when user is authenticated
    useEffect(() => {
        // Clean up previous socket connection
        const cleanup = () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };

        if (!currentUser || !token) {
            cleanup();
            return;
        }

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token }
        });

        // Socket event listeners
        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError(`Socket connection error: ${err.message}`);
        });

        socketRef.current.on('active_users', (userIds) => {
            console.log('Active users received:', userIds);
            setActiveUsers(userIds);
        });

        socketRef.current.on('recent_messages', (messages) => {
            console.log('Recent messages received:', messages);
            setMessages(messages);
        });

        socketRef.current.on('user_status_changed', (data) => {
            console.log('User status changed:', data);
            setActiveUsers(prev => {
                if (data.isOnline) {
                    return [...new Set([...prev, data.userId])];
                } else {
                    return prev.filter(id => id !== data.userId);
                }
            });
        });

        socketRef.current.on('message_received', (message) => {
            // Validate message before adding to state
            if (message && (message._id || message.content)) {
                console.log('New message received:', message);

                // Play notification sound for new messages (except your own)
                if (message.sender && message.sender._id !== currentUser?._id) {
                    try {
                        const audio = document.getElementById('message-notification');
                        if (audio) {
                            audio.currentTime = 0; // Reset to start
                            audio.volume = 0.3; // Lower volume
                            audio.play().catch(e => console.log('Audio play prevented:', e));
                        }
                    } catch (e) {
                        console.log('Audio notification error:', e);
                    }
                }

                setMessages(prev => [...prev, message]);

                // Auto-scroll to bottom when new message arrives
                setTimeout(() => {
                    const chatContainer = document.querySelector('.chat-messages-container');
                    if (chatContainer) {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }, 100);
            } else {
                console.error('Received invalid message:', message);
            }
        });

        socketRef.current.on('message_status_updated', (data) => {
            setMessages(prev => prev.map(msg =>
                msg._id === data.messageId ? { ...msg, status: data.status } : msg
            ));
        });

        socketRef.current.on('user_typing', (data) => {
            setTyping(data);
            // Clear typing indicator after 3 seconds
            setTimeout(() => setTyping(null), 3000);
        });

        socketRef.current.on('error', (error) => {
            console.error('Socket error:', error);
            setError(error.message);
        });

        return cleanup;
    }, [currentUser, token]);

    // Load all messages
    useEffect(() => {
        const loadMessages = async () => {
            if (!currentUser || !token) {
                setMessages([]);
                setLoading(false);
                return;
            }

            try {
                // Explicitly set the Authorization header for this request
                const response = await axios.get(`${API_URL}/messages`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setMessages(response.data.messages);
                setError(null);
            } catch (err) {
                console.error('Failed to load messages:', err);
                setError('Failed to load messages. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [currentUser, token]);

    // Load all users
    useEffect(() => {
        const loadUsers = async () => {
            if (!currentUser || !token) {
                setUsers([]);
                return;
            }

            try {
                // Explicitly set the Authorization header for this request
                const response = await axios.get(`${API_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsers(response.data.users);
                setError(null);
            } catch (err) {
                console.error('Failed to load users:', err);
                setError('Failed to load users. Please try again.');
            }
        };

        loadUsers();
    }, [currentUser, token]);

    // Send message function
    const sendMessage = (content, attachments = []) => {
        if (!socketRef.current || !currentUser) return;

        // Emit message to server
        socketRef.current.emit('new_message', {
            content,
            attachments
        });

        // Immediately scroll to the latest message
        setTimeout(() => {
            const chatContainer = document.querySelector('.chat-messages-container');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
    };

    // Send typing indicator
    const sendTyping = () => {
        if (!socketRef.current || !currentUser) return;

        // Emit typing event
        socketRef.current.emit('typing');
    };

    // Update message status
    const updateMessageStatus = (messageId, status) => {
        if (!socketRef.current || !currentUser) return;

        // Emit status update
        socketRef.current.emit('update_message_status', {
            messageId,
            status
        });
    };

    // Check if user is online
    const isUserOnline = (userId) => {
        return activeUsers.includes(userId?.toString());
    };

    // Search users
    const searchUsers = async (query) => {
        try {
            const response = await axios.get(`${API_URL}/users/search?query=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.users;
        } catch (err) {
            console.error('Search users error:', err);
            setError('Failed to search users');
            throw err;
        }
    };

    const value = {
        messages,
        users,
        activeUsers,
        typing,
        loading,
        error,
        sendMessage,
        sendTyping,
        updateMessageStatus,
        isUserOnline,
        searchUsers
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;