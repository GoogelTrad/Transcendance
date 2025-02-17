import axiosInstance from "../instance/AxiosInstance";
import './Stats.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState, useRef} from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';

function Stats({ itemsArray = [] }) {
    const [option, setOption] = useState([]);
    const [mode, setMode] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const token = getCookies('token');
    let decodeToken = jwtDecode(token);
    const [winGames, setWinGames] = useState([]);
    const [looseGames, setLoseGames] = useState([]);
    const [friendName, setFriendsNames] = useState([]);
    const friendSearchFriend = useState("");
    const { id } = useParams();
    const [games, setGames] = useState([]);

    useEffect(() => {
        console.log("games start : ", games);
    });

    //useEffect(() => {
    //    if (games.length > 0) {
            
    //        const winGamesFiltered = games.filter(game => game.Winner === decodeToken.name);
    //        const loseGamesFiltered = games.filter(game => game.Loser === decodeToken.name);
    //        const friendGamesFiltered = games.filter(game => game.player2 === friendSearchFriend);

    //        if (winGamesFiltered)
    //        {
    //            const updatedGames = games.map(game => {
    //                if (game.Winner === decodeToken.name) {
    //                    return { ...game, Winner: 'win' };
    //                }
    //                return game;
    //            });
    //            setGames(updatedGames);
    //            setWinGames(winGamesFiltered); 

    //        } 
    //        else if (loseGamesFiltered)
    //        {
    //            setLoseGames(winGamesFiltered);
    //        }
    //        if (friendSearchFriend)
    //            setFriendsNames(friendGamesFiltered);

    //    }
    //}, [games, decodeToken.name, friendSearchFriend]);

    const handleDivClick = (name) => {
        setMode(prevMode => 
            prevMode.map(mode => ({
                ...mode,
                active: mode.name === name ? !mode.active : false 
            }))
        );
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
            .filter(itemsArray => ['All games', 'Friends', 'Win', 'Lose'].includes(itemsArray.name))
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
            const response = await axiosInstance.get(`http://localhost:8000/game/fetch_data_user/${decodeToken.id}/`, {});
            setGames(response.data);
            console.log("games:", games);
          } catch (error) {
            console.error('Error fetching user stats:', error);
          }
        };
    
        fetchStats();
      }, [id]);
    
    function StatsTable({ data }) {
        return (
            <div className="stats-zone-table w-100 h-100">
                <div className="w-100 d-flex">
                    <table style={{ width: "100%", tableLayout: "relative", overflow: "hidden" }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Against</th>
                                <th>Time</th>
                                <th>Score</th>
                                <th>Result</th>
                            </tr>
                        </thead>  
                            <tbody>
                                {data.map((data) => (
                                    <tr key={data.id}>
                                        <td>{data.date || "N/A"}</td>
                                        <td>{data.player2  || "N/A"}</td>
                                        <td>{data.timeMinutes} : {data.timeSeconds}</td>
                                        <td>{data.score_player_1} - {data.score_player_2}</td>
                                        <td>{data.result || "N/A"}</td>
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
                        <div className="stats-zone-content d-flex flex-row w-100 h-100">
                        <div className="stats-col d-flex flex-column h-100 w-50" style={{ justifyContent:'space-between', alignItems:'center'}}>
                            <div className="stats-row-element empty-row flex-grow-1"></div>
                            <div className="stats-row-element flex-grow-1">
                            <div className="text-center">
                                <div className="stats-text">Ratio</div>
                                <div className="counter">{(games?.length != 0 / winGames?.length != 0) || "0"}% </div>
                            </div>
                            </div>
                        </div>
                        <div className="stats-col d-flex flex-column h-100 w-50" style={{ justifyContent:'space-between', alignItems:'center'}}>
                            <div className="stats-row-element flex-grow-1 w-100 h-33">
                            <div className="text-center">
                                <div className="stats-text">Games played</div>
                                <div className="counter">{games?.length || "0"}</div>
                            </div>
                            </div>
                            <div className="stats-row-element flex-grow-1 w-100 h-33">
                            <div className="text-center">
                                <div className="stats-text">Win</div>
                                <div className="counter">{winGames?.length || "0"}</div>
                            </div>
                            </div>
                            <div className="stats-row-element flex-grow-1 w-100 h-33">
                            <div className="text-center">
                                <div className="stats-text">Lose</div>
                                <div className="counter">{looseGames?.length || "0"} </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="stats-row h-50 w-100"  onClick={() => handleDivClick('collect')}>
                        <div className={`stats-zone ${mode.find(mode => mode.name === 'collect')?.active ? 'expanded left' : ''} left d-flex flex-reverse`}>
                            cc
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
                                <span className="visually-hidden">Toggle Dropdown</span>
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
                        {/*{option.find(option => option.name === 'Friends')?.active && (
                            <div className="stats-zone-details w-100">
                                <div className="dropdown-friends d-flex h-100 w-100 "
                                    onClick={(e) => e.stopPropagation()}>
                                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        ...
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item d-flex" >Action</a>
                                            <div className="horizontal-line"></div>
                                        </li>
                                        <li><a class="dropdown-item d-flex" >Another</a>
                                            <div className="horizontal-line"></div>
                                        </li>
                                        <li><a class="dropdown-item d-flex">other</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}*/}
                        {option.find(option => option.name === 'Friends')?.active && (
                            <StatsTable data={friendName} />
                        )}
                        {option.find(option => option.name === 'Win')?.active && (
                            <StatsTable data={winGames} />
                        )}
                        {option.find(option => option.name === 'Lose')?.active && (
                            <StatsTable data={looseGames} />
                        )}
                    </div>
                </div>
        </div>
    )

}

export default Stats;