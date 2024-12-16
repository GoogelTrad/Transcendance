import { Navigate, useNavigate } from 'react-router-dom';
import { getCookies } from '../App';
import { AuthProvider, useAuth } from '../users/AuthContext';
import React, {useEffect, useState} from "react";

function ProtectedRoute({ children }) {
	const navigate = useNavigate();
	const [token, setToken] = useState(getCookies('token'));
	const {isAuthenticated, setIsAuthenticated} = useAuth();

    useEffect(() => {
        const checkToken = () => {
            const currentToken = getCookies('token');
            setToken(currentToken);

            if (!currentToken) {
                setIsAuthenticated(false);
                navigate('/login');
            }
        };
        checkToken();
    }, [navigate, setIsAuthenticated]);

    return token ? children : null;
}

export default ProtectedRoute;
