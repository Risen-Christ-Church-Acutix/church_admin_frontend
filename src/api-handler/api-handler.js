import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';
const apiUrl = isProduction
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_NON_PRODUCTION_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message;
    if (message === 'TokenExpired') {
      
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
