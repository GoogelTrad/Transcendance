import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../users/AuthContext';
import { useEffect } from "react";


function ProtectedRoute({ children }) {
    const { isAuthenticated, userInfo, refreshUserInfo } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && !userInfo) {
            refreshUserInfo();
        }
        if (!isAuthenticated)
            navigate("/home");
    }, [isAuthenticated, userInfo, refreshUserInfo, location.pathname]);

    return children;
}

export default ProtectedRoute;