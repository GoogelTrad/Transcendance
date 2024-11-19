import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCookies } from '../App.js';
import axios from 'axios';

function Logout() {
    // const {setIsAuthenticated} = useAuth();
    const navigate = useNavigate();

    useEffect (() => 
        {
            const fetchUserData = async () => 
            {
                try 
                {
                    const token = getCookies('token');
                    const reponse = await axios.get(`http://localhost:8000/api/logout`, {
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    alert('deco');
                    // setIsAuthenticated(false);
                }
                catch (error)
                {
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