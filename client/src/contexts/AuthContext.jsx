import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session validity on boot
    const initAuth = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
            const { data } = await api.get('/auth/profile');
            const updatedUser = { ...parsed, ...data };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.error('[AuthContext] Session validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await api.post('/auth/register', { name, email, phone, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete api.defaults.headers.common['Authorization'];
  };

  const normalizeRole = (role) => {
    if (!role) return 'USER';
    const r = role.toUpperCase();
    if (r === 'ADMIN' || r === 'SUPER ADMIN') return 'ADMIN';
    if (r === 'BRANCH MANAGER' || r === 'BRANCH_MANAGER') return 'BRANCH_MANAGER';
    return 'USER';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, roleNormalized: normalizeRole(user?.role) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
