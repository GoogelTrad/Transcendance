import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookies } from "../App";
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext();

export const AuthProvider = ({children}) => 
{
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = getCookies('token');
        if (token)
            setIsAuthenticated(true);
    }, []);
    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => 
{
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
