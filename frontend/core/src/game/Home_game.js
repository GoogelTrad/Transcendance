import './Home_game.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate} from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axiosInstance from "../instance/AxiosInstance";

import { useTranslation } from 'react-i18next';

function HomeGame({setModalStats, setModalCreateTournament, setModalTournament, launching, setParentItems, setParentNumberPlayer}) {
    const [player1, setPlayer1] = useState("");
    const [waitingForPlayer, setWaitingForPlayer] = useState(false);
    const [send_Info, setSend_Info] = useState(true)
    const [onClickPlay, setOnClickPlay] = useState(false);
    const [onClickTournament, setOnClickTournament] = useState(false);
    const [onClickStats, setOnClickStats] = useState(false);
    const [onClickJoin, setOnClickJoin] = useState(false);
    const [onClickCreate, setOnClickCreate] = useState(false);
    const [gameCode, setGameCode] = useState("");
    const [numberPlayer, setNumberPlayer] =useState(2);
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [tournament, setTournament] = useState(null)
    const [joinTournament, setJoinTournament] = useState(false);
    const [socket, setSocket] = useState(null);
    const [socketTournament, setSocketTournament] = useState(null);

    const { t } = useTranslation();

    const [items, setItems] = useState([
        { name: 'profile', active: false },
        { name: 'collect', active: false },
        { name: 'global', active: false },
        { name: 'All games', active: false },
        { name: 'Friends', active: false },
        { name: 'Win', active: false },
        { name: 'Lose', active: false },
        { name: 'Tournament', active: false},
    ]);
    
    const token = getCookies('token');
    let user = null;

    if (token) {
        try {
            user = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    };

       useEffect(() => {
            if (joinTournament && !socketTournament) {
                const newSocket = new WebSocket(`ws://${window.location.hostname}:8000/ws/tournament/${gameCode}/?token=${token}`);
                setSocketTournament(newSocket);
                newSocket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log(data);            
                    if (data.game_id && data.player1 === user.name || data.player2 === user.name) {
                        navigate(`/games/${data.game_id}`);
                    }
                }
                newSocket.onclose = () => {
                    console.log("Tournament webSocket closed");
                };
                newSocket.onopen = () => {
                    console.log("Tournament websocket open")
                    };
                }
            // return () => {
            //   if (socketTournament) {
            //     socketTournament.close();
            //     setSocketTournament(null);
            //   }
            // };
          }, [socketTournament, joinTournament]);

    useEffect(() => {
        if (!socket && waitingForPlayer) {
            const newSocket = new WebSocket(`${process.env.REACT_APP_API_URL}ws/matchmaking/?token=${token}`);
            setSocket(newSocket);
        
            newSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("join : ", data); 
                if (data.game_id) {
                    setGame(data);
                    navigate(`/games/${data.game_id}`);
                }
            }; 
            newSocket.onclose = () => {
                console.log("Matchmaking webSocket closed");
            };

            newSocket.onopen = () => {
                console.log("Matchmaking websocket open")
                };
            }
        if (waitingForPlayer === false){
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
        const itemsActiv = items.map(items => ({
            ...items,
            active: items.name === stats || items.name === optionStats,
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
            const response = await axiosInstance.get(`/game/fetch_data_tournament_by_code/${gameCode}/`);
            setTournament(response.data);
            return 0;
        } catch (error) {
            console.error("Error fetching tournament by code:", error);
            return 1;
        }
    }

    const handleClickTournament = async (name) => {
        if(name === "create")
        {
            setParentNumberPlayer(numberPlayer);
            setModalCreateTournament(true);
            launching({ newLaunch: 'createTournament', setModal: setModalCreateTournament});
        }
        else if (name === "join")
        {
            const fonction_return = await fetchDataTournament();
            if (fonction_return === 0) {
                setModalTournament(true);
                setJoinTournament(true);
                launching({ newLaunch: 'tournament', setModal: setModalTournament});
            }
        }
    };

    const StartGameSolo = async () => {
        try {
          const response = await axiosInstance.post(`/api/game/create_game`, { player1 });
          navigate(`/games/${response.data.id}`);
        } catch (error) {
          console.error("Error submitting Player:", error);
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
    
    
    
    const Matchmaking = () =>{
        setWaitingForPlayer(true);
        setSend_Info(true)
    }


    const exitWait = () =>{
        setWaitingForPlayer(false);
        if (socket) {
            socket.send(JSON.stringify({ type: 'leave' }));
        }
    }

return (
    !waitingForPlayer ? (
        <div className="game-home w-100 h-100">
        <div className="content-wrapper w-100 h-100">
            <div className="column column-left w-50 h-100">
            <div className="d-flex flex-column mb-3 h-100">
                <div className="p-2" onClick={() => handleMenuClick("play")}>
                <span className="arrow">►</span> {t('PLAY')} <span className="tilde">_</span>
                </div>
                <div className="p-2" onClick={() => handleMenuClick("tournament")}>
                <span className="arrow">►</span> {t('TOURNAMENT')} <span className="tilde">_</span>
                </div>
                <div className="p-2" onClick={() => handleMenuClick("stats")}>
                <span className="arrow">►</span> {t('STATS')} <span className="tilde">_</span>
                </div>
            </div>
            </div>
            <div className="column column-right w-50 h-100">
            {onClickPlay && (
                <div className="content">
                <h3 style={{ textAlign: "center" }} onClick={() => handleMenuClick("play")}>{t('Play')}</h3>
                <div className="line" onClick={() => StartGameSolo()}> {t('1Player')} </div>
                <div className="line" onClick={() => Matchmaking()}> {t('2PlayersOnline')} </div>
                <div className="line" onClick={() => StartGameSolo()}> {t('2PlayersLocal')} </div>
                </div>
            )}
            {onClickTournament && (
                <div className="content">
                <h3 onClick={() => handleMenuClick("tournament")}>{t('TournamentSection')}</h3>
                <div className="section-tournament w-100">
                    <p className="d-flex flex-direction column w-100 h-70" onClick={() => setOnClickJoin((prev) => !prev)}>{t('JoinGame')}
                    {onClickJoin && (
                        <div className="h-100 w-100">
                        <input
                            type="text"
                            className="input-code"
                            placeholder={t('Code')}
                            value={gameCode}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setGameCode(e.target.value.replace(/\D/g, ""))}
                        />
                        <bouton onClick={() => handleClickTournament("join")}> ✅ </bouton>
                        </div>
                    )}
                    </p>
                    <p className="d-flex flex-direction column w-100 h-30" onClick={() => setOnClickCreate((prev) => !prev)}>{t('CreateGame')}
                    { onClickCreate && (
                        <p style={{ fontSize: 12, marginTop: "8%" }}>
                            {t('NumberPlayers')}:
                            <select 
                                className="input-players" 
                                value={numberPlayer}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setNumberPlayer(e.target.value)}  
                            >
                                <option value="2">{t('2Players')}</option>
                                <option value="4">{t('4Players')}</option>
                            </select>
                            <button onClick={() => handleClickTournament("create")}> ✅ </button>
                        </p>
                    )}
                    </p>
                </div>
                </div>
            )}
            {onClickStats && (
                    <div className="content">
                        <h3 className="game-home-stats-title"  onClick={() => handleMenuClick("stats")} >{t('Stats')}</h3>
                        <div className="text-stats">
                            <p onClick={() => handleClickStats('profile', '...')} >{t('GlobalStats')}</p>
                            <p onClick={() => handleClickStats('global', '...')} >{t('StatsGame')}</p>
                                <div className="item">
                                    <p onClick={() => handleClickStats('global', 'All games')} >► {t('AllGames')}</p>
                                    <p onClick={() => handleClickStats('global', 'Friends')} >► {t('Friends')}</p>
                                    <p onClick={() => handleClickStats('global', 'Win')} >► {t('Win')}</p>
                                    <p onClick={() => handleClickStats('global', 'Lose')} >► {t('Lose')}</p>
                                    <p onClick={() => handleClickStats('global', 'Tournament')} >► {t('Tournament')}</p>
                                </div>
                            <p onClick={() => handleClickStats('collect', '...')} >{t('Collection')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    ) : (
        <div className="waiting h-100 w-100">
            <h2 className="wait_text" > {t('WaitingPlayer')}</h2>
            <div className="line" onClick={() => exitWait()}> {t('EXIT')} </div>
        </div>
    )
    );
};

export default HomeGame;
