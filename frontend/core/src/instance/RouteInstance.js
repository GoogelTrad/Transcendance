import { Navigate, useNavigate } from 'react-router-dom';
// import { getCookies } from '../App';
import { getCookies } from './TokenInstance';
import { AuthProvider, useAuth } from '../users/AuthContext';
import React, {useEffect, useState} from "react";


function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

	const checkToken = () => {
		const currentToken = getCookies('token');
		
		if (!currentToken || typeof currentToken !== 'string') {
			console.log('Invalid token, redirecting to login...');
			setIsAuthenticated(false);
			navigate('/home');
		} else {
			setIsAuthenticated(true);
		}
	};
    
	useEffect(() => {
        checkToken();
    }, [navigate, setIsAuthenticated]);

    const currentToken = getCookies('token');
    if (!currentToken || typeof currentToken !== 'string') {
        return null;
    }

    return children;
}

export default ProtectedRoute;
