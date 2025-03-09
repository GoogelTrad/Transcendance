import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from '../instance/AxiosInstance';

import { showToast } from "../instance/ToastsInstance";
import { useTranslation } from 'react-i18next';



const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { t } = useTranslation();
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
                showToast("error", t('ToastsError'));
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
            console.log(userInfo)
        } catch (err) {
            showToast("error", t('ToastsError'));
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
        console.log('coucou');
        try {
            await axiosInstance.get('/api/user/logout');
        } catch (err) {
            showToast("error", t('ToastsError'));
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
