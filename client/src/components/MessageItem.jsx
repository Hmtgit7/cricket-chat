import { formatDistanceToNow } from 'date-fns';

const MessageItem = ({ message, isCurrentUser, isBot = false }) => {
  // Format message timestamp with error handling
  const formattedTime = () => {
    try {
      // Check if we have a valid timestamp
      const timestamp = message.timestamp || message.createdAt;

      if (!timestamp) {
        return 'just now';
      }

      // Make sure we have a valid date object or string
      const date = new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'just now';
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'just now';
    }
  };

  // Message status icons
  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;

    switch (message.status) {
      case 'sent':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'delivered':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
          </svg>
        );
      case 'seen':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render image attachments
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map((attachment, index) => (
          <div key={index}>
            {attachment.type === 'image' ? (
              <img
                src={attachment.url}
                alt="Attachment"
                className="max-w-xs max-h-64 rounded-md"
              />
            ) : (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-500 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Attachment
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get sender name
  const getSenderName = () => {
    if (isBot) {
      return message.sender?.name || 'Cricket Bot';
    }
    return message.sender?.name || 'Unknown';
  };

  // Get message bubble style classes
  const getMessageClasses = () => {
    if (isBot) {
      return 'bg-indigo-100 mr-auto rounded-tl-none border border-indigo-200';
    } else if (isCurrentUser) {
      return 'message-sent';
    } else {
      return 'message-received';
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
        {!isCurrentUser && (
          <span className="text-xs text-gray-500 ml-2 mb-1">
            {isBot ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {getSenderName()}
              </span>
            ) : (
              getSenderName()
            )}
          </span>
        )}

        <div className={`message-bubble ${getMessageClasses()}`}>
          <p className="text-gray-800">{message.content}</p>
          {renderAttachments()}

          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs text-gray-500">{formattedTime()}</span>
            {!isBot && isCurrentUser && renderStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;