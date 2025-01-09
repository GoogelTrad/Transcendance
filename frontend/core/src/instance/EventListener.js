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
            const token = getCookies('token');
			try {
				const response = await axiosInstance.get(`/api/user/${getJwt(token).id}`);
			}
			catch(error) {
				showToast('error', error);
			}
            // if ((!token || typeof token !== 'string') && isAuthenticated === true) {
            //     console.log('Token expired or invalid, redirecting to login...');
            //     setIsAuthenticated(false);
            //     navigate('/login');
            // }
        };

        // const handleUserInteraction = () => validateToken();
        // document.addEventListener('click', handleUserInteraction);

        const interval = setInterval(() => {
            validateToken();
        }, 600000000);

        return () => {
            // document.removeEventListener('click', handleUserInteraction);
            clearInterval(interval);
        };
    }, [navigate, setIsAuthenticated]);
}

export default useTokenValidation;