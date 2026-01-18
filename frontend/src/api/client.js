import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  getProfile: () => apiClient.get('/auth/profile'),
};

// Transaction endpoints
export const transactionAPI = {
  create: (data) => apiClient.post('/transactions', data),
  getAll: (page = 1, limit = 10, filters = {}) =>
    apiClient.get('/transactions', {
      params: { page, limit, ...filters },
    }),
  getById: (id) => apiClient.get(`/transactions/${id}`),
  update: (id, data) => apiClient.put(`/transactions/${id}`, data),
  delete: (id) => apiClient.delete(`/transactions/${id}`),
  getStats: () => apiClient.get('/transactions/stats'),
  getFlagged: () => apiClient.get('/transactions/flagged'),
  markLegitimate: (id) => apiClient.patch(`/transactions/${id}/legitimate`),
};

// Dashboard endpoints
export const dashboardAPI = {
  getSummary: () => apiClient.get('/dashboard/summary'),
};

// Utility endpoints
export const utilityAPI = {
  seedDemo: () => apiClient.post('/seed'),
};
