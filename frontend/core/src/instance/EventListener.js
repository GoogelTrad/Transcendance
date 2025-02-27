import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookies } from '../App';
import { useAuth } from '../users/AuthContext';
import axiosInstance from './AxiosInstance';
import useJwt from './JwtInstance';
import { showToast } from './ToastsInstance';

function useTokenValidation() {
    const navigate = useNavigate();
	const getJwt = useJwt();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    useEffect(() => {
        const validateToken = async () => {
            if (isAuthenticated) 
            {
                const token = getCookies('token');
                try {
                    const response = await axiosInstance.get(`/api/token/${token}`);
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
        }, 5000000000);

        return () => {
            clearInterval(interval);
        };
    }, [navigate, setIsAuthenticated, isAuthenticated]);
}

export default useTokenValidation;