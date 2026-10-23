import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/admin/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const doctorLogin = async (doctorId, password) => {
    const { data } = await API.post('/auth/doctor-login', { doctorId, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await API.post('/auth/register', { name, email, phone, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setNotifications([]);
  };

  const updateDeliveryAddress = async (addressData) => {
    const { data } = await API.put('/auth/address', addressData);
    setUser(prev => ({ ...prev, deliveryAddress: data.deliveryAddress }));
    return data;
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData);
    setUser(prev => ({ ...prev, name: data.name, phone: data.phone }));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        notifications,
        login,
        doctorLogin,
        register,
        logout,
        updateDeliveryAddress,
        updateProfile,
        fetchCurrentUser,
        fetchNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
