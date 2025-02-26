import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCookies } from '../App.js';
import { useAuth } from './AuthContext.js';
import axios from 'axios';
import axiosInstance from '../instance/AxiosInstance.js';
import { showToast } from '../instance/ToastsInstance';

function Logout() {
    const {setIsAuthenticated} = useAuth();

    const navigate = useNavigate();

    const logoutUser = async () => 
    {
        try 
        {
            const reponse = await axiosInstance.get(`/api/api/logout`)
            setIsAuthenticated(false);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur', error);
        }
        navigate('/home');
    }

    useEffect (() => 
    {
        logoutUser();
    }, []);

    return (
        <p>Coucou</p>
    );
};

export default Logout;