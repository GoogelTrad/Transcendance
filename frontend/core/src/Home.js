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

    const [items, setItems] = useState([]);

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
            <button
                className="icon stats"
                onClick={() => launching({ newLaunch: "stats", setModal: setIsModalStats})}
            >
                Stats
            </button>
            <button
                className="icon tournament"
                onClick={() => launching({ newLaunch: "tournament", setModal: setIsModalTournament})}
            >
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
                <HomeGame setModalStats={setIsModalStats} setModalTournament={setIsModalTournament} launching={launching} setParentItems={setItems}/>
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
                height="85%"
                width="60%"
                top="7%"
                isModal={isModalTournament}
                modalRef={modalTournamentRef}
                name="Tournament"
                onLaunchUpdate={() => removeLaunch("stats")}
                onClose={() => setIsModalTournament(false)}
            >
                <Tournament />
            </ModalInstance>
        </Template>
    );
}

export default Home;
