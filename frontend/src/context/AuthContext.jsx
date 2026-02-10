import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

const API_URL = '/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');

      if (token && userInfo) {
        try {
          // Verify token with backend
          const response = await api.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          // Token is invalid or expired, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post(`${API_URL}/login`, { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post(`${API_URL}/register`, userData);
      const { token, ...newUserData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getToken,
    isAuthenticated: !!user,
    isOrganizer: user?.role === 'organizer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
