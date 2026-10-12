import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session is strictly scoped to sessionStorage so fresh browser sessions start at login
    const token = sessionStorage.getItem('fleet_token');
    const savedUser = sessionStorage.getItem('fleet_user');

    // Purge any legacy localStorage tokens from prior development/testing
    localStorage.removeItem('fleet_token');
    localStorage.removeItem('fleet_user');

    if (token && savedUser) {
      if (isTokenExpired(token)) {
        // Expired token: clear session
        sessionStorage.removeItem('fleet_token');
        sessionStorage.removeItem('fleet_user');
        setUser(null);
      } else {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        } catch (e) {
          sessionStorage.removeItem('fleet_token');
          sessionStorage.removeItem('fleet_user');
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.success && res.data) {
      const userData = res.data;
      // Store strictly in sessionStorage for the active session
      sessionStorage.setItem('fleet_token', userData.token);
      sessionStorage.setItem('fleet_user', JSON.stringify(userData));
      localStorage.removeItem('fleet_token');
      localStorage.removeItem('fleet_user');
      setUser(userData);
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    sessionStorage.removeItem('fleet_token');
    sessionStorage.removeItem('fleet_user');
    localStorage.removeItem('fleet_token');
    localStorage.removeItem('fleet_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
