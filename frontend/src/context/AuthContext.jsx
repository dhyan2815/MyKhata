import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('wealthflow_user');
    const token = localStorage.getItem('wealthflow_token');

    const verifyUser = async () => {
      if (storedUser && token) {
        try {
          // Verify token validity by fetching user profile
          const userData = await getUserProfile();
          setUser(userData);
        } catch (error) {
          // If token is invalid, clear localStorage
          localStorage.removeItem('wealthflow_user');
          localStorage.removeItem('wealthflow_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Login user
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('wealthflow_user', JSON.stringify(userData));
    localStorage.setItem('wealthflow_token', token);
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('wealthflow_user');
    localStorage.removeItem('wealthflow_token');
  };

  // Update user
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('wealthflow_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};