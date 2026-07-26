import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const defaultAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
};

const AuthContext = createContext(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agrishield_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agrishield_token') || null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const fetchFreshProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('agrishield_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Session verification error:', err);
        // Do not force clear on offline network error, only on 401
        if (err.response && err.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFreshProfile();
  }, [token, apiUrl]);

  const login = (newToken, userData) => {
    localStorage.setItem('agrishield_token', newToken);
    localStorage.setItem('agrishield_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(`${apiUrl}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('agrishield_token');
      localStorage.removeItem('agrishield_user');
      setToken(null);
      setUser(null);
      window.location.href = '/'; // Return to Home page per prompt requirements
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('agrishield_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
