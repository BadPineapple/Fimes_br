import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL da tua API Node
});

// Intercetor para injetar o token em todos os pedidos
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Formato esperado pelo teu middleware
  }
  return config;
});

export default api;