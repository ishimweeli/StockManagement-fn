// src/services/authService.js
import api from '../services/Api.js';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (username, password, email, role) => {
    const response = await api.post('/auth/register', {
      username,
      password,
      email,
      role
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUserProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  }
};