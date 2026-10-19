import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('imovies_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySavedSession = async () => {
      const savedToken = localStorage.getItem('imovies_token');
      if (savedToken) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('imovies_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySavedSession();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('imovies_token', receivedToken);
    localStorage.setItem('imovies_user', JSON.stringify(receivedUser));
    return res.data;
  };

  const register = async (name, email, password, role = 'user') => {
    const res = await API.post('/auth/register', { name, email, password, role });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('imovies_token', receivedToken);
    localStorage.setItem('imovies_user', JSON.stringify(receivedUser));
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
