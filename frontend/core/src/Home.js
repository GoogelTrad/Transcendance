import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from './assets/user/logo.png';  
import social from './assets/user/friends.svg'; 
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import HomeGame from './game/Home_game'
import './Home.css';
import Template from './instance/Template';  
import ModalInstance from './instance/ModalInstance';
import Stats from './game/Stats';
import Tournament from './game/Tournament';
import FriendRequests from './friends/Friends';
import Profile from './users/Profile';
import { useAuth } from './users/AuthContext';
import { jwtDecode } from "jwt-decode";
import { getCookies } from "./App";


function Home() {
    const [isModalStats, setIsModalStats] = useState(false);
    const [isModalTournament, setIsModalTournament] = useState(false);
    const [isModalTerminal, setIsModalTerminal] = useState(false);
    const [isModalSocial, setIsModalSocial] = useState(false);
    const [isModalForms, setIsModalForms] = useState(false);
    const [isModalGame, setIsModalGame] = useState(false);
    const [isModalCreateTournament, setIsModalCreateTournament] = useState(false);
    const [isModalProfile, setIsModalProfile] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);
    const { isAuthenticated } = useAuth();
    const setters = [
        {name: 'terminal', setter: setIsModalTerminal},
        {name: 'game', setter: setIsModalGame},
        {name: 'stats', setter: setIsModalStats},
        {name: 'social', setter:setIsModalSocial},
        {name: 'profile', setter:setIsModalProfile},
    ]
    const modalTerminalRef = useRef(null);
    const modalFormsRef = useRef(null);
    const modalGameRef = useRef(null);
    const modalStatsRef = useRef (null);
    const modalTournamentRef = useRef(null);
    const modalCreateTournament = useRef(null);

    const [items, setItems] = useState([]);
    const modalSocial = useRef(null);
    const modalProfile = useRef(null);

    const token = getCookies('token');
    let decodeToken = null;
    if (token)
      decodeToken = jwtDecode(token);
    const [numberPlayer, setNumberPlayer] = useState("");
    const [tournamentSettings, setTournamentSettings] = useState({});

    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    const handleModal = ({ setModal, boolean }) => setModal(boolean);

    const launching = ({ newLaunch, setModal }) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        handleModal({ setModal: setModal, boolean: true });
    };

    function isLaunched(launched, searchApp) {
        return launched.includes(searchApp);
    }

    const toggleSocial = () => {
        setIsModalSocial(((prev) => !prev));
        launching({ newLaunch: "social", setModal: setIsModalSocial })
    }

    return (
        <Template
            appArray={setters}
            launching={launching}
            taskBarContent={
                <div className="task-bar-content">
                    {isAuthenticated && <img
                        src={social}
                        alt="social"
                        className="social-icon"
                        onClick={toggleSocial}
                    />}
                    {isLaunched(isLaunch, "terminal") && (
                        <button
                            className={`${isModalTerminal ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalTerminal, boolean: !isModalTerminal });
                            }}
                        >
                            Terminal
                        </button>
                    )}
                    {isLaunched(isLaunch, "forms") && (
                        <button
                            className={`${isModalForms ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalForms, boolean: !isModalForms });
                            }}
                        >
                            Form
                        </button>
                    )}
                    {isLaunched(isLaunch, "game") && (
                        <button
                            className={`${isModalGame ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalGame, boolean: !isModalGame });
                            }}
                        >
                            Game
                        </button>
                    )}
                    {isLaunched(isLaunch, "stats") && (
                        <button
                            className={`${isModalStats ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalStats, boolean: !isModalStats });
                            }}
                        >
                            Stats
                        </button>
                    )}
                    {isLaunched(isLaunch, "tournament") && (
                        <button
                            className={`${isModalTournament ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalTournament, boolean: !isModalTournament });
                            }}
                        >
                            Tournament
                        </button>
                    )}
                    {isLaunched(isLaunch, "profile") && (
                        <button
                            className={`${isModalProfile ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalProfile, boolean: !isModalProfile });
                            }}
                        >
                            Profile
                        </button>
                    )}
                    {isLaunched(isLaunch, "createTournament") && (
                        <button
                            className={`${isModalCreateTournament ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalCreateTournament, boolean: !isModalCreateTournament });
                            }}
                        >
                            Create Tournament
                        </button>
                    )}
                </div>
            }
        >
            {!isAuthenticated && <button
                className="icon term"
                onClick={() => launching({ newLaunch: "terminal", setModal: setIsModalTerminal })}
            >
                Terminal
            </button>}
            {isAuthenticated && <button
                className="icon game"
                onClick={() => launching({ newLaunch: "game", setModal: setIsModalGame})}
                >
                    Game
                </button>
            }
            {isAuthenticated && <button
                className="icon stats"
                onClick={() => launching({ newLaunch: "stats", setModal: setIsModalStats})}
            >
                Stats
            </button>}
 
            {isAuthenticated && <button
                className="icon profileModal"
                onClick={() => {launching({ newLaunch: "profile", setModal: setIsModalProfile });}}
            >
                Profile
            </button>}

            {!isAuthenticated && isLaunched(isLaunch, "terminal") && <ModalInstance
                height="60%"
                width="50%"
                isModal={isModalTerminal}
                modalRef={modalTerminalRef}
                name="Terminal"
                onLaunchUpdate={() => removeLaunch("terminal")}
                onClose={() => setIsModalTerminal(false)}
            >
                <TerminalLogin setModal={setIsModalForms} launching={launching} setTerminal={setIsModalTerminal} removeLaunch={removeLaunch} />
            </ModalInstance>}

            {!isAuthenticated && <ModalInstance
                height="60%"
                width="50%"
                isModal={isModalForms}
                modalRef={modalFormsRef}
                name="Forms"
                onLaunchUpdate={() => removeLaunch("forms")}
                onClose={() => setIsModalForms(false)}
            >
                <LoginRegister setModal={setIsModalForms} setTerminal={setIsModalTerminal} removeLaunch={removeLaunch}/>
            </ModalInstance>}

            {isAuthenticated && <ModalInstance
                height="60%"
                width="50%"
                isModal={isModalTournament}
                modalRef={modalTournamentRef}
                name="Pong"
                onLaunchUpdate={() => removeLaunch("game")}
                onClose={() => setIsModalTournament(false)}
            >
                <HomeGame setModalStats={setIsModalStats} modalCreateTournament={isModalCreateTournament}  setModalCreateTournament={setIsModalCreateTournament} setModalTournament={setIsModalTournament} launching={launching} setParentItems={setItems} setParentNumberPlayer={setNumberPlayer}/>
            </ModalInstance>
            <ModalInstance
                height="85%"
                width="60%"
                top="7%"
                isModal={isModalStats}
                modalRef={modalStatsRef}
                name="Stats"
                onLaunchUpdate={() => removeLaunch("stats")}
                onClose={() => setIsModalStats(false)}
            >
                <Stats itemsArray={items}/>
            </ModalInstance>}

            {isAuthenticated && <ModalInstance
            </ModalInstance>
            <ModalInstance
                height="50%"
                width="25%"
                top="3%"
                isModal={isModalCreateTournament}
                modalRef={modalCreateTournament}
                name="Create game"
                onLaunchUpdate={() => removeLaunch("createTournament")}
                onClose={() => setIsModalCreateTournament(false)}
            >
            <Tournament  
                setSettings={setTournamentSettings}
                tournamentSettings={tournamentSettings}
                modalCreateTournament={isModalCreateTournament}  
                setModalCreateTournament={setIsModalCreateTournament} 
                setModalTournament={setIsModalTournament} 
                launching={launching} 
                numberPlayer={numberPlayer} 
                removeLaunch={removeLaunch}
            />
            </ModalInstance>
        </Template>
    );
}

export default Home;
