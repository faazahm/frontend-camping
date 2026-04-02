import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-camping-production.up.railway.app',
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyertakan token (jika ada)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Pastikan tidak ada kutipan ganda jika token tersimpan sebagai string JSON
      const cleanToken = token.replace(/['"]+/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
