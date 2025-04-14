import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

// Components
import MessageItem from '../components/MessageItem';
import UserList from '../components/UserList';

const ChatRoom = () => {
    const { currentUser, logout, updateInterest } = useAuth();
    const {
        messages,
        users,
        typing,
        botTyping,
        loading,
        connected,
        connecting,
        sendMessage,
        sendTyping,
        isUserOnline,
    } = useChat();

    const [showSidebar, setShowSidebar] = useState(true);
    const [scrolledUp, setScrolledUp] = useState(false);
    const [newMessageAlert, setNewMessageAlert] = useState(false);
    const [changingInterest, setChangingInterest] = useState(false);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const lastMessageCountRef = useRef(messages.length);
    const navigate = useNavigate();

    // Show/hide sidebar based on screen size
    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth >= 768);
        };

        // Initialize sidebar state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll to bottom of messages when new messages arrive
    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current && !scrolledUp) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            } else if (messages.length > lastMessageCountRef.current) {
                // If user has scrolled up and there are new messages, show alert
                setNewMessageAlert(true);
            }
        };

        // Scroll to bottom on initial load
        if (messages.length > 0 && !loading) {
            scrollToBottom();
        }

        // Update last message count
        lastMessageCountRef.current = messages.length;
    }, [messages, loading, scrolledUp]);

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            if (!chatContainerRef.current) return;

            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            // Consider scrolled up if not at the bottom (with a small buffer)
            const isScrolledUp = scrollTop < scrollHeight - clientHeight - 10;

            setScrolledUp(isScrolledUp);

            // Hide new message alert if scrolled to bottom
            if (!isScrolledUp) {
                setNewMessageAlert(false);
            }
        };

        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
            return () => chatContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

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

    // Scroll to latest message
    const scrollToLatest = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setNewMessageAlert(false);
    };

    // Get active user count (online users)
    const getActiveUserCount = () => {
        return users.filter(user => isUserOnline(user._id)).length;
    };

    // Handle interest change
    const handleToggleInterest = async () => {
        if (!currentUser) return;

        try {
            setChangingInterest(true);

            // Toggle between the two interests
            const newInterest = currentUser.interest === 'Playing Cricket'
                ? 'Watching Cricket'
                : 'Playing Cricket';

            await updateInterest(newInterest);

            // Success message could be shown here
        } catch (error) {
            console.error('Failed to update interest:', error);
            // Error message could be shown here
        } finally {
            setChangingInterest(false);
        }
    };

    // Get connection status display
    const getConnectionStatus = () => {
        if (connecting) return "Connecting...";
        if (!connected) return "Disconnected";
        return "Connected";
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - User List */}
            <div className={`bg-white md:flex ${showSidebar ? 'flex' : 'hidden'} flex-col w-full md:w-80 border-r border-gray-300 z-20`}>
                <div className="p-4 border-b border-gray-300 flex items-center justify-between bg-primary bg-opacity-10">
                    <h2 className="text-xl font-semibold text-gray-800">Cricket Chat</h2>
                    <button
                        className="md:hidden text-gray-500 hover:text-gray-700"
                        onClick={toggleSidebar}
                        aria-label="Close sidebar"
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

                <div className="p-4 border-t border-gray-300 bg-gray-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{currentUser?.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                                <span className={`inline-block h-2 w-2 rounded-full ${isUserOnline(currentUser?._id) ? 'bg-green-500' : 'bg-gray-300'} mr-1`}></span>
                                {currentUser?.interest || 'No interest selected'}
                            </div>
                            {/* Add interest toggle button */}
                            <button
                                onClick={handleToggleInterest}
                                disabled={changingInterest}
                                className="text-xs text-blue-600 hover:underline mt-1 flex items-center"
                            >
                                {changingInterest ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Switching...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        Switch to {currentUser?.interest === 'Playing Cricket' ? 'Watching Cricket' : 'Playing Cricket'}
                                    </>
                                )}
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Logout"
                            title="Logout"
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
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-300 bg-white flex items-center shadow-sm sticky top-0 z-10">
                    <button
                        className="md:hidden text-gray-500 hover:text-gray-700 mr-3 focus:outline-none"
                        onClick={toggleSidebar}
                        aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
                    >
                        {showSidebar ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>

                    <div className="flex flex-1 justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Cricket Chat Room</h2>
                            <p className="text-sm text-gray-500 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>{getActiveUserCount()} participants</span>
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${connected ? 'text-green-600 bg-green-100' :
                                connecting ? 'text-yellow-600 bg-yellow-100' :
                                    'text-red-600 bg-red-100'
                                }`}>
                                <span className={`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' :
                                    connecting ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}></span>
                                {getConnectionStatus()}
                            </div>

                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm ml-2 hidden md:block">
                                Live Chat
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 bg-gray-100 chat-messages-container"
                >
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
                        <div className="space-y-1">
                            {messages.map((message, index) => {
                                // Skip rendering invalid messages
                                if (!message || !message.content) {
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
                            })}
                        </div>
                    )}

                    {/* Typing indicators */}
                    {(typing || botTyping) && (
                        <div className="flex items-center text-sm text-gray-500 italic ml-4 mt-2">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className="ml-2">
                                {botTyping ? 'Cricket Bot' : typing?.name} is typing...
                            </div>
                        </div>
                    )}

                    {/* This element is for auto-scrolling to the bottom */}
                    <div ref={messagesEndRef} />
                </div>

                {/* New message alert */}
                {newMessageAlert && (
                    <div
                        className="bg-primary text-white text-center py-2 cursor-pointer animate-pulse"
                        onClick={scrollToLatest}
                    >
                        New messages ↓
                    </div>
                )}

                {/* Message Input */}
                <div className="border-t border-gray-300 bg-white p-4 relative">
                    {/* Show a message for users who can't send messages */}
                    {currentUser?.interest === 'Watching Cricket' && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 rounded">
                            <p className="text-sm flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    <span className="font-bold">Read-only mode:</span> As a "Watching Cricket" user, you can only read messages.
                                    {' '}
                                    <button
                                        onClick={handleToggleInterest}
                                        className="text-blue-600 hover:underline"
                                        disabled={changingInterest}
                                    >
                                        {changingInterest ? 'Switching...' : 'Switch to Playing Cricket to send messages'}
                                    </button>
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Message form */}
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(e.target.message.value); e.target.message.value = ''; }} className="flex items-center space-x-2">
                        {/* Emoji button */}
                        <button
                            type="button"
                            disabled={currentUser?.interest !== 'Playing Cricket'}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            title="Emoji (Coming soon)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* Message input */}
                        <input
                            type="text"
                            name="message"
                            placeholder={currentUser?.interest === 'Playing Cricket' ? "Type a message..." : "You can only read messages"}
                            className="flex-1 py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={currentUser?.interest !== 'Playing Cricket'}
                            onKeyUp={() => sendTyping()}
                        />

                        {/* Send button */}
                        <button
                            type="submit"
                            disabled={currentUser?.interest !== 'Playing Cricket'}
                            className="bg-primary text-white p-2 rounded-full disabled:opacity-50 focus:outline-none"
                            title="Send message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Audio element for notification sound (hidden) */}
            <audio id="message-notification" preload="auto" style={{ display: 'none' }}>
                <source src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8a410a6c6.mp3?filename=notification-sound-7062.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

export default ChatRoom;