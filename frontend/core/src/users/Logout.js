import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCookies } from '../App.js';
import { useAuth } from './AuthContext.js';
import axios from 'axios';
import axiosInstance from '../instance/AxiosInstance.js';

function Logout() {
    const {isAuthenticated, setIsAuthenticated} = useAuth();

    const navigate = useNavigate();

    useEffect (() => 
        {
            const fetchUserData = async () => 
            {
                try 
                {
                    const reponse = await axiosInstance.get(`api/logout`)
                    setIsAuthenticated(false);
                }
                catch (error) {
                    console.error('Erreur lors de la récupération des données utilisateur', error);
                }
                navigate('/home');
            }
            fetchUserData();
        }, []);

    return (
        <p>Coucou</p>
    );
};

export default Logout;