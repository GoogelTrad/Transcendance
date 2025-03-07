import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import HomeGame from './game/Home_game';
import './Home.css';
import Template from './instance/Template';  
import ModalInstance from './instance/ModalInstance';
import Stats from './game/Stats';
import Tournament from './game/Tournament/Tournament';
import ResultTournament from './game/Tournament/ResultTournament';
import CreateTournament from './game/Tournament/CreateTournament';
import './game/Tournament/Tournament.css';
import FriendRequests from './friends/Friends';
import Profile from './users/Profile';
import HomeChat from './chat/Homechat';
import { useAuth } from './users/AuthContext';

import { ToastContainer } from 'react-toastify';
import { jwtDecode } from "jwt-decode";
import P from './assets/P.png';
import S from './assets/S.png';
import C from './assets/C.png';
import T from './assets/T.png';

import { useTranslation } from 'react-i18next';
import DragableInstance from './instance/DragableInstance';
import { showToast } from './instance/ToastsInstance';

function Home() {

    const { t } = useTranslation();
    const [isFriends, setIsFriends] = useState([]);
    const [isModalTerminal, setIsModalTerminal] = useState(false);
    const [isModalStats, setIsModalStats] = useState(false);
    const [isModalForms, setIsModalForms] = useState(false);
    const [isModalGame, setIsModalGame] = useState(false);
    const [isModalTournament, setIsModalTournament] = useState(false);
    const [isModalCreateTournament, setIsModalCreateTournament] = useState(false);
    const [isModalSocial, setIsModalSocial] = useState(false);
    const [isModalProfile, setIsModalProfile] = useState(false);
    const [isModalResult, setIsModalResult] = useState(false);
    const [isModalFriendProfile, setIsModalFriendProfile] = useState(false);
    const [tournamentCode, setTournamentCode] = useState(0);
    const [isModalCode, setIsModalCode] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);
    const { isAuthenticated, userInfo } = useAuth();

    const navigate = useNavigate();

    const setters = [
        {name: 'terminal', setter: setIsModalTerminal},
        {name: 'game', setter: setIsModalGame},
        {name: 'stats', setter: setIsModalStats},
        {name: 'social', setter: setIsModalSocial},
        {name: 'profile', setter: setIsModalProfile},
        {name: 'friend', setter: setIsModalFriendProfile},
        {name: 'resultTournament', setter: setIsModalResult},
    ]

    const [modalZIndexes, setModalZIndexes] = useState({});
    const [modalPositions, setModalPositions] = useState({});

    const modalTerminalRef = useRef(null);
    const modalFormsRef = useRef(null);
    const modalGameRef = useRef(null);
    const modalStatsRef = useRef(null);
    const modalTournamentRef = useRef(null);
    const modalCreateTournament = useRef(null);
    const modalFriendProfileRef = useRef(null);
    const modalResultRef = useRef(null);
    const modalSocial = useRef(null);
    const modalProfile = useRef(null);
    const modalCode = useRef(null);

    const [items, setItems] = useState([
        { name: 'profile', active: false },
        { name: 'collect', active: false },
        { name: 'global', active: false },
        { name: 'All games', active: false },
        { name: 'Win', active: false },
        { name: 'Lose', active: false },
        { name: 'Tournament', active: false},
        {name: 'resultTournament', active: false},
    ]);
    
    const [numberPlayer, setNumberPlayer] = useState("");
    const location = useLocation();
    const modalSend = location.state?.modalName || "";

    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    const handleModal = ({ setModal, boolean }) => setModal(boolean);

    const launching = ({ newLaunch, setModal }) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        
        const maxZIndex = Math.max(...Object.values(modalZIndexes), 0);
        setModalZIndexes((prev) => ({ ...prev, [newLaunch]: maxZIndex + 1 }));
        handleModal({ setModal, boolean: true });
    };

    const bringToFront = (modalName) => {
        const maxZIndex = Math.max(...Object.values(modalZIndexes), 0);
        setModalZIndexes((prev) => ({ ...prev, [modalName]: maxZIndex + 1 }));
    };

    function isLaunched(launched, searchApp) {
        return launched.includes(searchApp);
    }

    const gameRef = useRef(null);
    const chatRef = useRef(null);
    const statsRef = useRef(null);

    useEffect(() => {
        if (modalSend) {
            console.log(location.pathname)
            const modalSetter = setters.find(item => item.name === modalSend)?.setter;
            if (modalSetter && !isLaunched(isLaunch, modalSend)) {
                launching({ newLaunch: modalSend, setModal: modalSetter });
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [modalSend, navigate]);

    useEffect(() => {
        const initializePosition = (ref, initialXFactor) => {
            const element = ref.current;
            if (!element) return;
    
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
    
            const initialLeft = windowWidth * initialXFactor;
            const initialTop = windowHeight * 0.35;
    
            element.style.left = `${initialLeft}px`;
            element.style.top = `${initialTop}px`;
            element.style.position = 'absolute';
        };
    
        if (gameRef.current) initializePosition(gameRef, 0.05);
        if (chatRef.current) initializePosition(chatRef, 0.84);
        if (statsRef.current) initializePosition(statsRef, 0.45);
    
        const handleResize = () => {
            if (gameRef.current) initializePosition(gameRef, 0.05);
            if (chatRef.current) initializePosition(chatRef, 0.84);
            if (statsRef.current) initializePosition(statsRef, 0.45);
        };
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isAuthenticated]);

    useEffect(() => {
        if (location.state?.tournamentCode) {
            console.log("tournament code2 :", location.state.tournamentCode);
            setTournamentCode(location.state.tournamentCode);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.modalName === 'resultTournament') {
            setTournamentCode(location.state.tournamentCode);
            launching({ 
                newLaunch: "resultTournament", 
                setModal: setIsModalResult 
            });
            setIsModalResult(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

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
                            {t('Terminal')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "forms") && (
                        <button
                            className={`${isModalForms ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalForms, boolean: !isModalForms });
                            }}
                        >
                            {t('Form')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "game") && (
                        <button
                            className={`${isModalGame ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalGame, boolean: !isModalGame });
                            }}
                        >
                            {t('Game')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "stats") && (
                        <button
                            className={`${isModalStats ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalStats, boolean: !isModalStats });
                            }}
                        >
                            {t('Stats')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "tournament") && (
                        <button
                            className={`${isModalTournament ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalTournament, boolean: !isModalTournament });
                            }}
                        >
                            {t('Tournament')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "profile") && (
                        <button
                            className={`${isModalProfile ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalProfile, boolean: !isModalProfile });
                            }}
                        >
                            {t('Profile')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "friend") && (
                        <button
                            className={`${isModalFriendProfile ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalFriendProfile, boolean: !isModalFriendProfile });
                            }}
                        >
                            {t('Friend')}
                        </button>
                    )}
                    {isLaunched(isLaunch, "resultTournament") && (
                        <button
                            className={`${isModalResult ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalResult, boolean: !isModalResult });
                            }}
                        >
                            {t('ResultTournament')}
                        </button>
                    )}
                </div>
            }
            >
            {!isAuthenticated && (
                <div
                    style={{
                        position: 'absolute',
                        top: '35%',
                        left: '45%',
                        height: '20%',
                        width: '10%',
                    }}
                    >
                    <img
                        src={T}
                        alt="icon term"
                        className="w-100"
                        style={{height: '80%'}}
                        onClick={() => launching({ newLaunch: "terminal", setModal: setIsModalTerminal })}
                    />
                    <div style={{ position: 'absolute', alignItems:'end', textAlign: 'center', justifyContent:'center', textAlign: 'center'}}>{t('TERMINAL')}</div>
                </div>
            )}
            {isAuthenticated && (
                <DragableInstance>
                    <div
                        ref={gameRef}
                        style={{
                            position: 'absolute',
                            height: '20%',
                            width: '10%',
                            userSelect: 'none',
                            textAlign: 'center',
                            justifyContent: 'center',
                            alignItems:'center'
                        }}
                    >
                        <img
                            src={P}
                            alt="icon game"
                            className=""
                            style={{height: '80%', width:'auto'}}
                            onClick={() => launching({newLaunch: "game", setModal: setIsModalGame})}
                        />
                        <div className="tournament-text" style={{color:'rgba(13, 53, 82, 0.8)'}}>PONG</div>
                    </div>
                </DragableInstance>
            )}
            {isAuthenticated && (
                <div
                    ref={chatRef}
                    style={{
                        position: 'absolute',
                        height: '20%',
                        width: '10%',
                        userSelect: 'none',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems:'center'
                    }}

                >
                    <img
                        src={C}
                        alt="icon chat"
                        className=""
                        style={{height: '80%', width:'auto'}}
                        onClick={() => navigate('/Chat')}
                    />
                    <div className="tournament-text" style={{color:'rgba(13, 53, 82, 0.8)'}}>CHAT</div>
                </div>
            )}
            {isAuthenticated && (
                <div
                    ref={statsRef}
                    style={{
                        position: 'absolute',
                        height: '20%',
                        width: '10%',
                        userSelect: 'none',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems:'center'
                    }}
                >
                    <img
                        src={S}
                        alt="icon stats"
                        className=""
                        style={{height: '80%', width:'auto'}}
                        onClick={() => launching({newLaunch: "stats", setModal: setIsModalStats})}
                    />
                    <div className="tournament-text" style={{color:'rgba(13, 53, 82, 0.8)'}}>STATS</div>
                </div>
            )}
            {!isAuthenticated && isLaunched(isLaunch, "terminal") && 
                <ModalInstance
                    height="60%"
                    width="50%"
                    isModal={isModalTerminal}
                    modalRef={modalTerminalRef}
                    name="Terminal"
                    zIndex={modalZIndexes["terminal"] || 1}
                    onBringToFront={() => bringToFront("terminal")}
                    onLaunchUpdate={() => removeLaunch("terminal")}
                    onClose={() => setIsModalTerminal(false)}
                >
                    <TerminalLogin setModal={setIsModalForms} launching={launching} setTerminal={setIsModalTerminal} removeLaunch={removeLaunch} />
                </ModalInstance>
            }
            {!isAuthenticated && 
                <ModalInstance
                    height="60%"
                    width="50%"
                    isModal={isModalForms}
                    modalRef={modalFormsRef}
                    name="Forms"
                    zIndex={modalZIndexes["forms"] || 1}
                    onBringToFront={() => bringToFront("forms")}
                    onLaunchUpdate={() => removeLaunch("forms")}
                    onClose={() => setIsModalForms(false)}
                >
                    <LoginRegister setModal={setIsModalForms} setTerminal={setIsModalTerminal} removeLaunch={removeLaunch} setModalCode={setIsModalCode} launching={launching}/>
                </ModalInstance>
            }
            {isAuthenticated && 
                <ModalInstance
                    height="60%"
                    width="50%"
                    isModal={isModalGame}
                    modalRef={modalGameRef}
                    name="Pong"
                    zIndex={modalZIndexes["game"] || 1}
                    onBringToFront={() => bringToFront("game")}
                    onLaunchUpdate={() => removeLaunch("game")}
                    onClose={() => setIsModalGame(false)}
                >
                    <HomeGame setModalStats={setIsModalStats} modalCreateTournament={isModalCreateTournament}  setModalCreateTournament={setIsModalCreateTournament} setModalTournament={setIsModalTournament} launching={launching} setParentItems={setItems} setParentNumberPlayer={setNumberPlayer}/>
                </ModalInstance>
            }
            {isAuthenticated && 
                <ModalInstance
                    height="85%"
                    width="60%"
                    top="5%"
                    isModal={isModalStats}
                    modalRef={modalStatsRef}
                    name="Stats"
                    zIndex={modalZIndexes["stats"] || 1}
                    onBringToFront={() => bringToFront("stats")}
                    onLaunchUpdate={() => removeLaunch("stats")}
                    onClose={() => setIsModalStats(false)}
                >
                    <Stats itemsArray={items}/>
                </ModalInstance>
            }
            {isAuthenticated && 
                <ModalInstance
                    height="50%"
                    width="25%"
                    top="3%"
                    isModal={isModalCreateTournament}
                    modalRef={modalCreateTournament}
                    name="Create game"
                    zIndex={modalZIndexes["createTournament"] || 1}
                    onBringToFront={() => bringToFront("createTournament")}
                    onLaunchUpdate={() => removeLaunch("createTournament")}
                    onClose={() => setIsModalCreateTournament(false)}
                >
                    <CreateTournament setIsModalTournament={setIsModalTournament} setIsModalCreateTournament={setIsModalCreateTournament} setTournamentCode={setTournamentCode} launching={launching} removeLaunch={removeLaunch} numberPlayer={numberPlayer}/>
                </ModalInstance>
            }
            {isAuthenticated && (
                <ModalInstance
                    height="60%"
                    width="20%"
                    isModal={isModalResult}
                    modalRef={modalResultRef}
                    name="Result"
                    zIndex={modalZIndexes["resultTournament"] || 1}
                    onBringToFront={() => bringToFront("resultTournament")}
                    onLaunchUpdate={() => {
                        removeLaunch("resultTournament");
                    }}
                    onClose={() => {
                        setIsModalResult(false);
                    }}
                >
                    <ResultTournament
                        items={items}
                        setItems={setItems}
                        setModalResult={setIsModalResult}
                        setModalStats={setIsModalStats}
                        removeLaunch={removeLaunch}
                        launching={launching}
                        tournamentCode={tournamentCode}
                    />
                </ModalInstance>
            )}
            {isAuthenticated && isLaunched(isLaunch, "social") && 
                <ModalInstance
                    height="60%"
                    width="50%"
                    isModal={isModalSocial}
                    modalRef={modalSocial}
                    name="Social"
                    zIndex={modalZIndexes["social"] || 1}
                    onBringToFront={() => bringToFront("social")}
                    onLaunchUpdate={() => removeLaunch("social")}
                    onClose={() => setIsModalSocial(false)}
                >
                    <FriendRequests setModal={setIsModalFriendProfile} launching={launching} setIsFriends={setIsFriends}/>
                </ModalInstance>
            }
            {isAuthenticated && isLaunched(isLaunch, "profile") && 
                <ModalInstance
                    height="13%"
                    width="40%"
                    isModal={isModalProfile}
                    modalRef={modalProfile}
                    name="Profile"
                    zIndex={modalZIndexes["profile"] || 1}
                    onBringToFront={() => bringToFront("profile")}
                    onLaunchUpdate={() => removeLaunch("profile")}
                    onClose={() => setIsModalProfile(false)}
                >
                    <Profile id={userInfo.id}/>
                </ModalInstance>
            }
            {isAuthenticated && isLaunched(isLaunch, "friend") && 
                <ModalInstance
                    height="13%"
                    width="40%"
                    isModal={isModalFriendProfile}
                    modalRef={modalFriendProfileRef}
                    name="Friend Profile"
                    zIndex={modalZIndexes["friend"] || 1}
                    onBringToFront={() => bringToFront("friend")}
                    onLaunchUpdate={() => removeLaunch("friend")}
                    onClose={() => setIsModalFriendProfile(false)}
                >
                    <Profile id={isFriends.id}/>
                </ModalInstance>
            }
        </Template>
    );
}

export default Home;