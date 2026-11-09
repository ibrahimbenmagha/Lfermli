import axios, { AxiosInstance } from 'axios';

// Utilisation de la variable d'environnement ou fallback local
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Intercepteur pour éviter tout dédoublement accidentel du préfixe '/api/'
axiosInstance.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('/api/')) {
      config.url = config.url.substring(4); // Supprime '/api'
    } else if (config.url.startsWith('api/')) {
      config.url = config.url.substring(3); // Supprime 'api'
    }
  }
  return config;
});

export default axiosInstance;
