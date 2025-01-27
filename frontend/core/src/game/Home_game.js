import './Home_game.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axiosInstance from "../instance/AxiosInstance";
import Stats from './Stats.js';
import Template from '../instance/Template.js';
import Profile from '../users/Profile.js';

function HomeGame() {
    const [player1, setPlayer1] = useState("");
    const [onClickPlay, setOnClickPlay] = useState(false);
    const [onClickTournament, setOnClickTournament] = useState(false);
    const [onClickStats, setOnClickStats] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const [isProfile, setIsProfile] = useState(false);
    const [isCollect, setIsCollect] = useState(false);
    const [isGlobal, setIsGlobal] = useState(false);
    const [isAllGames, setIsAllGames] = useState(false);
    const [isFriends, setIsFriends] = useState(false);
    const [isWin, setIsWin] = useState(false);
    const [isLose, setIsLose] = useState(false);
    const [selectedItem, setSelectedItem] = useState("...");

    const items = [
        { name: 'profile', active: false },
        { name: 'collect', active: false },
        { name: 'global', active: false },
        { name: 'All games', active: false },
        { name: 'Friends', active: false },
        { name: 'Win', active: false },
        { name: 'Lose', active: false },
    ];

    const token = getCookies('token');
    let user = null;

    if (token) {
        try {
            user = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }

    useEffect(() => {
        if (user && user.name) {
            setPlayer1(user.name);
        }
    }, [user]);

    const handleClick = (option) => {
        setOnClickPlay(false);
        setOnClickTournament(false);
        setOnClickStats(false);

        if (option === "play") {
            setOnClickPlay(true);
        } else if (option === "tournament") {
            setOnClickTournament(true);
        } else if (option === "stats") {
            setOnClickStats(true);
        }
    };

    const handleClickStats = (stats, optionStats) => {
        const updatedItems = items.map(item => ({
            ...item,
            active: item.name === stats || item.name === optionStats,
        }));
        navigate("/games/Stats", { state: { updatedItems } });
    };
    

    const submitPlayer = async () => {
        try {
          const response = await axiosInstance.post(`http://localhost:8000/game/create_game`, { player1 });
          navigate(`/games/${response.data.id}`);
        } catch (error) {
          console.error("Error submitting Player:", error);
        }
    };

    return (
        <div className="game-home">
            <div className="title-game">PONG</div>
            <div className="content-wrapper h-100 w-100">
                <div className="column column-left w-50 h-100">
                    <div className="d-flex flex-column mb-3 h-100">
                        <div className="p-2" onClick={() => handleClick("play")}>
                        <span className="arrow">a</span> PLAY <span className="tilde">_</span>
                        </div>
                        <div className="p-2" onClick={() => handleClick("tournament")}>
                        <span className="arrow">a</span> TOURNAMENT <span className="tilde">_</span>
                        </div>
                        <div className="p-2" onClick={() => handleClick("stats")}>
                        <span className="arrow">a</span> STATS <span className="tilde">_</span>
                        </div>
                    </div>
                </div>
                <div className="column column-right w-50 h-100">
                {onClickPlay && (
                    <div className="content">
                        <div className="line" onClick={() => submitPlayer('1-player')}> 1 player </div>
                        <div className="line" onClick={() => submitPlayer('2-players')}> 2 players - Local </div>
                        <div className="line" onClick={() => submitPlayer('2-players')}> 2 players - Online </div>
                        <div className="line" onClick={() => submitPlayer('2-players')}> 4 players - Online </div>
                    </div>
                )}
                {onClickTournament && (
                    <div className="content">
                    <h3>Tournament Section</h3>
                    <p>Participate in tournaments and compete with others for the top spot.</p>
                    </div>
                )}
                {onClickStats && (
                    <div className="content">
                    <h3 onClick={() => navigate("/games/Stats")} >Stats</h3>
                    <p onClick={() => handleClickStats('profile', '...') && <Stats itemsArray={items}/>} >Global Stats</p>
                    <p onClick={() => handleClickStats('global', '...') && <Stats itemsArray={items}/>} >Stats game</p>
                        <p onClick={() => handleClickStats('global', 'All games') && <Stats itemsArray={items}/>} >All games</p>
                        <p onClick={() => handleClickStats('global', 'Friends') && <Stats itemsArray={items}/>} >Friends</p>
                        <p onClick={() => handleClickStats('global', 'Win') && <Stats itemsArray={items}/>} >Win</p>
                        <p onClick={() => handleClickStats('global', 'Lose') && <Stats itemsArray={items}/>} >Lose</p>
                    <p onClick={() => handleClickStats('collect', '...') && <Stats itemsArray={items}/>} >Collection</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default HomeGame;
