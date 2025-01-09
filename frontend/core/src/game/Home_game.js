import './Home_game.css'
import '../Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axios from 'axios';
import Template from '../Template.js';

function Home_game() {
    const [player1, setPlayer1] = useState("");
    const navigate = useNavigate();

    const token = getCookies('token');
    const user = jwtDecode(token);

    useEffect(() => {
        if (user && user.name) {
            setPlayer1(user.name);
        }
    }, [user]);

    const submitPlayer = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/game/create_game`, { player1 }, { 
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            console.log(response.data);
            navigate(`/games/${response.data.id}`);
        } catch (error) {
            console.error("Error submitting Player:", error);
        }
    };

    return (
        <Template>
            <div className="content">
                <h1>Bienvenue dans Home Game</h1>
                <button onClick={submitPlayer}>Lancer le jeu</button>
            </div>
        </Template>
    );
};

export default Home_game;
