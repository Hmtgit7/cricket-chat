import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Setup axios defaults when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }

        // Add this interceptor to ensure the Authorization header is set for all requests
        const interceptor = axios.interceptors.request.use(
            config => {
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        // Clean up interceptor on unmount
        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [token]);

    // Load user data on mount or token change
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/users/me`);
                setCurrentUser(response.data.user);
                setError(null);
            } catch (err) {
                console.error('Failed to load user:', err);
                setError('Authentication failed. Please login again.');
                setToken(null);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    // Register a new user
    const register = async (name, email, password) => {
        try {
            console.log("Registering user:", { name, email });
            const response = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password
            });

            console.log("Registration response:", response.data);
            setToken(response.data.token);
            setCurrentUser(response.data.user);
            setError(null);
            return response.data;
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            setToken(response.data.token);
            setCurrentUser(response.data.user);
            setError(null);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Update interest
    const updateInterest = async (interest) => {
        try {
            console.log("Updating interest to:", interest);
            const response = await axios.put(`${API_URL}/auth/update-interest`, {
                interest
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Interest update response:", response.data);
            setCurrentUser(response.data.user);
            setError(null);
            return response.data;
        } catch (err) {
            console.error("Interest update error:", err);
            const errorMessage = err.response?.data?.message || 'Failed to update interest';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Logout user
    const logout = async () => {
        try {
            if (token) {
                await axios.post(`${API_URL}/auth/logout`);
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setToken(null);
            setCurrentUser(null);
            setError(null);
        }
    };

    // Update profile
    const updateProfile = async (data) => {
        try {
            const response = await axios.put(`${API_URL}/users/profile`, data);

            setCurrentUser(response.data.user);
            setError(null);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const value = {
        currentUser,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateInterest,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;