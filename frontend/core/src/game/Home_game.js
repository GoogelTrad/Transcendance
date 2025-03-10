import './Home_game.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import axiosInstance from "../instance/AxiosInstance";
import { useAuth } from '../users/AuthContext';
import { useTranslation } from 'react-i18next';
import { showToast } from '../instance/ToastsInstance';
import loading from '../assets/loading.gif';

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
    // const [game, setGame] = useState(null);
    const [socket, setSocket] = useState(null);

    const { t } = useTranslation();

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
                if (data.game_id) {
                    // setGame(data);
                    navigate(`/game/${data.game_id}`, { state: { authorized:true } });
                }
            };
            newSocket.onclose = () => {
            };
            newSocket.onopen = () => {
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
    }, [socket, waitingForPlayer, navigate]);

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
        if (gameCode === "0" || gameCode === "")
        {
            showToast("error", t('not a valid input'));
            return;
        }
        try {
            await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${gameCode}/`);
            return 0;
        } catch (error) {
            showToast("error", t('ToastsError'));
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
                navigate(`/games/tournament/${gameCode}` , { state: { makeTournament: true, authorized:true } });
            }
        }
    };

    const StartGameSolo = async (IA) => {
        try {
            const response = await axiosInstance.post(`/api/game/create_game`, { 
                player1,
                IA,
             });
            navigate(`/game/${response.data.id}` , { state: { authorized:true } });
        } catch (error) {
            showToast("error", t('ToastsError'));
        }
    };

    useEffect(() => {
        const trySendMessage = () => {
            if (socket && socket.readyState === WebSocket.OPEN && send_Info) {
                socket.send(JSON.stringify({ type: 'join' }));
                setSend_Info(false);
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
                            <div className="p-2" style={{cursor: 'pointer'}} onClick={() => handleMenuClick("play")}>
                                <span className="arrow">►</span> {t('PLAY')} <span className="tilde">_</span>
                            </div>
                            <div className="p-2" style={{cursor: 'pointer'}} onClick={() => handleMenuClick("tournament")}>
                                <span className="arrow">►</span> {t('TOURNAMENT')} <span className="tilde">_</span>
                            </div>
                            <div className="p-2" style={{cursor: 'pointer'}} onClick={() => handleMenuClick("stats")}>
                                <span className="arrow">►</span> {t('STATS')} <span className="tilde">_</span>
                            </div>
                        </div>
                    </div>
                    <div className="column-right">
                        {onClickPlay && (
                            <div className="content">
                                <h3 style={{ textAlign: "center" }} onClick={() => handleMenuClick("play")}>{t('Play')}</h3>
                                <div className="line" style={{cursor: 'pointer'}} onClick={() => StartGameSolo(false)}> {t('2PlayersLocal')} </div>
                                <div className="line" style={{cursor: 'pointer'}} onClick={() => StartGameSolo(true)}> {t('1Player')} </div>
                                <div className="line" style={{cursor: 'pointer'}} onClick={() => Matchmaking()}> {t('2PlayersOnline')}  </div>
                            </div>
                        )}
                        {onClickTournament && (
                            <div className="content">
                                <h3 onClick={() => handleMenuClick("tournament")}>{t('TournamentSection')}</h3>
                                <div className="section-tournament w-100">
                                    <div className="tournament-item d-flex flex-direction column w-100 h-70" style={{cursor: 'pointer'}} onClick={() => setOnClickJoin((prev) => !prev)}>
                                        <span>{t('JoinTournament')}</span>
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
                                                <button style={{cursor: 'pointer'}} onClick={() => handleClickTournament("join")}> ✅ </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="tournament-item d-flex flex-direction column w-100 h-30" style={{cursor: 'pointer'}} onClick={() => setOnClickCreate((prev) => !prev)}>
                                        <span>{t('CreateGame')}</span>
                                        {onClickCreate && (
                                            <div style={{ fontSize: 12, marginTop: "8%" }}>
                                                <span style={{  fontSize: 'clamp(0.5rem, 1vw, 1rem)'}}>{t('NumberPlayers')}</span>
                                                <select
                                                    className="input-players"
                                                    value={numberPlayer}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setNumberPlayer(e.target.value)}
                                                >
                                                    <option style={{cursor: 'pointer'}} value="2">{t('2Players')}</option>
                                                    <option style={{cursor: 'pointer'}} value="4">{t('4Players')}</option>
                                                </select>
                                                <button style={{cursor: 'pointer'}} onClick={() => handleClickTournament("create")}> ✅ </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {onClickStats && (
                            <div className="content">
                                <p className="game-home-stats-title" onClick={() => handleMenuClick("stats")}>{t('Stats')}</p>
                                <div className="text-stats">
                                    <div className="stats-item" style={{cursor: 'pointer'}} onClick={() => handleClickStats('profile', '...')}>{t('GlobalStats')}</div>
                                    <div className="stats-item" style={{cursor: 'pointer'}} onClick={() => handleClickStats('global', '...')}>{t('StatsGame')}</div>
                                    <div className="item">
                                        <div className="stats-subitem" style={{cursor: 'pointer'}} onClick={() => handleClickStats('global', 'All games')}>{t('Allgames')}</div>
                                        <div className="stats-subitem" style={{cursor: 'pointer'}} onClick={() => handleClickStats('global', 'Win')}>{t('Win')}</div>
                                        <div className="stats-subitem" style={{cursor: 'pointer'}} onClick={() => handleClickStats('global', 'Lose')}>{t('Lose')}</div>
                                        <div className="stats-subitem" style={{cursor: 'pointer'}} onClick={() => handleClickStats('global', 'Tournament')}>{t('Tournament')}</div>
                                    </div>
                                    <div className="stats-item" style={{cursor: 'pointer'}} onClick={() => handleClickStats('collect', '...')}>{t('Collection')}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="waiting d-flex h-100 w-100">
                <h2 className="wait_text d-flex w-100">{t('WaitingPlayer')}</h2>
                <img style={{height: '50%', width: 'auto'}} src={loading} alt="waiting"/>
                <div className="line d-flex w-100" onClick={() => exitWait()}>{t('EXIT')}</div>
            </div>
        )
    );
}

export default HomeGame;