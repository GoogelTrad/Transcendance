import axiosInstance from '../instance/AxiosInstance';
import { showToast } from './ToastsInstance';

const SetupInterceptors = (navigate, setIsAuthenticated, t) => {
    axiosInstance.interceptors.response.use((response) => {
  
        return response;
      }, (error) => { 
        if (error.status === 401)
        {
            if (localStorage.getItem('isAuthenticated') === 'true')
            {
                localStorage.setItem("isAuthenticated", "false");
                setIsAuthenticated(false);
                showToast("error", t("TokenExpired"));
                navigate("/home");
            } 
        }
        return Promise.reject(error);
      });
};

export default SetupInterceptors;