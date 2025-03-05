import { useLocation } from 'react-router-dom';
import { useAuth } from '../users/AuthContext';
import React, {useEffect, useState} from "react";


function ProtectedRoute({ children }) {
    const { isAuthenticated, userInfo, refreshUserInfo } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated && !userInfo) {
            console.log('Rafraîchissement de userInfo suite à un changement de page:', location.pathname);
            refreshUserInfo();
        }
    }, [isAuthenticated, userInfo, refreshUserInfo, location.pathname]);

    return children;
}

export default ProtectedRoute;