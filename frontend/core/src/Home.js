import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import HomeGame from './game/Home_game';
import './Home.css';
import Template from './instance/Template';  
import ModalInstance from './instance/ModalInstance';
import Stats from './game/Stats';
import Tournament from './game/Tournament';
import ResultTournament from './game/ResultTournament';
import FriendRequests from './friends/Friends';
import Profile from './users/Profile';
import HomeChat from './chat/Homechat';
import { useAuth } from './users/AuthContext';
import { jwtDecode } from "jwt-decode";
import { getCookies } from "./App";
import P from './assets/P.png';
import S from './assets/S.png';
import C from './assets/C.png';
import T from './assets/T.png';

function Home() {
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
    const [isModalCode, setIsModalCode] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    const navigate = useNavigate();

    const setters = [
        {name: 'terminal', setter: setIsModalTerminal},
        {name: 'game', setter: setIsModalGame},
        {name: 'stats', setter: setIsModalStats},
        {name: 'social', setter: setIsModalSocial},
        {name: 'profile', setter: setIsModalProfile},
        {name: 'friend', setter: setIsModalFriendProfile},
        {name: 'result', setter: setIsModalResult},
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
        { name: 'Friends', active: false },
        { name: 'Win', active: false },
        { name: 'Lose', active: false },
        { name: 'Tournament', active: false},
    ]);
    

    const [numberPlayer, setNumberPlayer] = useState("");
    const [tournamentSettings, setTournamentSettings] = useState({});
    const location = useLocation();
    const modalSend = location.state?.modalName || "";
    const token = getCookies('token');
    let decodeToken = null;
    if (token)
        decodeToken = jwtDecode(token);

    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    const handleModal = ({ setModal, boolean }) => setModal(boolean);

    const launching = ({ newLaunch, setModal }) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        
        // Attribue le z-index le plus élevé dès l'ouverture
        const maxZIndex = Math.max(...Object.values(modalZIndexes), 0);
        setModalZIndexes((prev) => ({ ...prev, [newLaunch]: maxZIndex + 1 }));

        if (!modalPositions[newLaunch]) {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const modalWidth = {
                terminal: windowWidth * 0.5,
                forms: windowWidth * 0.5,
                game: windowWidth * 0.5,
                stats: windowWidth * 0.6,
                createTournament: windowWidth * 0.25,
                tournament: windowWidth * 0.6,
                social: windowWidth * 0.5,
                profile: windowWidth * 0.4,
                chat: windowWidth * 0.4,
                friend: windowWidth * 0.4,
            }[newLaunch] || 400;

            const modalHeight = {
                terminal: windowHeight * 0.6,
                forms: windowHeight * 0.6,
                game: windowHeight * 0.6,
                stats: windowHeight * 0.85,
                createTournament: windowHeight * 0.5,
                tournament: windowHeight * 0.85,
                social: windowHeight * 0.6,
                profile: windowHeight * 0.13,
                chat: windowHeight * 0.3,
                friend: windowHeight * 0.13,
            }[newLaunch] || 300;

            const initialLeft = Math.max(0, (windowWidth - modalWidth) / 2);
            const initialTop = Math.max(0, (windowHeight - modalHeight) / 2);

            setModalPositions((prev) => ({
                ...prev,
                [newLaunch]: { left: initialLeft, top: initialTop },
            }));
        }
        handleModal({ setModal, boolean: true });
    };

    const bringToFront = (modalName) => {
        const maxZIndex = Math.max(...Object.values(modalZIndexes), 0);
        setModalZIndexes((prev) => ({ ...prev, [modalName]: maxZIndex + 1 }));
    };

    const updatePosition = (modalName, newPosition) => {
        setModalPositions((prev) => ({ ...prev, [modalName]: newPosition }));
    };

    function isLaunched(launched, searchApp) {
        return launched.includes(searchApp);
    }

    useEffect(() => {
        if (modalSend) {
            const modalSetter = setters.find(item => item.name === modalSend)?.setter;
            if (modalSetter) {
                launching({ newLaunch: modalSend, setModal: modalSetter });
            } else {
                console.warn(`Aucun modal trouvé pour: ${modalSend}`);
            }
        }
    }, [modalSend]);

    const [positionGame, setPositionGame] = useState({ x: window.innerWidth * 0.05, y: window.innerHeight * 0.35 });
    const [positionChat, setPositionChat] = useState({ x: window.innerWidth * 0.84, y: window.innerHeight * 0.35 });
    const [positionStats, setPositionStats] = useState({ x: window.innerWidth * 0.45, y: window.innerHeight * 0.35 });
    const [isDraggingGame, setIsDraggingGame] = useState(false);
    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const [isDraggingStats, setIsDraggingStats] = useState(false);

    const handleMouseDown = (e, icon) => {
        const offsetX = e.clientX - icon.x;
        const offsetY = e.clientY - icon.y;
    
        document.body.style.cursor = 'grabbing';
    
        const handleMouseMove = (moveEvent) => {
            if (icon.isDragging) {
                const newPos = { x: moveEvent.clientX - offsetX, y: moveEvent.clientY - offsetY };
                if (icon.name === "game") {
                    setPositionGame(newPos);
                } else if (icon.name === "chat") {
                    setPositionChat(newPos);
                } else if (icon.name === "stats") {
                    setPositionStats(newPos);
                }
            }
        };
    
        const handleMouseUp = () => {
            if (icon.name === "game") {
                setIsDraggingGame(false);
            } else if (icon.name === "chat") {
                setIsDraggingChat(false);
            } else if (icon.name === "stats") {
                setIsDraggingStats(false);
            }
    
            document.body.style.cursor = 'grab';
    
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
 
        if (icon.name === "game") {
            setIsDraggingGame(true);
        } else if (icon.name === "chat") {
            setIsDraggingChat(true);
        } else if (icon.name === "stats") {
            setIsDraggingStats(true);
        }
    };    

    useEffect(() => {
        const handleResize = () => {
            setPositionGame({x: window.innerWidth * 0.05, y: window.innerHeight * 0.35});
            setPositionChat({x: window.innerWidth * 0.84, y: window.innerHeight * 0.35});
            setPositionStats({x: window.innerWidth * 0.45, y: window.innerHeight * 0.35});
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
                    {isLaunched(isLaunch, "friend") && (
                        <button
                            className={`${isModalFriendProfile ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalFriendProfile, boolean: !isModalFriendProfile });
                            }}
                        >
                            Friend
                        </button>
                    )}
                    {isLaunched(isLaunch, "resultTournament") && (
                        <button
                            className={`${isModalResult ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalResult, boolean: !isModalResult });
                            }}
                        >
                            Result tournament
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
                    <div style={{ position: 'absolute', alignItems:'end', textAlign: 'center', justifyContent:'center', left:'28%', bottom: '20%'}}>TERMINAL</div>
                </div>
            )}
            {isAuthenticated && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${positionGame.y}px`,
                        left: `${positionGame.x}px`,
                        cursor: isDraggingGame ? 'grabbing' : 'grab',
                        height: '20%',
                        width: '10%',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, { name: 'game', x: positionGame.x, y: positionGame.y, isDragging: isDraggingGame })}
                    >
                    <img
                        src={P}
                        alt="icon game"
                        className="w-100"
                        style={{height: '80%'}}
                        onClick={() => launching({ newLaunch: "game", setModal: setIsModalGame })}
                    />
                    <div style={{ position: 'absolute', alignItems:'end', textAlign: 'center', justifyContent:'center', left:'33%', bottom: '0%'}}>PONG</div>
                </div>
            )}
            {isAuthenticated && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${positionChat.y}px`,
                        left: `${positionChat.x}px`,
                        cursor: isDraggingChat ? 'grabbing' : 'grab',
                        height: '20%',
                        width: '10%',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, { name: 'chat', x: positionChat.x, y: positionChat.y, isDragging: isDraggingChat })}
                    >
                    <img
                        src={C}
                        alt="icon chat"
                        className="w-100"
                        style={{height: '80%'}}
                        onClick={() => navigate('/Chat')}
                    />
                    <div style={{ position: 'absolute', alignItems:'end', textAlign: 'center', justifyContent:'center', left:'33%', bottom: '0%'}}>CHAT</div>
                </div>
            )}
            {isAuthenticated && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${positionStats.y}px`,
                        left: `${positionStats.x}px`,
                        cursor: isDraggingStats ? 'grabbing' : 'grab',
                        height: '20%',
                        width: '10%',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, { name: 'stats', x: positionStats.x, y: positionStats.y, isDragging: isDraggingStats })}
                    >
                    <img
                        src={S}
                        alt="icon stats"
                        className="w-100"
                        style={{height: '80%'}}
                        onClick={() => launching({ newLaunch: "stats", setModal: setIsModalStats })}
                    />
                    <div style={{ position: 'absolute', alignItems:'end', textAlign: 'center', justifyContent:'center', left:'33%', bottom: '0%'}}>STATS</div>
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
                    position={modalPositions["terminal"]}
                    onUpdatePosition={(newPos) => updatePosition("terminal", newPos)}
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
                    position={modalPositions["forms"]}
                    onUpdatePosition={(newPos) => updatePosition("forms", newPos)}
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
                    position={modalPositions["game"]}
                    onUpdatePosition={(newPos) => updatePosition("game", newPos)}
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
                    position={modalPositions["stats"]}
                    onUpdatePosition={(newPos) => updatePosition("stats", newPos)}
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
                    position={modalPositions["createTournament"]}
                    onUpdatePosition={(newPos) => updatePosition("createTournament", newPos)}
                    onBringToFront={() => bringToFront("createTournament")}
                    onLaunchUpdate={() => removeLaunch("createTournament")}
                    onClose={() => setIsModalCreateTournament(false)}
                >
                    <Tournament  
                        setSettings={setTournamentSettings}
                        tournamentSettings={tournamentSettings}
                        modalCreateTournament={isModalCreateTournament}  
                        setModalCreateTournament={setIsModalCreateTournament}
                        ModalTournament={isModalTournament}
                        setModalTournament={setIsModalTournament}
                        setModalResult={setIsModalResult}
                        modalResult={isModalResult}
                        launching={launching} 
                        numberPlayer={numberPlayer} 
                        removeLaunch={removeLaunch}
                    />
                </ModalInstance>
            }
            {isAuthenticated && 
                <ModalInstance
                    height="85%"
                    width="60%"
                    top="5%"
                    isModal={isModalTournament}
                    modalRef={modalTournamentRef}
                    name="Tournament"
                    zIndex={modalZIndexes["tournament"] || 1}
                    position={modalPositions["tournament"]}
                    onUpdatePosition={(newPos) => updatePosition("tournament", newPos)}
                    onBringToFront={() => bringToFront("tournament")}
                    onLaunchUpdate={() => removeLaunch("tournament")}
                    onClose={() => setIsModalTournament(false)}
                >
                    <Tournament 
                        setSettings={setTournamentSettings}
                        tournamentSettings={tournamentSettings}
                        modalCreateTournament={isModalCreateTournament}  
                        setModalCreateTournament={setIsModalCreateTournament} 
                        setModalTournament={setIsModalTournament} 
                        setModalResult={setIsModalResult}
                        modalResult={isModalResult}
                        launching={launching} 
                        numberPlayer={numberPlayer} 
                        removeLaunch={removeLaunch}
                    />
                </ModalInstance>
            }
            {isAuthenticated && <ModalInstance
                height="60%"
                width="20%"
                isModal={isModalResult}
                modalRef={modalResultRef}
                name="Result"
                onLaunchUpdate={() => (removeLaunch("resultTournament"), removeLaunch("tournament"))}
                onClose={() => (setIsModalResult(false), setIsModalTournament(false))}
                >
                    <ResultTournament
                        items={items}
                        setItems={setItems}
                        setIsModalTournament={setIsModalTournament}
                        setModalResult={setIsModalResult}
                        setModalStats={setIsModalStats}
                        removeLaunch={removeLaunch}
                        launching={launching}
                    />
            </ModalInstance>}
            {isAuthenticated && isLaunched(isLaunch, "social") && 
                <ModalInstance
                    height="60%"
                    width="50%"
                    isModal={isModalSocial}
                    modalRef={modalSocial}
                    name="Social"
                    zIndex={modalZIndexes["social"] || 1}
                    position={modalPositions["social"]}
                    onUpdatePosition={(newPos) => updatePosition("social", newPos)}
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
                    position={modalPositions["profile"]}
                    onUpdatePosition={(newPos) => updatePosition("profile", newPos)}
                    onBringToFront={() => bringToFront("profile")}
                    onLaunchUpdate={() => removeLaunch("profile")}
                    onClose={() => setIsModalProfile(false)}
                >
                    <Profile id={decodeToken.id}/>
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
                    position={modalPositions["friend"]}
                    onUpdatePosition={(newPos) => updatePosition("friend", newPos)}
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