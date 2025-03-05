import './Home_game.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../instance/AxiosInstance";
import { useAuth } from '../users/AuthContext';

function HomeGame({ setModalStats, setModalCreateTournament, setModalTournament, launching, setParentItems, setParentNumberPlayer }) {
    const [player1, setPlayer1] = useState("");
    const [waitingForPlayer, setWaitingForPlayer] = useState(false);
    const [send_Info, setSend_Info] = useState(true);
    const [onClickPlay, setOnClickPlay] = useState(false);
    const [onClickTournament, setOnClickTournament] = useState(false);
    const [onClickStats, setOnClickStats] = useState(false);
    const [onClickJoin, setOnClickJoin] = useState(false);
    const [onClickCreate, setOnClickCreate] = useState(false);
    const [gameCode, setGameCode] = useState("");
    const [numberPlayer, setNumberPlayer] = useState(2);
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [socket, setSocket] = useState(null);

    const [items, setItems] = useState([
        { name: 'profile', active: false },
        { name: 'collect', active: false },
        { name: 'global', active: false },
        { name: 'All games', active: false },
        { name: 'Win', active: false },
        { name: 'Lose', active: false },
        { name: 'Tournament', active: false },
    ]);
    
    const { userInfo } = useAuth();
    let user = userInfo;

    useEffect(() => {
        if (!socket && waitingForPlayer) {
            const newSocket = new WebSocket(`${process.env.REACT_APP_SOCKET_IP}ws/matchmaking/`);
            setSocket(newSocket);

            newSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("join : ", data);
                if (data.game_id) {
                    setGame(data);
                    navigate(`/game/${data.game_id}`);
                }
            };
            newSocket.onclose = () => {
                console.log("Matchmaking webSocket closed");
            };
            newSocket.onopen = () => {
                console.log("Matchmaking websocket open");
            };
        }
        if (waitingForPlayer === false) {
            if (socket) {
                socket.close();
                setSocket("");
            }
        }
        return () => {
            if (socket) {
                socket.close();
                setSocket("");
            }
        };
    }, [socket, waitingForPlayer]);

    useEffect(() => {
        if (user && user.name) {
            setPlayer1(user.name);
        }
    }, [user]);

    const handleClickStats = (stats, optionStats) => {
        const itemsActiv = items.map(item => ({
            ...item,
            active: item.name === stats || item.name === optionStats,
        }));
        setItems(itemsActiv);
        setParentItems(itemsActiv);
        setModalStats(true);
        launching({ newLaunch: 'stats', setModal: setModalStats });
    };

    const handleMenuClick = (menu) => {
        setOnClickPlay(menu === "play" ? !onClickPlay : false);
        setOnClickTournament(menu === "tournament" ? !onClickTournament : false);
        setOnClickStats(menu === "stats" ? !onClickStats : false);
    };

    const fetchDataTournament = async () => {
        try {
            const response = await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${gameCode}/`);
            setTournament(response.data);
            return 0;
        } catch (error) {
            console.log("Error fetching tournament by code:", error);
            return 1;
        }
    };

    const handleClickTournament = async (name) => {
        if (name === "create") {
            setParentNumberPlayer(numberPlayer);
            setModalCreateTournament(true);
            launching({ newLaunch: 'createTournament', setModal: setModalCreateTournament });
        } else if (name === "join") {
            const fonction_return = await fetchDataTournament();
            if (fonction_return === 0) {
                console.log("code", gameCode);
                navigate(`/games/tournament/${gameCode}` , { state: { makeTournament: true } });
            }
        }
    };

    const StartGameSolo = async () => {
        try {
            const response = await axiosInstance.post(`/api/game/create_game`, { player1 });
            navigate(`/game/${response.data.id}`);
        } catch (error) {
            console.log("Error submitting Player:", error);
        }
    };

    useEffect(() => {
        const trySendMessage = () => {
            if (socket && socket.readyState === WebSocket.OPEN && send_Info) {
                socket.send(JSON.stringify({ type: 'join' }));
                setSend_Info(false);
                console.log("Message sent successfully!");
            } else {
                console.log("Socket is not open, retrying...");
            }
        };

        let retryInterval;

        if (waitingForPlayer && socket && send_Info) {
            retryInterval = setInterval(() => {
                trySendMessage();
            }, 1000);
        }

        return () => {
            if (retryInterval) {
                clearInterval(retryInterval);
            }
        };
    }, [socket, waitingForPlayer, send_Info]);

    const Matchmaking = () => {
        setWaitingForPlayer(true);
        setSend_Info(true);
    };

    const exitWait = () => {
        setWaitingForPlayer(false);
        if (socket) {
            socket.send(JSON.stringify({ type: 'leave' }));
        }
    };
    return (
        !waitingForPlayer ? (
            <div className="game-home w-100 h-100">
                <div className="content-wrapper">
                    <div className="column-left">
                        <div className="d-flex flex-column mb-3 h-100">
                            <div className="p-2" onClick={() => handleMenuClick("play")}>
                                <span className="arrow">►</span> PLAY <span className="tilde">_</span>
                            </div>
                            <div className="p-2" onClick={() => handleMenuClick("tournament")}>
                                <span className="arrow">►</span> TOURNAMENT <span className="tilde">_</span>
                            </div>
                            <div className="p-2" onClick={() => handleMenuClick("stats")}>
                                <span className="arrow">►</span> STATS <span className="tilde">_</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-right">
                        {onClickPlay && (
                            <div className="content">
                                <h3 style={{ textAlign: "center" }} onClick={() => handleMenuClick("play")}>Play</h3>
                                <div className="line" onClick={() => StartGameSolo()}> 1 player </div>
                                <div className="line" onClick={() => Matchmaking()}> 2 players - Online </div>
                                <div className="line" onClick={() => StartGameSolo()}> 2 players - Local </div>
                            </div>
                        )}
                        {onClickTournament && (
                            <div className="content">
                                <h3 onClick={() => handleMenuClick("tournament")}>Tournament Section</h3>
                                <div className="section-tournament w-100">
                                    <div className="tournament-item d-flex flex-direction column w-100 h-70" onClick={() => setOnClickJoin((prev) => !prev)}>
                                        <span>Join a game</span>
                                        {onClickJoin && (
                                            <div className="h-100 w-100">
                                                <input
                                                    type="text"
                                                    className="input-code"
                                                    placeholder="Code"
                                                    value={gameCode}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setGameCode(e.target.value.replace(/\D/g, ""))}
                                                />
                                                <button onClick={() => handleClickTournament("join")}> ✅ </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="tournament-item d-flex flex-direction column w-100 h-30" onClick={() => setOnClickCreate((prev) => !prev)}>
                                        <span>Create game</span>
                                        {onClickCreate && (
                                            <div style={{ fontSize: 12, marginTop: "8%" }}>
                                                <span>Number of players:</span>
                                                <select
                                                    className="input-players"
                                                    value={numberPlayer}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setNumberPlayer(e.target.value)}
                                                >
                                                    <option value="2">2 players</option>
                                                    <option value="4">4 players</option>
                                                </select>
                                                <button onClick={() => handleClickTournament("create")}> ✅ </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {onClickStats && (
                            <div className="content">
                                <h3 className="game-home-stats-title" onClick={() => handleMenuClick("stats")}>Stats</h3>
                                <div className="text-stats">
                                    <div className="stats-item" onClick={() => handleClickStats('profile', '...')}>Global Stats</div>
                                    <div className="stats-item" onClick={() => handleClickStats('global', '...')}>Stats game</div>
                                    <div className="item">
                                        <div className="stats-subitem" onClick={() => handleClickStats('global', 'All games')}>► All games</div>
                                        <div className="stats-subitem" onClick={() => handleClickStats('global', 'Win')}>► Win</div>
                                        <div className="stats-subitem" onClick={() => handleClickStats('global', 'Lose')}>► Lose</div>
                                        <div className="stats-subitem" onClick={() => handleClickStats('global', 'Tournament')}>► Tournament</div>
                                    </div>
                                    <div className="stats-item" onClick={() => handleClickStats('collect', '...')}>Collection</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="waiting h-100 w-100">
                <h2 className="wait_text"> Waiting for Player...</h2>
                <div className="line" onClick={() => exitWait()}> EXIT </div>
            </div>
        )
    );
}

export default HomeGame;