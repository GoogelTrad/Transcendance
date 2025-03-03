import { Navigate, useNavigate } from 'react-router-dom';
import { useUserInfo } from './TokenInstance';
import { AuthProvider, useAuth } from '../users/AuthContext';
import React, {useEffect, useState} from "react";


function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const { isAuthenticated, setIsAuthenticated } = useAuth();
	const { tokenUser } = useUserInfo();

	const checkToken = () => {
		const currentToken = tokenUser;
		
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

	const currentToken = tokenUser;
    if (!currentToken || typeof currentToken !== 'string') {
        return null;
    }

    return children;
}

export default ProtectedRoute;
