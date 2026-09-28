import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('splitwise_token');
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('splitwise_token', res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success && res.token) {
      localStorage.setItem('splitwise_token', res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const sendLoginOtp = async (email, password) => {
    const res = await api.sendLoginOtp({ email, password });
    if (res.success) {
      return res;
    }
    throw new Error(res.message || 'Failed to send OTP code');
  };

  const verifyLoginOtp = async (email, otp) => {
    const res = await api.verifyLoginOtp({ email, otp });
    if (res.success && res.token) {
      localStorage.setItem('splitwise_token', res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Invalid verification code');
  };

  const logout = () => {
    localStorage.removeItem('splitwise_token');
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const demoLogin = async (email = 'demo@splitwise.com') => {
    return login(email, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, demoLogin, sendLoginOtp, verifyLoginOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
