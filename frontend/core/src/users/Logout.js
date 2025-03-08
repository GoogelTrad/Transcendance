import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './AuthContext.js';
import axios from 'axios';
import axiosInstance from '../instance/AxiosInstance.js';
import { showToast } from '../instance/ToastsInstance';

function Logout() {
    const { logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/home');
    };

    useEffect (() => 
    {
        handleLogout();
    }, []);
};

export default Logout;