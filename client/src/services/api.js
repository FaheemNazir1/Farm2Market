import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (response) => {
    // Return the full response data
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Return the full error structure for better debugging
    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      response: error.response?.data,
      originalError: error
    });
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/users/change-password', { currentPassword, newPassword }),
};

// Users API
export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  getPublicProfile: (userId) => api.get(`/users/${userId}/public`),
  searchUsers: (params) => api.get('/users/search', { params }),
};

// Crops API
export const cropsAPI = {
  getCrops: (params) => api.get('/crops', { params }),
  getCrop: (id) => api.get(`/crops/${id}`),
  createCrop: (cropData) => {
    // Handle FormData for file uploads
    const config = cropData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.post('/crops', cropData, config);
  },
  updateCrop: (id, cropData) => {
    // Handle FormData for file uploads
    const config = cropData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.put(`/crops/${id}`, cropData, config);
  },
  deleteCrop: (id) => api.delete(`/crops/${id}`),
  getMyCrops: (params) => api.get('/crops/farmer/my-crops', { params }),
  toggleFavorite: (id) => api.post(`/crops/${id}/favorite`),
  getCategories: () => api.get('/crops/categories'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getInvoice: (id) => api.get(`/orders/${id}/invoice`),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  addRating: (id, ratingData) => api.post(`/orders/${id}/rating`, ratingData),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (paymentData) => api.post('/payments/create-payment-intent', paymentData),
  confirmPayment: (paymentData) => api.post('/payments/confirm-payment', paymentData),
  processCOD: (orderId) => api.post('/payments/cod', { orderId }),
  getPaymentMethods: () => api.get('/payments/methods'),
  // UPI Payment APIs
  createUPIOrder: (orderData) => api.post('/payments/upi/create-order', orderData),
  verifyUPIPayment: (verificationData) => api.post('/payments/upi/verify', verificationData),
  simulateUPIPayment: (paymentData) => api.post('/payments/upi/simulate', paymentData),
};

export default api;
