import api from './api';

export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/me'),
};
