import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const InterestSelection = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser, updateInterest } = useAuth();
    const navigate = useNavigate();

    // Debug logging
    useEffect(() => {
        console.log("InterestSelection component mounted");
        console.log("Current user:", currentUser);
    }, [currentUser]);

    const handleSelectInterest = async (interest) => {
        try {
            console.log(`Selecting interest: ${interest}`);
            setError('');
            setLoading(true);

            await updateInterest(interest);
            console.log("Interest updated successfully, navigating to chat");

            // Redirect to chat page
            navigate('/chat');
        } catch (err) {
            console.error("Error updating interest:", err);
            setError(err.message || 'Failed to update interest');
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Welcome, {currentUser?.name}!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please select your cricket interest:
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleSelectInterest('Playing Cricket')}
                        disabled={loading}
                        className="flex flex-col items-center justify-center p-6 border-2 border-primary rounded-lg hover:bg-primary-light hover:border-primary-dark transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="mt-2 font-medium text-gray-900">Playing Cricket</span>
                        <span className="mt-1 text-xs text-gray-600">(Can write and read messages)</span>
                    </button>

                    <button
                        onClick={() => handleSelectInterest('Watching Cricket')}
                        disabled={loading}
                        className="flex flex-col items-center justify-center p-6 border-2 border-secondary rounded-lg hover:bg-secondary-light hover:border-secondary-dark transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="mt-2 font-medium text-gray-900">Watching Cricket</span>
                        <span className="mt-1 text-xs text-gray-600">(Can only read messages)</span>
                    </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>This will determine your access level in the chat room.</p>
                    <p className="mt-1">You can change this later from your profile.</p>
                </div>
            </div>
        </div>
    );
};

export default InterestSelection;