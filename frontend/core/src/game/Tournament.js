import './Tournament.css';
import React, { useEffect, useState, useRef  } from "react";
import axiosInstance from '../instance/AxiosInstance.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import person from '../assets/game/person.svg';
import personAdd from '../assets/game/person-fill.svg';
import TournamentBracket from "./TournamentBracket";
import ghost from '../assets/game/ghost2.png';
import pacman from '../assets/game/pacman.png';
import ghostAfter from '../assets/game/ghost3.png';
import piece from '../assets/game/piece.png';
import block from '../assets/game/block.png';
import marioInit from '../assets/game/mario-init.png';
import marioRun1 from '../assets/game/mario-run-1.png';
import marioRun2 from '../assets/game/mario-run-2.png';
import marioJump from '../assets/game/mario-jump.png';
import blockAfter from '../assets/game/blockAfter.png';
import ban from '../assets/ban.png';

function Tournament({setSettings, tournamentSettings, modalCreateTournament, setModalCreateTournament, ModalTournament , setModalTournament, setModalResult, modalResult, launching, numberPlayer, removeLaunch }) {
    const [maxTimeMinutes, setMaxTimeMinutes] = useState("00");
    const [maxTimeSecondes, setMaxTimeSecondes] = useState("00");
    const [maxScore, setMaxScore] = useState(0);
    const [tournamentCode, setTournamentCode] = useState(8);
    const [columnBracket, setColumnBracket] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [tournamentResponse, setTournamentResponse] = useState(null);
    const [tournamentStarted, setTournamentStarted] = useState(false);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    const [marioData, setMarioData] = useState ({
        marioPosition: 4,
        isMarioInit: true,
        isMarioRun1: false,
        isMarioRun2: false,
        isMarioJump: false, 
        left: -80,
        title: false,
    });
    
    const [pacmanData, setPacmanData] = useState ({
        ghostPosition: 85,
        dots: [],
        isGhostMoving: false,
        isPacmanEating: false,
        pacmanPosition: 110,
        gameOver: false,
        isGhostBefore: true,
        isGhostAfter: false,
        right: -100,
        title: false,
    });

    const token = getCookies('token');
    let user = null;
    
    if (token) {
        try {
            user = jwtDecode(token);
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    };

   useEffect(() => {
        if (tournamentStarted && !socket) {
            const newSocket = new WebSocket(`ws://${window.location.hostname}:8000/ws/tournament/${tournamentResponse.code}/?token=${token}`);
            setSocket(newSocket);
            newSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("creator : ", data);            
                if (data.game_id && data.player1 === user.name || data.player2 === user.name) {
                    navigate(`/games/${data.game_id}`);
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
      }, [socket, tournamentStarted]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMarioData((prev) => ({
                ...prev,
                left: prev.left < 0 ? prev.left + 20 : prev.left
            }));
        }, 500);
    
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPacmanData((prev) => ({
                ...prev,
                right: prev.right < 0 ? prev.right + 20 : prev.right
            }));
        }, 500);
    
        return () => clearInterval(interval);
    }, []);
    
    const handleStartTournament = () => {
        setTournamentStarted(true);
    };

    const handleClickGhost = () => {

        if (pacmanData.gameOver) {
            setPacmanData(prevState => ({
                ...prevState,
                gameOver: false,
                title: false,
            }));
        } else {
            setPacmanData(prevState => ({
                ...prevState,
                isGhostBefore: !prevState.isGhostBefore,
                isGhostAfter: !prevState.isGhostAfter,
                isGhostMoving: !prevState.isGhostMoving,
                isPacmanEating: !prevState.isPacmanEating,
                dots: [],
                title: true,
                right: -100,
            }));
        }
    };

    useEffect(() => {
        if (pacmanData.isGhostMoving) {
            const moveInterval = setInterval(() => {
                setPacmanData(prevState => {
                    if (prevState.ghostPosition > 20) {
                        return {
                            ...prevState,
                            ghostPosition: prevState.ghostPosition - 10,
                            dots: [...prevState.dots, prevState.ghostPosition]
                        };
                    } else {
                        clearInterval(moveInterval);
                        setTimeout(() => {
                            setPacmanData(prevState => ({
                                ...prevState,
                                isPacmanEating: true
                            }));
                        }, 500);
                        return { ...prevState, isGhostMoving: false };
                    }
                });
            }, 300);
            return () => clearInterval(moveInterval);
        }
    }, [pacmanData.isGhostMoving]);

    useEffect(() => {
        if (pacmanData.isPacmanEating) {
            const eatInterval = setInterval(() => {
                setPacmanData(prevState => {
                    if (prevState.pacmanPosition > 90) {
                        return { ...prevState, pacmanPosition: prevState.pacmanPosition - 10 };
                    } else if (prevState.pacmanPosition > 20) {
                        return {
                            ...prevState,
                            pacmanPosition: prevState.pacmanPosition - 10,
                            dots: prevState.dots.slice(1)
                        };
                    } else {
                        clearInterval(eatInterval);
                        return {
                            ...prevState,
                            isPacmanEating: false,
                            gameOver: true,
                            isGhostAfter: false,
                            ghostPosition: 85,
                            pacmanPosition: 110,
                            isGhostBefore: true,
                        };
                    }
                });
            }, 300);
            return () => clearInterval(eatInterval);
        }
    }, [pacmanData.isPacmanEating]);

    const handleClickMario = () => {
        if (marioData.isMarioInit) {
                setMarioData(prevState => ({
                ...prevState,
                isMarioInit: false,
                isMarioRun1: true,
                title: true, 
                left: -80,
            }));
        }
        else {
            setMarioData(prevState => ({
                ...prevState,
                isMarioJump: false,
                isMarioInit: true,
                title: false,
            }));
        }

    }    

    useEffect(() => {
        if (marioData.marioPosition < 68) {
            const interval = setInterval(() => {
                setMarioData(prevState => {
                    if (prevState.isMarioRun1) {
                        return {
                            ...prevState,
                            isMarioRun1: false,
                            isMarioRun2: true,
                            marioPosition: prevState.marioPosition + 8,
                        };
                    } else if (prevState.isMarioRun2) {
                        return {
                            ...prevState,
                            isMarioRun2: false,
                            isMarioRun1: true,
                            marioPosition: prevState.marioPosition + 8,
                        };
                    }
                    return prevState;
                });
            }, 200);
    
            return () => clearInterval(interval);
        } else {
            setMarioData(prevState => ({
                ...prevState,
                isMarioRun1: false,
                isMarioRun2: false,
                isMarioJump: true,
                marioPosition: 4,
            }));
        }
    }, [marioData.marioPosition]);
    
    function createCodeTournament() {
        console.log("hello");
        return Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    }

    const createTournement = async () => {
        try {
            const response = await axiosInstance.post(`/game/create_tournament`, { 
                player1 : user.name,
                code : tournamentSettings.tournamentCode,
                timeMaxMinutes : tournamentSettings.maxTimeMinutes,
                timeMaxSeconds :tournamentSettings.maxTimeSecondes,
                scoreMax : tournamentSettings.maxScore,
                size: tournamentSettings.numberPlayer,
             });
            setTournamentResponse(response.data);
        } catch (error) {
          console.error("Error submitting Player:", error);
        }
    };

    useEffect(() => {
        if (ModalTournament === true){
            createTournement();
        }
    }, [tournamentSettings]);
    
    useEffect(() => {
        console.log("tournamentRes : ", tournamentResponse);
    }, [tournamentResponse]); 
    
    const handleClick = () => {
        if (maxScore === 0 || maxTimeMinutes === "00") {
            setErrorMessage("Please enter a score and time!");
            return;
        }
        setErrorMessage("");
        setModalTournament(true);
        setModalCreateTournament(false);
        removeLaunch("createTournament");
        const newTournamentCode = createCodeTournament();
        setTournamentCode(newTournamentCode);
        launching({ newLaunch: 'tournament', setModal: setModalTournament });
    };

    useEffect(() => {
        if (tournamentCode) {
            setSettings({
                tournamentCode: tournamentCode,
                maxTimeMinutes: maxTimeMinutes,
                maxTimeSecondes: maxTimeSecondes,
                maxScore: maxScore,
                numberPlayer: numberPlayer,
            });
        }
    }, [tournamentCode]);

    useEffect(() => {
        if (tournamentResponse.winner)
        {
            setModalResult(true);
            launching({ newLaunch: 'resultTournament', setModal: setModalResult });
        }
    }, [tournamentResponse.winner]);

    const setTournament = (setInfo, min, max, e, isMinutes = false) => {
        const value = parseInt(e.target.value, 10);
    
        if (!isNaN(value)) {
            if (isMinutes) {
                if (value >= min && value <= max) {
                    setInfo(value);
                }
            } else {
                if (value === 0 || value === 30) {
                    if (maxTimeMinutes !== 3 || value === 0) {
                        setInfo(value);
                    }
                }
            }
        }
    };

    useEffect(() => {
        let calculatedColumnBracket = 5;
        if (tournamentSettings.numberPlayer === "2") {
            calculatedColumnBracket -= 2;
        } else if (tournamentSettings.numberPlayer === "4") {
            calculatedColumnBracket = 5;
        }
        setColumnBracket(calculatedColumnBracket);
    }, [tournamentSettings.numberPlayer]);




    const renderImageWithClick = (src, alt, position, onClick, title) => (
        <img
            src={src}
            alt={alt}
            style={position}
            onClick={onClick}
            title={title}
        />
    );
    
    const renderPlayerImages = (numberPlayer, numberPlayerCo) => (
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
        <div className="tournament background h-100 w-100">
            {modalCreateTournament ? (
                <div className="line d-flex flex-direction row w-100 h-100">
                    <div className="column d-flex w-100">
                        <p className="cell-left w-50 text-center">Number of players:</p>
                        <p className="cell-right w-50 text-center text">{numberPlayer}</p>
                    </div>
                    <div className="column d-flex w-100">
                        <p className="cell-left w-50 text-center">Max time:</p>
                        <p className="cell-right w-50 text-center">
                            <input
                                type="number"
                                className="input-max minutes"
                                placeholder="00"
                                value={String(maxTimeMinutes).padStart(2, "0")}
                                onChange={(e) => setTournament(setMaxTimeMinutes, 1, 3, e, true)}
                                min="1"
                                max="3"
                            /> :  
                            <input
                                type="number"
                                className="input-max secondes"
                                placeholder="00"
                                value={String(maxTimeSecondes).padStart(2, "0")}
                                onChange={(e) => setTournament(setMaxTimeSecondes, 0, 30, e)} 
                                min="0"
                                max="30"
                                step="30" 
                            />
                        </p>
                    </div>
                    <div className="column d-flex w-100">
                        <p className="cell-left w-50 text-center">Max score:</p>
                        <p className="cell-right w-50 text-center">
                            <input
                                type="number"
                                className="input-max score"
                                placeholder="00"
                                value={maxScore}
                                onChange={(e) => setTournament(setMaxScore, 1, 11, e, true)}
                                min="1"
                                max="11"
                            />
                        </p>
                    </div>
                    <div className="column d-flex w-100" style={{ marginLeft: "65%" }}>
                        {errorMessage && <p className="error-message-time-score" style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}
                        <button onClick={handleClick} className="cell">Create tournament</button>
                    </div>
                </div>
            ) : (
                <div className="h-100 w-100">
                    {marioData.isMarioJump && renderImageWithClick(piece, "piece", { position: 'absolute', height: '4%', left: '17%', top:'10%' }, () => handleClickMario())}
                    <div style={{ position: 'absolute', height: '50%', top: '15%', left: '0%', width: '23%', overflow: "hidden" }}>
                        <div className="w-100 h-100" style={{ position: 'relative'}}>
                            {marioData.isMarioInit && (
                                <>
                                    {renderImageWithClick(block, "block", { position: 'absolute', height: '8%', right: '15%' })}
                                    {renderImageWithClick(marioInit, "mario", { position: 'absolute', height: '9%', top: '10%', left: '4%', cursor: 'pointer', zIndex: 10 }, () => handleClickMario())}
                                    
                                </>
                            )}
                           {marioData.isMarioRun1 &&  (
                                <>
                                    {renderImageWithClick(block, "block", { position: 'absolute', height: '8%', right: '15%' })}
                                    {renderImageWithClick(marioRun1, "marioRun1", { position: 'absolute', height: '9%', top: '10%', left: `${marioData.marioPosition}%`, cursor: 'pointer', zIndex: 10 })}
                                </>
                            )}

                            {marioData.isMarioRun2 &&  (
                                <>
                                    {renderImageWithClick(block, "block", { position: 'absolute', height: '8%', right: '15%' })}
                                    {renderImageWithClick(marioRun2, "marioRun2", { position: 'absolute', height: '9%', top: '10%', left: `${marioData.marioPosition}%`, cursor: 'pointer', zIndex: 10})}
                                </>
                            )}
                            {marioData.isMarioJump && (
                                <>
                                    {renderImageWithClick(blockAfter, "blockAfter", { position: 'absolute', height: '8%', right: '15%' })}
                                    {renderImageWithClick(marioJump, "marioAfter", { position: 'absolute', height: '8%', top: '8%', left: '67%', cursor: 'pointer', zIndex: 10 }, () => handleClickMario())}
                                </>
                            )}
                            {marioData.title && (
                                <div
                                    className="d-flex tournament-text"
                                    style={{
                                        width: "80%",
                                        height: "20%",
                                        left: `${marioData.left}%`,
                                        position: "absolute",
                                        transition: "left 0.5s ease-in-out",
                                        overflow: "none",
                                         color: '#9632ab',
                                    }}
                                >
                                    ••• settings •••
                                </div> 
                            )}
                           {marioData.isMarioJump && (
                            <div
                                className="w-100 tournament-text"
                                style={{
                                    position: 'absolute',
                                    height: '80%',
                                    top: '15%',
                                    padding: '3%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2%',
                                    paddingLeft: '10%',
                                    paddingRight: '25%',
                                    fontSize: '90%',
                                }}
                            >
                                {tournamentResponse.player1 && (
                                    <div
                                        className="w-100"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            color: 'white',
                                        }}
                                    >
                                        {tournamentResponse.player1}
                                    </div>
                                )}

                                {tournamentResponse.player2 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            color: 'white',
                                        }}
                                    >
                                        {tournamentResponse.player2}
                                        {renderImageWithClick(ban, "ban", { height: '20px'}, null, "KICK")}
                                    </div>
                                )}

                                {tournamentResponse.player3 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            color: 'white',
                                        }}
                                    >
                                        {tournamentResponse.player3}
                                        {renderImageWithClick(ban, "ban", { height: '20px'}, null, "KICK")}
                                    </div>
                                )}

                                {tournamentResponse.player4 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            color: 'white',
                                        }}
                                    >
                                        {tournamentResponse.player4}
                                        {renderImageWithClick(ban, "ban", { height: '20px'}, null, "KICK")}
                                    </div>
                                )}
                                <button className="tournament-text" style={{ height:'10%', fontWeight:'bold', fontSize:'120%', color:'rgb(11, 49, 77)', marginTop: '2%', fontWeight:'bold'}}>START</button>
                                <div
                                    className="w-100 horizontal-line"
                                    style={{ backgroundColor: 'white' }}
                                ></div>
                            </div>
                        )}


                        </div>
                    </div>
                    <div style={{ position: 'absolute', height: '50%', top: '15%', right: '0%', width: '23%', overflow: "hidden" }}>
                        <div className="w-100 h-100" style={{ position: 'relative'}}>
                            {pacmanData.dots.map((dot, index) => (
                                <span key={index} style={{ position: 'absolute', top: '6%', left: `${dot}%`, color: 'white', zIndex: 10 }}>•</span>
                            ))}
                            {pacmanData.isGhostBefore && renderImageWithClick(ghost, "Ghost", { position: 'absolute', height: '8%', top: '6%', left: `${pacmanData.ghostPosition}%`, cursor: 'pointer', zIndex: 10 }, () => handleClickGhost())}
                            {pacmanData.isGhostAfter && renderImageWithClick(ghostAfter, "Ghost After", { position: 'absolute', top: '6%', height: '8%', left: `${pacmanData.ghostPosition}%`, cursor: 'pointer', zIndex: 10 })}
                            {pacmanData.isPacmanEating && renderImageWithClick(pacman, "Pac-Man", { position: 'absolute', top: '6%', height: '30px', left: `${pacmanData.pacmanPosition}%`, zIndex: 10 })}
                            {pacmanData.gameOver && (
                                <>
                                    <div className="w-100 h-100 tournament-text" style={{ color:  '#0079bf',fontWeight:'none', position: 'absolute', top: '16%', right: '0%'}}>
                                        <div className="explications title d-flex p-2">
                                            <p>Tournament PONG</p>
                                        </div>
                                        <div className="explications one d-flex p-2" style={{fontSize: '50%', height: '25%', width:'96%', marginLeft:'2%'}}>
                                            The {numberPlayer} players compete 2 against 2. The first to reach {tournamentSettings.maxScore} points or the one who has the most points at the end of the defined time ({tournamentSettings.maxTimeMinutes} : {tournamentSettings.maxTimeSecondes}) qualifies for the next phase until there are 2 players left who will compete for victory.
                                        </div>
                                        <div className="border-top border-2 border-white w-75 mx-auto"></div>
                                        <div className="explications cmd d-flex p-2">
                                            <div className="column h-100 w-50">
                                                <div className="touch p-2">
                                                    <div className="touch-style d-flex flex-column">
                                                        <div className="touch-line">
                                                            <div className="touch-square center">z</div>
                                                        </div>
                                                        <div className="touch-line">
                                                            <div className="touch-square alpha">q</div>
                                                            <div className="touch-square alpha">s</div>
                                                            <div className="touch-square alpha">d</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="player-touch p-2 w-100 h-50">Player 1</div>
                                            </div>
                                            <div className="border-start border-2 border-white border-opacity-25 h-75"></div>
                                            <div className="column h-100 w-50">
                                                <div className="touch p-2">
                                                    <div className="touch-style d-flex flex-column">
                                                        <div className="touch-line">
                                                            <div className="touch-square arrows center">k</div>
                                                        </div>
                                                        <div className="touch-line">
                                                            <div className="touch-square arrows">j</div>
                                                            <div className="touch-square arrows">l</div>
                                                            <div className="touch-square arrows">i</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="player-touch p-2 w-100 h-50">Player 2</div>
                                            </div>
                                        </div>
                                    </div> 
                                </>
                            )}
                            {pacmanData.title && (
                                <div
                                    className="d-flex tournament-text"
                                    style={{
                                        width: "80%",
                                        height: "20%",
                                        right: `${pacmanData.right}%`,
                                        position: "absolute",
                                        transition: "right 0.5s ease-in-out",
                                        overflow: "none",
                                        top: '6%',
                                        color: '#9632ab',
                                    }}
                                >
                                    ••• Rules •••
                                </div>
                            )
                            }
                        </div>
                    </div>
                    <div className="w-100" style={{ position: "absolute", height: "10%", marginTop: "3%" }}>
                        <div className="tournament-text d-flex flex-row w-100">
                            <div className="d-flex flex-column h-100 w-25">Tournament Code</div>
                            <div className="d-flex flex-column h-100 w-25">Time</div>
                            <div className="d-flex flex-column h-100 w-25">Max Score</div>
                            <div className="d-flex flex-column h-100 w-25">Players</div>
                        </div>
                        <div className="tournament-text d-flex flex-row w-100">
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.tournamentCode || "X"} </div>
                            <div className="d-flex flex-column h-100 w-25">
                                {String(tournamentSettings.maxTimeMinutes || "00").padStart(2, "0")} : {String(tournamentSettings.maxTimeSecondes || "00").padStart(2, "0")}
                            </div>
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.maxScore || "0"}</div>
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.numberPlayer || "X"}</div>
                        </div>
                    </div>
                    <div className="players-container d-flex flex-row w-100 " style={{ position: "absolute", height: "12%", marginTop: "11%", textAlign: `center`, alignItems: `center`, justifyContent: `center` }}>
                        <div className="players-co">
                            {renderPlayerImages(numberPlayer, tournamentResponse.size)}
                        </div>
                    </div>
                    <div className="tree-tournament" style={{ height: `70%` }}>
                        <TournamentBracket numberPlayer={numberPlayer} tournamentResponse={tournamentResponse}  onStartTournament={handleStartTournament} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tournament;
