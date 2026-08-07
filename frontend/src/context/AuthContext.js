import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

      try {
        const response = await axios.get(`${API_URL}/api/auth/me`);
        setToken(storedToken);
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth initialization error:', error.response?.data);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });
      const { token: newToken, user: loggedInUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(loggedInUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });
      const { token: newToken, user: registeredUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(registeredUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await axios.put(`${API_URL}/api/auth/password`, {
        userId: user?.id,
        oldPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};