/**
 * AuthContext
 * Provides user + token state to the entire app.
 * Token is stored in localStorage for persistence across page refreshes.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('shastra_token'));
  const [loading, setLoading] = useState(true); // true while verifying token on mount

  // On mount: verify stored token is still valid
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Attach token to default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        // Token invalid or expired — clear it
        localStorage.removeItem('shastra_token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = data;

    localStorage.setItem('shastra_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('shastra_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const isANO = user?.role === 'ANO';
  const isSUO = user?.role === 'SUO';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isANO, isSUO }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
