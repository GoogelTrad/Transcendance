import './Tournament.css';
import React, { useEffect, useState, useRef  } from "react";
import axiosInstance from '../../instance/AxiosInstance.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useAuth } from '../../users/AuthContext.js';
import { useLocation } from 'react-router-dom';
import person from '../../assets/game/person.svg';
import personAdd from '../../assets/game/person-fill.svg';
import TournamentBracket from "./TournamentBracket.js";
import Template from '../../instance/Template.js';
import MarioSection from './Mario.js';
import PacmanSection from './Pacman.js';
import { showToast } from '../../instance/ToastsInstance.js';

import { useTranslation } from 'react-i18next';

function Tournament() {
    const { tournamentCode } = useParams();
    const [tournamentResponse, setTournamentResponse] = useState(null);
    const [tournamentStarted, setTournamentStarted] = useState(false);
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();
    const { makeTournament } = location.state || false;

    const { userInfo } = useAuth();
    let user = userInfo;
    
    const socketRef = useRef(null);

    const fetchTournementCode = async (code) => {
        try {
            const response = await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${code}`);
            setTournamentResponse(response.data);
        } catch (error) {
            showToast("error", t('ToastsError'));
        }
    };
    useEffect(() => {
       if (tournamentStarted && !socketRef.current && userInfo.name) {
            const newSocket =  new WebSocket(`${process.env.REACT_APP_SOCKET_IP}ws/tournament/${tournamentCode}/`);
            socketRef.current = newSocket;
            newSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.game_id && (data.player1 === userInfo.name || data.player2 === userInfo.name)) {
                   navigate(`/game/${data.game_id}`);
                }
                if (data.type === 'user_connected_message') {
                    fetchTournementCode(data.message.code);
                }
           }
           newSocket.onclose = () => {
               console.log("Tournament webSocket closed");
           };
           newSocket.onopen = () => {
               console.log("Tournament websocket open")
               };
           }
           return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
     }, [tournamentCode, tournamentStarted, userInfo]);


    const fetchTournement = async () => {
        try {

            const response = await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${tournamentCode}`);
            setTournamentResponse(response.data);
        } catch (error) {
            showToast("error", t('ToastsError'));
        }
    };

    const startTournament = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ "Start": "Start games" }));
        }
    }

    // useEffect(() => {
    //     if (join === true) {
    //         fetchTournement();
    //     }
    // }, [join]);

    useEffect(() => {
        if (tournamentCode) {
            fetchTournement();
            setTournamentStarted(true);
        }
    }, [tournamentCode]);

    useEffect(() => {
        if (makeTournament === true) {
            const retryInterval = 3000;
            let retryTimer = null;
    
            const attemptToSendMessage = () => {
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ "message": "Updating Tournament ..." }));
                    clearInterval(retryTimer);
                }
            };
    
            retryTimer = setInterval(() => {
                attemptToSendMessage();
            }, retryInterval);
    
            return () => {
                if (retryTimer) {
                    clearInterval(retryTimer);
                }
            };
        }
    }, [makeTournament, socketRef.current]);
    
    useEffect(() => {
        // if (tournamentResponse && tournamentResponse.status == "finished")
        // {
        //     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        //         socketRef.current.close();
        //         socketRef.current = null;
        //     }
        // }
        console.log("tournamentRes : ", tournamentResponse);
    }, [tournamentResponse]);


    useEffect(() => {
        if (tournamentResponse && tournamentResponse.winner_final) {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
                socketRef.current = null;
            }
            
            navigate("/Home", { 
                state: { 
                    modalName: 'resultTournament',
                    tournamentCode: tournamentCode 
                }
            });
        }
    }, [tournamentResponse]);

        const renderImageWithClick = (src, alt, style, onClick, title) => (
            <img
                src={src}
                alt={alt}
                style={style}
                onClick={onClick}
                title={title}
            />
        );

    
    const renderPlayerImages = (numberPlayer, numberPlayerCo) => (
        console.log("numberPlayerCo : ", numberPlayerCo),
        console.log("numberPlayer : ", numberPlayer),
        [
            ...Array.from({ length: numberPlayerCo }).map((_, index) => (
                <img key={index + (numberPlayer - numberPlayerCo)} src={personAdd} alt={`Player ${index + 1}`} className="player-icon" />
            )),
            ...Array.from({ length: numberPlayer - numberPlayerCo }).map((_, index) => (
                <img key={index} src={person} alt={`Player ${index + 1}`} className="player-icon" />
            ))
        ]
    );

    return (
        <Template>
           <div className="tournament background h-100 w-100">
            <div className="w-100" style={{ position: "absolute", height: "10%", marginTop: "3%" }}>
                    <div className="tournament-text d-flex flex-row w-100">
                        <div className="d-flex flex-column h-100 w-25">Tournament Code</div>
                        <div className="d-flex flex-column h-100 w-25">Time</div>
                        <div className="d-flex flex-column h-100 w-25">Max Score</div>
                        <div className="d-flex flex-column h-100 w-25">Players</div>
                    </div>
                    <div className="tournament-text d-flex flex-row w-100">
                        <div className="d-flex flex-column h-100 w-25">{tournamentResponse?.code || "X"} </div>
                        <div className="d-flex flex-column h-100 w-25">
                            {String(tournamentResponse?.timeMaxMinutes || "00").padStart(2, "0")} : {String(tournamentResponse?.timeMaxSecondes || "00").padStart(2, "0")}
                        </div>
                        <div className="d-flex flex-column h-100 w-25">{tournamentResponse?.scoreMax || "0"}</div>
                        <div className="d-flex flex-column h-100 w-25">{tournamentResponse?.size || "X"}</div>
                    </div>
                </div>
                <div className="players-container d-flex flex-row w-100 " style={{ position: "absolute", height: "12%", marginTop: "11%", textAlign: `center`, alignItems: `center`, justifyContent: `center` }}>
                    <div className="players-co">
                        {renderPlayerImages(tournamentResponse?.size, tournamentResponse?.players_connected || 0)}
                    </div>
                </div>
                <MarioSection tournamentResponse={tournamentResponse} renderImageWithClick={renderImageWithClick} onStartTournament={startTournament}/>
           <PacmanSection tournamentResponse={tournamentResponse} renderImageWithClick={renderImageWithClick}/>
                <div className="tree-tournament" >
                    <TournamentBracket numberPlayer={tournamentResponse?.size} tournamentResponse={tournamentResponse}/>
                </div>
           </div>
  
        </Template>
    );
}

export default Tournament;