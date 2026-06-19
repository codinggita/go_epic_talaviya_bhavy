import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/api/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('go_epic_user');
    const storedToken = localStorage.getItem('go_epic_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user data', err);
        localStorage.removeItem('go_epic_user');
        localStorage.removeItem('go_epic_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      // The authService login stores user details in localStorage
      const userData = data.user || data.data?.user || data;
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await authService.updateProfile(profileData);
    const updatedUser = data.user || data.data?.user || user;
    setUser(prev => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('go_epic_token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
