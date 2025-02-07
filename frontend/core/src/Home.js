import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import logo from './assets/user/logo.png';  
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import HomeGame from './game/Home_game'
import './Home.css';
import Template from './instance/Template';  
import ModalInstance from './instance/ModalInstance';
import Stats from './game/Stats';
import Tournament from './game/Tournament';

function Home() {
    const [isModalTerminal, setIsModalTerminal] = useState(false);
    const [isModalStats, setIsModalStats] = useState(false);
    const [isModalForms, setIsModalForms] = useState(false);
    const [isModalGame, setIsModalGame] = useState(false);
    const [isModalTournament, setIsModalTournament] = useState(false);
    const [isModalCreateTournament, setIsModalCreateTournament] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);

    const setters = [
        {name: 'terminal', setter: setIsModalTerminal},
        {name: 'game', setter: setIsModalGame},
        {name: 'stats', setter: setIsModalStats},
    ]
    const modalTerminalRef = useRef(null);
    const modalFormsRef = useRef(null);
    const modalGameRef = useRef(null);
    const modalStatsRef = useRef (null);
    const modalTournamentRef = useRef(null);
    const modalCreateTournament = useRef(null);

    const [items, setItems] = useState([]);
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

    return (
        <Template
            appArray={setters}
            launching={launching}
            taskBarContent={
                <div className="task-bar-content">
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
            <button
                className="icon term"
                onClick={() => launching({ newLaunch: "terminal", setModal: setIsModalTerminal })}
            >
                Terminal
            </button>
            <button
                className="icon game"
                onClick={() => launching({ newLaunch: "game", setModal: setIsModalGame})}
            >
                Game
            </button>
            <ModalInstance
                height="60%"
                width="50%"
                isModal={isModalTerminal}
                modalRef={modalTerminalRef}
                name="Terminal"
                onLaunchUpdate={() => removeLaunch("terminal")}
                onClose={() => setIsModalTerminal(false)}
            >
                <TerminalLogin setModal={setIsModalForms} launching={launching} />
            </ModalInstance>

            <ModalInstance
                height="60%"
                width="50%"
                isModal={isModalForms}
                modalRef={modalFormsRef}
                name="Forms"
                onLaunchUpdate={() => removeLaunch("forms")}
                onClose={() => setIsModalForms(false)}
            >
                <LoginRegister />
            </ModalInstance>

            <ModalInstance
                height="60%"
                width="50%"
                isModal={isModalGame}
                modalRef={modalGameRef}
                name="Pong"
                onLaunchUpdate={() => removeLaunch("game")}
                onClose={() => setIsModalGame(false)}
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
            <ModalInstance
                height="85%"
                width="60%"
                top="7%"
                isModal={isModalTournament}
                modalRef={modalTournamentRef}
                name="Tournament"
                onLaunchUpdate={() => removeLaunch("tournament")}
                onClose={() => setIsModalTournament(false)}
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
