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

function Tournament() {
    const { tournamentCode } = useParams();
    const [tournamentResponse, setTournamentResponse] = useState(null);
    const [tournamentStarted, setTournamentStarted] = useState(false);
    
    
    const navigate = useNavigate();
    const location = useLocation();
    const { join } = location.state || false;

    const { userInfo } = useAuth();
    let user = userInfo;
    
    const socketRef = useRef(null);

    const fetchTournementCode = async (code) => {
        try {
            const response = await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${code}`);
            setTournamentResponse(response.data);
        } catch (error) {
          console.log("Error fetching tournament:", error);
        }
    };
  useEffect(() => {
       if (tournamentStarted && !socketRef.current) {
           const newSocket =  new WebSocket(`${process.env.REACT_APP_SOCKET_IP}ws/tournament/${tournamentCode}/`);
           socketRef.current = newSocket;
           newSocket.onmessage = (event) => {
               const data = JSON.parse(event.data);
               console.log("creator : ", data);            
                if (data.game_id && data.player1 === user.name || data.player2 === user.name) {
                   navigate(`/games/${data.game_id}`);
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
       // return () => {
       //   if (socket) {
       //     socket.close();
       //     setSocket(null);
       //   }
       // };
     }, [tournamentStarted, tournamentCode, user, fetchTournementCode, navigate]);


    const fetchTournement = async () => {
        try {

            const response = await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${tournamentCode}`);
            setTournamentResponse(response.data);
        } catch (error) {
          console.log("Error fetching tournament:", error);
        }
    };

    const startTournament = () => {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ "Start": "Start games" }));
        }
    }


    useEffect(() => {
        if (join === true) {
            fetchTournement();
        }
    }, [join]);

    useEffect(() => {
        if (tournamentCode) {
            fetchTournement();
            setTournamentStarted(true);
        }
    }, [tournamentCode]);

    useEffect(() => {
        if (tournamentResponse && tournamentResponse.winner1) {
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ "message": "Hello game 1 is over" }));
            }
        }
        if (tournamentResponse && tournamentResponse.winner2) {
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ "message": "Hello game 2 is over" }));
            }
        }
    }, [tournamentResponse]);

    useEffect(() => {
        console.log("tournamentRes : ", tournamentResponse);
    }, [tournamentResponse]);


    useEffect(() => {
        if (tournamentResponse && tournamentResponse.winner_final) {
            navigate("/Home", { state: { modalName: "resultTournament" } });
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
                <div className="tree-tournament" style={{ height: `70%` }}>
                    <TournamentBracket numberPlayer={tournamentResponse?.size} tournamentResponse={tournamentResponse}/>
                </div>
           </div>
  
        </Template>
    );
}

export default Tournament;