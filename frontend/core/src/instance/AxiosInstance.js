import axios from 'axios';
// import { getCookies } from '../App'; 
import { getCookies, setToken } from './TokenInstance';

// Créer une instance axios
const axiosInstance = axios.create({baseURL: `${process.env.REACT_APP_API_URL}`,
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(
  (config) => {
      const token = getCookies('token');
      if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
      }
      if (!config.headers['Content-Type']) 
          config.headers['Content-Type'] = 'application/json';
      return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
      if (response.data && response.data.token) {
          setToken(response.data.token);
      }
      return response;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
