import './game.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const Games = () => {
    const [scores, setScores] = useState([]);
    const [game, setGame] = useState(null);
    const [player1, setPlayer1] = useState("");
    const [score, setScore] = useState(0);

    const fetchScores = async (gameId) => {
        try {
            const response = await axios.get(`http://localhost:8000/game/fetch_data/${gameId}/`);
            setGame(response.data);
            console.log("Game data:", response.data);
        } catch (error) {
            console.error("Error fetching game by ID:", error);
        }
    };

    const submitScore = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/game/keep_score`, { player1, score, }, { 
                headers: {
                'Content-Type': 'application/json',
                }
            });
            console.log(response.data.id);
            fetchScores(response.data.id);
        } catch (error) {
            console.error("Error submitting score:", error);
        }
    };

    useEffect(() => {
        fetchScores();
    }, []); 

    return (
        <div>
            <h1>Game Scores</h1>
            <div>
                <input 
                    type="text" 
                    value={player1} 
                    onChange={(e) => setPlayer1(e.target.value)} 
                    placeholder="Enter player name"
                />
                <input 
                    type="number" 
                    value={score} 
                    onChange={(e) => setScore(e.target.value)} 
                    placeholder="Enter score"
                />
                <Button onClick={submitScore}>Submit Score</Button>
            </div>
            <div>
                {game ? (
                    <div>
                        <h2>Game Details</h2>
                        <p>Player 1: {game.player1}</p>
                        <p>Player 2: {game.player2}</p>
                        <p>Score: {game.score}</p>
                        <p>Winner: {game.winner}</p>
                    </div>
                ) : (
                    <p>Loading game details...</p>
                )}
            </div>
        </div>
    );
};

// Composant pour gérer l'envoi et la récupération du token
function Game() {
    const handleSubmit = async (e) => {
        try {
            const cookie = getCookies('token');
            if (cookie) {
                const decodeCookie = jwtDecode(cookie);
                console.log(decodeCookie.name);

                // Appel API avec authentification par token
                await axios.post('http://localhost:8000/game/gameDetails', {}, {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${cookie}`,
                    },
                    withCredentials: true,
                });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur', error);
        }

        try {
            const response = await axios.get('http://localhost:8000/game/gametest');
            console.log(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur', error);
        }
    };

    return (
        <div>
            <Button type='submit' className='test' onClick={handleSubmit}>Test</Button>
            <Link to={Games} className="text-decoration-none text-dark">SCORE</Link>
        </div>
    );
}

export { Game, Games };  // Exporter les deux composants pour les utiliser dans d'autres fichiers
