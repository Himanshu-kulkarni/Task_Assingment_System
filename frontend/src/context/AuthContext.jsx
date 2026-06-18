import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.getProfile();
      setUser(data);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    setError(null);
    const { data } = await authService.login(credentials);
    localStorage.setItem('access_token', data.access_token);
    const profile = await authService.getProfile();
    setUser(profile.data);
    return profile.data;
  };

  const register = async (userData) => {
    setError(null);
    const { data } = await authService.register(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authService.getProfile();
      setUser(data);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
