import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from '../instance/AxiosInstance';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const login = async () => {
        try {
            const checkResponse = await axiosInstance.get('/api/user/check_auth');

            if (checkResponse.data.isAuthenticated) {
                const userResponse = await axiosInstance.get('/api/user/fetch_user_data');
                setUserInfo(userResponse.data.payload);
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
                return true;
            } else {
                throw new Error('Utilisateur non authentifié après login');
            }
        } catch (err) {
            setIsAuthenticated(false);
            localStorage.setItem('isAuthenticated', 'false');
            return false;
        }
    };

    const refreshUserInfo = async () => {
        if (!isAuthenticated) {
            return;
        }

        try {
            const userResponse = await axiosInstance.get('/api/user/fetch_user_data');
            setUserInfo(userResponse.data.payload);
        } catch (err) {
            console.log('Erreur lors du rafraîchissement de userInfo:', err);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const authenticated = await login();
            if (authenticated) {
                await refreshUserInfo();
                setIsAuthenticated(true);
                localStorage.setItem('isAuthenticated', 'true');
            } else {
                setIsAuthenticated(false);
                localStorage.setItem('isAuthenticated', 'false');
                setUserInfo(null);
            }
        };
        initializeAuth();

        const handleStorageChange = (event) => {
            if (event.key === 'isAuthenticated' && event.newValue === 'true') {
                login(); 
            }
            else if (event.key === 'isAuthenticated' && event.newValue === 'false') {
                logout(); 
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated]);

    const logout = async () => {
        try {
            await axiosInstance.get('/api/user/logout');
        } catch (err) {
            console.log('Erreur lors de la déconnexion API', err);
        }

        setUserInfo(null);
        setIsAuthenticated(false);
        localStorage.setItem('isAuthenticated', 'false');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userInfo, logout, login, refreshUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
