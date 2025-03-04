import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../users/AuthContext';
import { useNavigate } from 'react-router-dom';

function useJwt() {
    const navigate = useNavigate();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    const decodeToken = (token) => {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const getJwt = (token) => {
        if (!token || typeof token !== 'string') {
            if (isAuthenticated) {
                console.log('Token expired or invalid, redirecting to login...');
                setIsAuthenticated(false);
                navigate('/home');
            }
            return null;
        }

        const decodedToken = decodeToken(token);
        if (!decodedToken) {
            setIsAuthenticated(false);
            navigate('/home');
        }
        return decodedToken;
    };

    return getJwt;
}

export default useJwt;
