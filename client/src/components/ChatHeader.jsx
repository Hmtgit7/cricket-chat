const ChatHeader = ({ toggleSidebar, showSidebar, userCount }) => {
    return (
        <div className="p-4 border-b border-gray-300 bg-white flex items-center">
            <button
                className="md:hidden text-gray-500 hover:text-gray-700 mr-3"
                onClick={toggleSidebar}
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

            <div>
                <h2 className="text-xl font-semibold">Cricket Chat Room</h2>
                <p className="text-sm text-gray-500">{userCount} participants</p>
            </div>

            <div className="ml-auto">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Live Chat
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;