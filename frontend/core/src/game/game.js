import './game.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import useSocket from '../socket'

const Games = () => {
    const [game, setGame] = useState(null);
    const { id } = useParams();
    const [score1, setScore1] = useState('');
    const [score2, setScore2] = useState('');
    const [player2, setPlayer2] = useState('');
    const navigate = useNavigate();
    const [isEditingPlayer2, setIsEditingPlayer2] = useState(false);
    const init = 120;
    const [TimeIsOver, setTimeIsOver] = useState(false);
    const [update_time, setupdateTime] = useState(init);
    const timerRef = useRef(init);
    const token = getCookies('token');

    const fetch_data = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/game/fetch_data/${id}/` , {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            setGame(response.data);
        } catch (error) {
            console.error("Error fetching game by ID:", error);
        }
    };

    const update_game = async () => {
        try {
            await axios.patch(`http://localhost:8000/game/fetch_data/${id}/`, { ...game }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
            )
        } catch (error) {
            console.error("Error fetching game by ID:", error);
        }
    };

    const handleScoreChange = (player, e) => {
        if (player === game.player1) {
            setScore1(e.target.value);
        }
        else if (player === game.player2) {
            setScore2(e.target.value);
        }


    };

    const submitScore = (player) => {
        if (player === game.player1) {
            const newScore = (parseInt(game?.score1, 10) || 0) + parseInt(score1, 10);
            const updatedGame = { ...game, score1: newScore };
            setGame(updatedGame);
            setScore1('');
        }
        else if (player === game.player2) {
            const newScore = (parseInt(game?.score2, 10) || 0) + parseInt(score2, 10);
            const updatedGame = { ...game, score2: newScore };
            setGame(updatedGame);
            setScore2('');
        }

    };

    const namePlayer2 = (e) => {
        setGame({ ...game, player2: e.target.value });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            setIsEditingPlayer2(true);
            setPlayer2(game.player2);
        }
    };

    const handleStat = async () => {
        game.winner = game.score1 > game.score2 ? game.player1 : game.player2;
        game.loser = game.score1 < game.score2 ? game.player1 : game.player2;
        game.time = update_time;
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        await update_game();
        navigate(`/games_pong/${id}`, { state: { game } });
    };

    useEffect(() => {
        fetch_data();
        timerRef.current = setInterval(() => {
            setupdateTime((prevTime) => {
                if (prevTime === 0) {
                    clearInterval(timerRef.current);
                    setTimeIsOver(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    if (!game) {
        return <div>Loading...</div>;
    }

    return (
        <div className="games-container container-fluid">
            {!TimeIsOver ? (
                <>
                    <h1 className="position-absolute title text-center text-white title-overlay w-100">PLAY</h1>
                    <h1 className="position-absolute title text-center text-white title-overlay w-100" style={{ top: "150px" }} >{update_time}</h1>
                    <div className="d-flex justify-content-center align-items-center w-100 h-100">
                        <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
                            <h3>{game?.player1 || 'Player 1'}</h3>
                            <p>{game?.score1}</p>
                            <div>
                                <input
                                    type="number"
                                    value={score1}
                                    onChange={(e) => handleScoreChange(game?.player1, e)}
                                    placeholder="Enter score"
                                />
                                <Button onClick={() => submitScore(game?.player1)}>Submit Score</Button>
                            </div>
                        </div>

                        <div style={{ borderLeft: "2px dashed #ccc", height: "100%", margin: "0 30px" }}></div>
                        <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
                            <h3>{game?.player2 || 'Player 2'}</h3>
                            {!isEditingPlayer2 ? (
                                <input
                                    type="text"
                                    value={game.player2 || ''}
                                    onChange={namePlayer2}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter name"
                                />
                            ) : null}
                            <p>{game?.score2}</p>
                            <div>
                                <input
                                    type="number"
                                    value={score2}
                                    onChange={(e) => handleScoreChange(game?.player2, e)}
                                    placeholder="Enter score"
                                />
                                <Button onClick={() => submitScore(game?.player2)}>Submit Score</Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : <h1 className="position-absolute d-flex justify-content-center align-items-center w-100 h-100">TIME OUT</h1>}
            <div className="position-absolute w-100 d-flex justify-content-center" style={{ bottom: "20px" }}>
                <Button
                    className="btn btn-primary"
                    onClick={handleStat}
                >
                    STAT
                </Button>
            </div>
        </div>
    );
};


function Game() {
    const [game, setGame] = useState('');
    const { id } = useParams();
    const token = getCookies('token');

    

    const fetch_data = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/game/fetch_data/${id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            setGame(response.data);
        } catch (error) {
            console.error("Error fetching game by ID:", error);
        }
    };

     useEffect(() => {
         fetch_data();
     }, []);

    /*const handleSubmit = async (e) => {
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
    };*/

    return (
        <div>
            <div className="games-container container-fluid">
                <h1 className="position-absolute title text-center text-white title-overlay w-100">STAT</h1>
                <h1 className="position-absolute title text-center text-white title-overlay w-100" style={{ top: "120px" }}>TIME : {game?.time}</h1>
                <div className="d-flex justify-content-center align-items-center w-100 h-100">
                    <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
                        <p> Player1 : {game?.player1}</p>
                        <p> Score1 : {game?.score1} </p>
                        <h2 className="position-absolute title text-center text-white title-overlay w-100" style={{ bottom: "120px" }} >WINNER : {game?.winner}</h2>
                    </div>
                    <div style={{ borderLeft: "2px dashed #ccc", height: "100%", margin: "0 30px" }}></div>
                    <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
                        <p> Player 2 : {game?.player2} </p>
                        <p> Score2 : {game?.score2} </p>
                        <h2 className="position-absolute title text-center text-white title-overlay w-100 " style={{ bottom: "120px" }} >Loser : {game?.loser}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Game, Games }; 