import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserInfo } from './TokenInstance';
import { useAuth } from '../users/AuthContext';
import axiosInstance from './AxiosInstance';
import useJwt from './JwtInstance';
import { showToast } from './ToastsInstance';

function useTokenValidation() {
    const navigate = useNavigate();
	const getJwt = useJwt();
    const { isAuthenticated, setIsAuthenticated } = useAuth();
    const { tokenUser } = useUserInfo();

    useEffect(() => {
        const validateToken = async () => {
            if (isAuthenticated) 
            {
	            const token = tokenUser;
                try {
                    const response = await axiosInstance.get(`/api/user/token/${token}`);
                }
                catch(error) {
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    setIsAuthenticated(false);
                    navigate('/');
                }
            }
        };
        const interval = setInterval(() => {
            validateToken();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [navigate, setIsAuthenticated, isAuthenticated]);
}

export default useTokenValidation;