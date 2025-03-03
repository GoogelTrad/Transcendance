import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserInfo, setToken } from '../instance/TokenInstance';
import axiosInstance from '../instance/AxiosInstance';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {

    const { tokenUser } = useUserInfo();
    const token = tokenUser;

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return Boolean(token);
    });

    useEffect(() => {
        const initializeToken = async () => {
            if (!token && isAuthenticated) {
                try {
                    const response = await axiosInstance.get('/api/user/get_token');
                    setToken(response.data.token);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.log('No token available yet:', error);
                    setIsAuthenticated(false); 
                    localStorage.removeItem('token');
                }
            } else if (token) {
                setIsAuthenticated(true);
            }
        };
        initializeToken();
    }, [isAuthenticated]); 

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
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