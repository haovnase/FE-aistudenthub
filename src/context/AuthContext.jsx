import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/auth.service';
import profileService from '../services/profile.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const initUserFromToken = async (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser({
        email: decoded.sub,
        role: decoded.role || decoded.authorities?.[0] || 'USER',
      });
      setIsAuthenticated(true);
      
      // Fetch full profile to get fullName, avatar, etc.
      try {
        const profile = await profileService.getProfile();
        if (profile) {
          setUser(prev => ({ ...prev, ...profile }));
        }
      } catch (profileErr) {
        console.error('Failed to fetch user profile:', profileErr);
      }
    } catch (e) {
      console.error(e);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      initUserFromToken(token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const token = response.data?.token;
      if (token) {
         initUserFromToken(token);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const reloadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      if (profile) {
        setUser(prev => ({ ...prev, ...profile }));
      }
    } catch (profileErr) {
      console.error('Failed to reload user profile:', profileErr);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, reloadProfile }}>
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
