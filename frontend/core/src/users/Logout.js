import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCookie } from '../Home';
import axios from 'axios';



function Logout() {
    const navigate = useNavigate();

    console.log("j'essaie de partir");

    useEffect (() => 
        {
            const fetchUserData = async () => 
            {
                try 
                {
                    const token = getCookie('token');
                    const reponse = await axios.get(`http://localhost:8000/api/logout`, {
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    alert('deco');
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