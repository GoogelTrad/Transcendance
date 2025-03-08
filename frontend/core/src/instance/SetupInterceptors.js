import axiosInstance from '../instance/AxiosInstance';

const SetupInterceptors = (navigate, setIsAuthenticated) => {
    axiosInstance.interceptors.response.use((response) => {
  
        return response;
      }, (error) => { 
        if (error.status === 401)
        {
            if (localStorage.getItem('isAuthenticated') === 'true')
            {
                localStorage.setItem("isAuthenticated", "false");
                setIsAuthenticated(false);
                navigate("/home");
            } 
        }
        return Promise.reject(error);
      });
};

export default SetupInterceptors;