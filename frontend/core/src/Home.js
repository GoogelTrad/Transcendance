import React, {useEffect, useState} from "react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


export function getCookie(name) {
    const value = document.cookie;
    const parts = value.match(`(?:\s|^)${name}=([^;]*);?`)[1];

    return parts
}


function Home()
{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect (() => 
    {
        const fetchUserData = async () => 
        {
            try 
            {
                const token = getCookie('token');
                if (token)
                {
                    const decodeToken = jwtDecode(token);
                    const reponse = await axios.get(`http://localhost:8000/api/user/${decodeToken.id}`, {
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    setUser(reponse.data);
                }
            }
            catch (error)
            {
                console.error('Erreur lors de la récupération des données utilisateur', error);
            }
            finally
            {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <div>
            <h1>HOME</h1>
            {user ? (
                <div>
                    <p>Nom : {user.name}</p>
                    <p>Email : {user.email}</p>
                </div>
            ) : (
                <p>Aucun utilisateur trouvé.</p>
            )}
        </div>
    );
}

export default Home;