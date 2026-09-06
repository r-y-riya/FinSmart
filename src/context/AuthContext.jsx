import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

const DEMO_USER = {
  id: 'usr_demo_101',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@finsmart.io',
  avatar: 'AM',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastVisitedAt: new Date(Date.now() - (7 * 60 + 42) * 60 * 1000).toISOString(),
  token: 'demo_jwt_token',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finsmart_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_e) {
        return DEMO_USER;
      }
    }
    return DEMO_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('finsmart_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finsmart_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        const u = res.data.user;
        const loggedUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.name.slice(0, 2).toUpperCase(),
          lastVisitedAt: u.lastVisitedAt,
          preferences: u.preferences,
          token: res.data.token,
        };
        setUser(loggedUser);
        return loggedUser;
      }
    } catch (err) {
      console.warn('[AuthContext] Backend login error, falling back to local demo user:', err.message);
    }

    // Fallback if backend is booting or credentials are demo
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const localUser = {
      id: 'usr_' + Date.now(),
      name: formattedName,
      email,
      avatar: formattedName.slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastVisitedAt: new Date(Date.now() - (7 * 60 + 42) * 60 * 1000).toISOString(),
      token: 'local_jwt_token',
    };
    setUser(localUser);
    return localUser;
  };

  const loginDemo = async () => {
    try {
      const res = await authApi.login('arjun.mehta@finsmart.io', 'password123');
      if (res.success && res.data) {
        const u = res.data.user;
        const demoLogged = {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: 'AM',
          lastVisitedAt: u.lastVisitedAt,
          preferences: u.preferences,
          token: res.data.token,
        };
        setUser(demoLogged);
        return demoLogged;
      }
    } catch (e) {
      console.warn('[AuthContext] Using local DEMO_USER fallback');
    }
    setUser(DEMO_USER);
    return DEMO_USER;
  };

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register(name, email, password);
      if (res.success && res.data) {
        const u = res.data.user;
        const newUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.name.slice(0, 2).toUpperCase(),
          lastVisitedAt: u.lastVisitedAt,
          preferences: u.preferences,
          token: res.data.token,
        };
        setUser(newUser);
        return newUser;
      }
    } catch (err) {
      console.warn('[AuthContext] Backend register error:', err.message);
    }

    const fallbackUser = {
      id: 'usr_' + Date.now(),
      name: name.trim() || 'Investor',
      email,
      avatar: (name.trim() || 'IN').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastVisitedAt: new Date(Date.now() - (7 * 60 + 42) * 60 * 1000).toISOString(),
      token: 'local_jwt_token',
    };
    setUser(fallbackUser);
    return fallbackUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateLastVisited = async (timestamp) => {
    const ts = timestamp || new Date().toISOString();
    try {
      await authApi.updateLastVisited(ts);
    } catch (e) {
      // Graceful fallback
    }
    setUser(prev => prev ? { ...prev, lastVisitedAt: ts } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginDemo,
        register,
        logout,
        updateLastVisited,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
