import { useState } from 'react';

const UserList = ({ users, currentUser, isUserOnline }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter users by search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Search input */}
            <div className="p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        No users found
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <li
                                key={user._id}
                                className={`p-4 hover:bg-gray-50 ${user._id === currentUser?._id ? 'bg-gray-50' : ''}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {user.avatar ? (
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user.avatar}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user.name}
                                                {user._id === currentUser?._id && (
                                                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                                                )}
                                            </p>
                                            <div className="flex items-center">
                                                {/* User online status */}
                                                <span className={`inline-block h-2 w-2 rounded-full ${isUserOnline(user._id) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500 truncate">
                                                {user.interest || 'No interest selected'}
                                            </p>
                                            {/* Message access indicator */}
                                            {user.interest === 'Playing Cricket' ? (
                                                <span className="text-xs text-green-600 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Writer
                                                </span>
                                            ) : user.interest === 'Watching Cricket' ? (
                                                <span className="text-xs text-blue-600 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Reader
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UserList;