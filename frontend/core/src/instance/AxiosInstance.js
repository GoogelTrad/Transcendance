import axios from 'axios';
import { getCookies } from '../App'; 

// Créer une instance axios
const axiosInstance = axios.create({baseURL: `http://${process.env.REACT_APP_API_URL}:8000`,
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
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;
