import axios from 'axios';

const axiosInstance = axios.create({baseURL: `${process.env.REACT_APP_API_URL}`,
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(

  (config) => {
      if (!config.headers['Content-Type']) 
          config.headers['Content-Type'] = 'application/json';
      return config;
  },
  (error) => {
    console.log("request error")
    Promise.reject(error)
  }
);

// axiosInstance.interceptors.response.use((response) => {
  
//   return response;
// }, (error) => {
//   if (error.status === 401)
//   {
//     if (localStorage.getItem('isAuthenticated') === 'true') navigate('/login');
//   }
// });

export default axiosInstance;
