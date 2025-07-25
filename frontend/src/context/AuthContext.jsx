import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/auth';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  // State to store the current user
  const [user, setUser] = useState(null);
  // State to indicate if auth is loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user and token are stored in localStorage
    const storedUser = localStorage.getItem('wealthflow_user');
    const token = localStorage.getItem('wealthflow_token');

    console.log('[AuthContext] Loaded from localStorage:', { storedUser, token });

    // Function to verify user by checking token validity
    const verifyUser = async () => {
      if (storedUser && token) {
        try {
          // Verify token validity by fetching user profile
          const userData = await getUserProfile();
          setUser(userData);
          console.log('[AuthContext] Verified user profile:', userData);
        } catch (error) {
          // If token is invalid, clear localStorage and reset user
          localStorage.removeItem('wealthflow_user');
          localStorage.removeItem('wealthflow_token');
          setUser(null);
          console.error('[AuthContext] Token verification failed:', error);
        }
      }
      // Set loading to false after verification
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Login user: set user state and store in localStorage
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('wealthflow_user', JSON.stringify(userData));
    localStorage.setItem('wealthflow_token', token);
    console.log('[AuthContext] User logged in:', userData, token);
  };

  // Logout user: clear user state and remove from localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('wealthflow_user');
    localStorage.removeItem('wealthflow_token');
    console.log('[AuthContext] User logged out');
  };

  // Update user: update user state and localStorage
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('wealthflow_user', JSON.stringify(userData));
    console.log('[AuthContext] User updated:', userData);
  };

  // Provide auth state and functions to children components
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};