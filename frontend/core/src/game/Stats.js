import axiosInstance from "../instance/AxiosInstance";
import './Stats.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState, useRef} from "react";
import { jwtDecode } from "jwt-decode";
import bronze from '../assets/game/bronze.png';
import silver from '../assets/game/silver.png';
import gold from '../assets/game/gold.png';
import backgroundCollect from '../assets/game/background-collect.jpg';
import { useAuth } from "../users/AuthContext";

import { useTranslation } from 'react-i18next';
import { showToast } from "../instance/ToastsInstance";


function Stats({ itemsArray = [] }) {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [option, setOption] = useState([]);
    const [mode, setMode] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [winGames, setWinGames] = useState([]);
    const [loseGames, setLoseGames] = useState([]);
    const [tournamentGames, setTournamentGames] = useState([]);
    const { id } = useParams();
    const [games, setGames] = useState([]);
    const [expandedTab, setExpandedTab] = useState(false);
    const [medalBronze, setMedalBronze] = useState({
        Played: false,
        Win: false,
        BestScore: false,
        BestTime: false,
    });
    const [medalSilver, setMedalSilver] = useState({
        Played: false,
        Win: false,
        BestScore: false,
        BestTime: false,
    });
    const [medalGold, setMedalGold] = useState({
        Played: false,
        Win: false,
        BestScore: false,
        BestTime: false,
    });

    const { userInfo } = useAuth();

    const medalRules = {
        Played: {
            thresholds: [10, 20, 30],
            titles: ["10 games played", "20 games played", "30 games played"]
        },
        Win: {
            thresholds: [5, 10, 15],
            titles: ["5 games win", "10 games win", "15 games win"]
        },
        BestScore: {
            thresholds: [5, 10, 15],
            titles: ["5 games won with maximum score", "10 games won with maximum score", "15 games won with maximum score"]
        },
        BestTime: {
            thresholds: [5, 10, 15],
            titles: ["5 games won in less than 1 minute", "10 games won in less than 1 minute", "15 games won in less than 1 minute"]
        }
    };

    const setupMedals = (gamesArray, nameMedal, bronze, silver, gold) => {
        if (Array.isArray(gamesArray)) {
            if (gamesArray.length >= bronze) {
                setMedalBronze(prev => ({ ...prev, [nameMedal]: true }));
            }
            if (gamesArray.length >= silver) {
                setMedalSilver(prev => ({ ...prev, [nameMedal]: true }));
            }
            if (gamesArray.length >= gold) {
                setMedalGold(prev => ({ ...prev, [nameMedal]: true }));
            }
        }
    };

    useEffect(() => {
        if (games.length > 0 && userInfo) {
            const winGamesFiltered = games.filter(game => game.winner === userInfo?.name);
            const loseGamesFiltered = games.filter(game => game.loser === userInfo?.name);
            
            if (winGamesFiltered)
                setWinGames(winGamesFiltered);
            if (loseGamesFiltered)
                setLoseGames(loseGamesFiltered);

            setupMedals(games, "Played", 10, 20, 30);
            setupMedals(winGames, "Win", 5, 10, 15);


            const BestScoreFiltered = winGames.filter(score => 
                (score.player2 === userInfo?.name && score.score_player_2 === 11) || 
                (score.player1 === userInfo?.name && score.score_player_1 === 11)
            );
            setupMedals(BestScoreFiltered, "BestScore", 5, 10, 15);

            const BestTimeFiltered = winGames.filter(time => time.timeMinutes === '2');
            setupMedals(BestTimeFiltered, "BestTime", 5, 10, 15);
            console.log("best", BestTimeFiltered);
        }
    }, [games, id, userInfo]);
    
    

    const handleDivClick = (name) => {
        console.log("name : ", name);
        if(name != "")
        {
                setMode(prevMode => 
                prevMode.map(mode => ({
                    ...mode,
                    active: mode.name === name ? !mode.active : false 
                }))
            );
        }
        else
        {
            setExpandedTab(prev => !prev);
        }
    };

    const handlChoiceOption = (name) => {
        setOption(prevOption =>
            prevOption.map(option => ({
                ...option,
                active: option.name === name ? !option.active : false
            }))
        );
        setSelectedOption((prevSelected) => (prevSelected === name ? "" : name));
    };
    
    useEffect(() => {
    
        const filteredModes = itemsArray
            .filter(itemsArray => ['profile', 'collect', 'global'].includes(itemsArray.name))
            .map(itemsArray => ({
                name: itemsArray.name,
                active: itemsArray.active || false,
            }));
        setMode(filteredModes);
    
        const filteredOptions = itemsArray
            .filter(itemsArray => ['All games', 'Tournament', 'Win', 'Lose'].includes(itemsArray.name))
            .map(itemsArray => ({
                name: itemsArray.name,
                active: itemsArray.active || false,
            }));
        setOption(filteredOptions);
    }, [itemsArray]);

    useEffect(() => {
        const activeOption = option.find(option => option.active);
        setSelectedOption(activeOption || null);
    }, [option]);

    

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get(`/api/game/fetch_data_user/${userInfo?.id}/`, {});
                setGames(response.data);
            } catch (error) {
                showToast("error", t('ToastsError'));
            }
        };
        if (userInfo?.id) fetchStats();
      }, [id]);
    
      function StatsTable({ data }) {
        return (
            <div className="stats-zone-table w-100 h-100">
                <div className="w-100 d-flex" style={{ zIndex: 1 }}>
                    <table style={{ width: "100%", tableLayout: "relative", overflow: "hidden" }}>
                        <thead>
                            <tr>
                                <th>{t('Date')}</th>
                                <th>{t('Against')}</th>
                                <th>{t('Time')}</th>
                                <th>{t('Score')}</th>
                                <th>{t('Result')}</th>
                            </tr>
                        </thead>  
                            <tbody>
                                {data.map((data) => (
                                    <tr key={data.id}>
                                      <td 
                                            onClick={(e) => { e.stopPropagation(); console.log("Clicked on td!"); handleDivClick(""); }} 
                                            className={expandedTab ? 'expanded-cell' : ''}
                                        >
                                            {data.date ? data.date.slice(-5) : "N/A"}-{data.date ? data.date.slice(0, 5) : "N/A"}
                                        </td>
                                        <td 
                                            onClick={(e) => { e.stopPropagation(); console.log("Clicked on td!"); handleDivClick(""); }} 
                                            className={expandedTab ? 'expanded-cell' : ''}
                                        >
                                            {data.player2 || "N/A"}
                                        </td>
                                        <td>{data.timeMinutes} : {data.timeSeconds}</td>
                                        <td>{data.score_player_1} - {data.score_player_2}</td>
                                        {data.winner === userInfo?.name && (
                                            <td>{"win" || "N/A"}</td>
                                        )}
                                        {data.loser === userInfo?.name && (
                                            <td>{"lose" || "N/A"}</td>
                                        )}
                                        {!data.winner && !data.loser && (
                                            <td>{"N/A"}</td>
                                        )}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    
    
    return (
            <div  className="stats-home h-100 w-100 d-flex flex-reverse">
                <div className="stats-element one h-100 w-50">
                <div className="stats-row h-50 w-100" onClick={() => handleDivClick('profile')}>
                    <div className={`stats-zone ${mode.find(mode => mode.name === 'profile')?.active ? 'expanded left' : ''} left d-flex flex-reverse`}>
                        <div className="stats-zone-content d-flex flex-column flex-md-row w-100 h-100">
                        <div 
                            className="stats-col d-flex flex-column h-100 w-100 w-md-50"
                            style={{ 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '15px'
                            }}
                            >
                            <div 
                                className="stats-row-element empty-row d-flex justify-content-center align-items-center" 
                                style={{
                                    height: '45%',
                                    width: '100%',
                                    marginTop: '5%'
                                }}
                            >
                                <label htmlFor="profile_image" className="d-flex justify-content-center align-items-center w-100 h-100">
                                    <img
                                        src={userInfo?.profile_image_url ? `https://localhost:8000${userInfo?.profile_image_url}` : '/default.png'}
                                        alt="Profile"
                                        className="profile-picture img-fluid"
                                        title="profile"
                                        onClick={(e) => { e.stopPropagation(); navigate("/Home", { state: { modalName: "profile" } }); }}
                                        style={{
                                            width: mode.find(mode => mode.name === 'profile')?.active ? '50%' : '70%',
                                            height: 'auto',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="stats-row-element empty-row flex-grow-1" style={{ height: "20%", display: "flex", alignItems: "flex-start" }}>{decodeToken?.name}</div>
                            <div className="stats-row-element flex-grow-1" style={{height: `30%`}}>
                            <div className="text-center">
                                <div className="stats-text">{t('WinrateRatio')}</div>
                                    <div className="counter">
                                        {games?.length && winGames?.length 
                                        ? Math.round((winGames?.length / games?.length) * 100) + "%"
                                        : "0%"
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="stats-col d-flex flex-column h-100 w-50" style={{ margin: '3%', justifyContent:'space-between', alignItems:'center'}}>
                            <div className="stats-row-element flex-grow-1 w-100">
                            <div className="text-center">
                                <div className="stats-text">{t('GamesPlayed')}</div>
                                <div className="counter">{games?.length || "0"}</div>
                            </div>
                            </div>
                            <div className="stats-row-element flex-grow-1 w-100">
                            <div className="text-center">
                                <div className="stats-text">{t('Win')}</div>
                                <div className="counter">{winGames?.length || "0"}</div>
                            </div>
                            </div>
                            <div className="stats-row-element flex-grow-1 w-100">
                            <div className="text-center">
                                <div className="stats-text">{t('Lose')}</div>
                                <div className="counter">{loseGames?.length || "0"} </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="stats-row h-50 w-100"  onClick={() => handleDivClick('collect')}>
                        <div className={`stats-zone ${mode.find(mode => mode.name === 'collect')?.active ? 'expanded left' : ''} left d-flex flex-reverse`}> 
                            <div
                                className="d-flex h-100 w-100 flex-column"
                                style={{
                                    padding: '5%',
                                    backgroundImage: `url(${backgroundCollect})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    position: 'relative'
                                }}
                                >
                                <div
                                    style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    zIndex: 0 
                                    }}
                                ></div>
                                {[
                                    { key: "Played" },
                                    { key: "Win" },
                                    { key: "BestScore" },
                                    { key: "BestTime" }
                                    ].map((medal, index) => (
                                    <div key={index} className="d-flex row w-100 mb-2" style={{ height: '20%', paddingTop: '2%' }}>                                        
                                    <div className="h-100 d-flex justify-content-center align-items-center" style={{ width: '33%' }}>
                                            <img
                                                src={gold}
                                                style={{ height: '100%', width: 'auto', opacity: !medalGold[medal.key] ? 1 : 0.5 }}
                                                title={medalRules[medal.key].titles[2]}
                                            />
                                        </div>
                                        <div className="h-100 d-flex justify-content-center align-items-center" style={{ width: '33%' }}>
                                            <img
                                                src={silver}
                                                style={{ height: '100%', width: 'auto', opacity: !medalSilver[medal.key] ? 1 : 0.5 }}
                                                title={medalRules[medal.key].titles[1]}
                                            />
                                        </div>
                                        <div className="h-100 d-flex justify-content-center align-items-center" style={{ width: '33%' }}>
                                            <img
                                                src={gold}
                                                style={{ height: '100%', width: '50%', opacity: !medalGold[medal.key] ? 1 : 0.5 }}
                                                title={medalRules[medal.key].titles[2]}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="stats-row two d-flex h-100 w-50"  onClick={() => handleDivClick('global')}>
                    <div 
                        className={`stats-zone ${mode.find(mode => mode.name === 'global')?.active ? 'expanded right' : ''} right d-flex flex-column`}>
                        <div className="dropdown-stats btn-group" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="btn btn-dropdown-stats">
                                {selectedOption?.name || "..."}
                            </button>
                            <button
                                type="button"
                                className="btn btn-dropdown-stats dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <span className="visually-hidden">{t('ToggleDropdown')}</span>
                            </button>
                            <ul
                                className="dropdown-stats-menu dropdown-menu custom-dropdown-menu"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                {option.map((option) => (
                                    <li key={option.name}>
                                        <a
                                            className={`dropdown-item ${option.active ? "active" : ""}`}
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlChoiceOption(option.name);
                                                e.target.closest(".dropdown-menu").classList.remove("show");
                                            }}
                                        >
                                            {option.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {option.find(option => option.name === 'All games')?.active && (
                            <StatsTable data={games} />
                        )}
                        {option.find(option => option.name === 'Win')?.active && (
                            <StatsTable data={winGames} />
                        )}
                        {option.find(option => option.name === 'Lose')?.active && (
                            <StatsTable data={loseGames} />
                        )}
                        {option.find(option => option.name === 'Tournament')?.active && (
                            <>
                                <div className="w-100 d-flex justify-content-between text-center" style={{ height: '10%', marginTop: '2%', marginBottom: '2%' }}>
                                    <div className="d-flex flex-column w-33">
                                        <span className="stats-text" >{t('Played')}</span>
                                        <span className="counter" style={{fontSize:'100%'}}>CC</span>
                                    </div>
                                    <div className="d-flex flex-column w-33">
                                        <span className="stats-text">{t('FirstPlace')}</span>
                                        <span className="counter" style={{fontSize:'100%'}}>CC</span>
                                    </div>
                                    <div className="d-flex flex-column w-33">
                                        <span className="stats-text">{t('BestScore')}</span>
                                        <span className="counter" style={{fontSize:'100%'}}>CC</span>
                                    </div>
                                </div>
                                <div className="stats-zone-table w-100 h-100">
                                    <div className="w-100 d-flex">
                                        <table style={{ width: "100%", tableLayout: "relative", overflow: "hidden" }}>
                                            <thead>
                                                <tr>
                                                    <th>{t('Date')}</th>
                                                    <th>{t('Code')}</th>
                                                    <th>{t('Against')}</th>
                                                    <th>{t('Time')}</th>
                                                    <th>{t('Place')}</th>
                                                    <th>{t('Classement')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tournamentGames.map((game) => (
                                                    <tr key={game.id}>
                                                        <td
                                                            title={game.date || 'N/A'}
                                                            onClick={(e) => { e.stopPropagation(); handleDivClick(""); }} 
                                                            className={expandedTab ? 'expanded-cell' : ''}
                                                        >{game.date || "N/A"}</td>
                                                        <td>{game.code || "N/A"}</td>
                                                        <td  
                                                            onClick={(e) => { e.stopPropagation(); handleDivClick(""); }} 
                                                            className={expandedTab ? 'expanded-cell' : ''}
                                                        >{game.against || "N/A"}</td>
                                                        <td>{game.time || "N/A"}</td>
                                                        <td>{game.place || "N/A"}</td>
                                                        <td
                                                            onClick={(e) => { e.stopPropagation(); handleDivClick(""); }} 
                                                            className={expandedTab ? 'expanded-cell' : ''}
                                                        >{game.classement || "N/A"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
        </div>
    )

}

export default Stats;