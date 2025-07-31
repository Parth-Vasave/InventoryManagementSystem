import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
};

export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  updateStock: (id, data) => api.patch(`/api/products/${id}/stock`, data),
  getReorderAlerts: () => api.get('/api/products/alerts/reorder'),
};

export const suppliersAPI = {
  getAll: (params) => api.get('/api/suppliers', { params }),
  getById: (id) => api.get(`/api/suppliers/${id}`),
  create: (data) => api.post('/api/suppliers', data),
  update: (id, data) => api.put(`/api/suppliers/${id}`, data),
  delete: (id) => api.delete(`/api/suppliers/${id}`),
  getPerformance: (id) => api.get(`/api/suppliers/${id}/performance`),
};

export const ordersAPI = {
  getAll: (params) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', data),
  updateStatus: (id, data) => api.patch(`/api/orders/${id}/status`, data),
  autoReorder: () => api.post('/api/orders/auto-reorder'),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getInventory: () => api.get('/api/analytics/inventory'),
  getOrders: (params) => api.get('/api/analytics/orders', { params }),
  getForecast: (params) => api.get('/api/analytics/forecast', { params }),
};

export const demoAPI = {
  simulateDay: () => api.post('/api/demo/simulate-day'),
  simulateWeek: () => api.post('/api/demo/simulate-week'),
};

export default api;