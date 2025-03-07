import axiosInstance from '../instance/AxiosInstance';

const SetupInterceptors = (navigate) => {
    axiosInstance.interceptors.response.use((response) => {
  
        return response;
      }, (error) => {
        if (error.status === 401)
        {
            if (localStorage.getItem('isAuthenticated') === 'true')
            {
                localStorage.setItem("isAuthenticated", "false");
            } 
        }
      });
};

export default SetupInterceptors;