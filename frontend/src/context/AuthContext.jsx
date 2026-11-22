import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, getAuthToken } from '../services/api.js';

const AuthContext = createContext();

export const DEMO_USERS = [
  {
    roleName: 'Paramedic (AMB-01)',
    email: 'paramedic1@smartpulse.io',
    password: 'Paramedic@1234',
    badge: 'Ambulance Operator',
    color: 'bg-emerald-600',
  },
  {
    roleName: 'Apollo ER Staff',
    email: 'apollo@smartpulse.io',
    password: 'Hospital@1234',
    badge: 'Hospital Staff',
    color: 'bg-blue-600',
  },
  {
    roleName: 'Civil ER Staff',
    email: 'civil@smartpulse.io',
    password: 'Hospital@1234',
    badge: 'Hospital Staff',
    color: 'bg-indigo-600',
  },
  {
    roleName: 'System Admin',
    email: 'admin@smartpulse.io',
    password: 'Admin@1234',
    badge: 'Central Dispatcher',
    color: 'bg-purple-600',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.warn('Failed to restore session:', err.message);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const quickLogin = async (email, password) => {
    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
