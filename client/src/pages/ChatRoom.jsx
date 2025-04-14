import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

// Components
import MessageItem from '../components/MessageItem';
import UserList from '../components/UserList';
import MessageInput from '../components/MessageInput';
import ChatHeader from '../components/ChatHeader';

const ChatRoom = () => {
    const { currentUser, logout } = useAuth();
    const { messages, users, typing, loading, error, sendMessage, sendTyping, isUserOnline } = useChat();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showSidebar, setShowSidebar] = useState(true);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            // Auto-hide sidebar on small screens
            setShowSidebar(window.innerWidth >= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - User List */}
            <div className={`bg-white md:flex ${showSidebar ? 'flex' : 'hidden'} flex-col w-full md:w-80 border-r border-gray-300`}>
                <div className="p-4 border-b border-gray-300 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Cricket Chat</h2>
                    <button
                        className="md:hidden text-gray-500 hover:text-gray-700"
                        onClick={toggleSidebar}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col flex-grow">
                    <UserList
                        users={users}
                        currentUser={currentUser}
                        isUserOnline={isUserOnline}
                    />
                </div>

                <div className="p-4 border-t border-gray-300">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-medium">{currentUser?.name}</div>
                            <div className="text-sm text-gray-500">{currentUser?.interest}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-auto text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <ChatHeader
                    toggleSidebar={toggleSidebar}
                    showSidebar={showSidebar}
                    userCount={users.length}
                />

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-4 chat-messages-container">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-center">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            // Skip rendering invalid messages
                            if (!message || !message.content) {
                                console.warn('Invalid message data:', message);
                                return null;
                            }

                            // Special handling for bot messages
                            const isBot = message.botMessage || (message.sender && message.sender.isBot);
                            const isCurrentUser = isBot ? false : (message.sender?._id === currentUser?._id);

                            return (
                                <MessageItem
                                    key={message._id || index}
                                    message={message}
                                    isCurrentUser={isCurrentUser}
                                    isBot={isBot}
                                />
                            );
                        }).filter(Boolean) // Remove null values
                    )}

                    {/* Typing indicator */}
                    {typing && (
                        <div className="text-sm text-gray-500 italic ml-4">
                            {typing.name} is typing...
                        </div>
                    )}

                    {/* This element is for auto-scrolling to the bottom */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <MessageInput
                    disabled={currentUser?.interest !== 'Playing Cricket'}
                    sendMessage={sendMessage}
                    sendTyping={sendTyping}
                />
            </div>
        </div>
    );
};

export default ChatRoom;