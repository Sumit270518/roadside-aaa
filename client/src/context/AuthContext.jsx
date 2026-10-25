import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data.user);
          setPartnerProfile(res.data.data.partnerProfile);
          initSocket(storedToken);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setPartnerProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, data } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(data.user);

      // Fetch partner profile if partner
      if (data.user.role === 'mechanic' || data.user.role === 'towing_partner') {
        try {
          const pRes = await api.get('/partners/me');
          if (pRes.data.success) setPartnerProfile(pRes.data.data);
        } catch (e) {
          console.warn('Partner profile fetch:', e.message);
        }
      }

      initSocket(receivedToken);
      return data.user;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token: receivedToken, data } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(data.user);
      initSocket(receivedToken);
      return data.user;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setPartnerProfile(null);
      disconnectSocket();
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setPartnerProfile(res.data.data.partnerProfile);
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partnerProfile,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
