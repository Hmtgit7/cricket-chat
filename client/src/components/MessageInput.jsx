import { useState, useRef } from 'react';

const MessageInput = ({ disabled, sendMessage, sendTyping }) => {
    const [message, setMessage] = useState('');
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Handle sending a message
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        // Send message
        sendMessage(message);

        // Clear input
        setMessage('');

        // Close emoji picker if open
        if (isEmojiPickerOpen) {
            setIsEmojiPickerOpen(false);
        }

        // Focus the input after sending for quick follow-up messages
        setTimeout(() => {
            const inputElement = document.querySelector('#message-input');
            if (inputElement) {
                inputElement.focus();
            }
        }, 0);
    };

    // Handle typing indicator
    const handleTyping = () => {
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Send typing event
        sendTyping();

        // Set new timeout (3 seconds)
        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null;
        }, 3000);
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // TODO: Implement file upload
        console.log('File selected:', files[0]);

        // Clear file input
        fileInputRef.current.value = null;
    };

    // Handle emoji selection
    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji);
    };

    // Simple emoji picker
    const renderEmojiPicker = () => {
        const emojis = ['😀', '😁', '😂', '🤣', '😊', '😍', '🙏', '👍', '👎', '❤️', '🏏', '🎾', '⚽', '🎯'];

        return (
            <div className="absolute bottom-16 right-4 bg-white rounded-lg shadow-lg p-2 border border-gray-300">
                <div className="grid grid-cols-7 gap-2">
                    {emojis.map((emoji, index) => (
                        <button
                            key={index}
                            className="w-8 h-8 text-xl hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => handleEmojiClick(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="border-t border-gray-300 bg-white p-4 relative">
            {/* Show a message for users who can't send messages */}
            {disabled && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 rounded">
                    <p className="text-sm">
                        <span className="font-bold">Read-only mode:</span> As a "Watching Cricket" user, you can only read messages.
                    </p>
                </div>
            )}

            {/* Message form */}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                {/* File upload button */}
                <button
                    type="button"
                    disabled={disabled}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                </button>

                {/* Emoji picker button */}
                <button
                    type="button"
                    disabled={disabled}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>

                {/* Message input */}
                <input
                    id="message-input"
                    type="text"
                    placeholder={disabled ? "You can only read messages" : "Type a message..."}
                    className="flex-1 py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        } else {
                            handleTyping();
                        }
                    }}
                    disabled={disabled}
                    autoFocus
                />

                {/* Send button */}
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    className="bg-primary text-white p-2 rounded-full disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>

            {/* Emoji picker */}
            {isEmojiPickerOpen && renderEmojiPicker()}
        </div>
    );
};

export default MessageInput;