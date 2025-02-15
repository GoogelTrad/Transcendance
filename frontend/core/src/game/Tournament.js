import './Tournament.css';
import React, { useEffect, useState, useRef  } from "react";
import person from '../assets/game/person.svg';
import TournamentBracket from "./TournamentBracket";
import ghost from '../assets/game/ghost2.png';
import pacman from '../assets/game/pacman.png';
import ghostAfter from '../assets/game/ghost3.png';
import piece from '../assets/game/piece.png';
import block from '../assets/game/block.png';
import mario from '../assets/game/mario.png';
import marioBreak from '../assets/game/mario-break.png';
import blockAfter from '../assets/game/blockAfter.png';

function Tournament({ setSettings, tournamentSettings, modalCreateTournament, setModalCreateTournament, setModalTournament, launching, numberPlayer, removeLaunch }) {
    const [maxTimeMinutes, setMaxTimeMinutes] = useState("00");
    const [maxTimeSecondes, setMaxTimeSecondes] = useState("00");
    const [maxScore, setMaxScore] = useState(0);
    const [tournamentCode, setTournamentCode] = useState(8);
    const [columnBracket, setColumnBracket] = useState(0);
    const lineRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [ghostPosition, setGhostPosition] = useState(85); // Fantôme commence à droite
    const [dots, setDots] = useState([]); // Liste des points générés
    const [isGhostMoving, setIsGhostMoving] = useState(false); // Déplacement du fantôme
    const [isPacmanEating, setIsPacmanEating] = useState(false); // Pac-Man commence à manger
    const [pacmanPosition, setPacmanPosition] = useState(110); // Pac-Man démarre hors écran à droite
    const [gameOver, setGameOver] = useState(false); // Fin du jeu
    const [isGhostBefore, setIsGhostBefore] = useState(true); // Nouvelle variable pour garder le fantôme visible
    const [isGhostAfter, setIsGhostAfter] = useState(false);
    const [isMarioOff, setIsMarioOff] = useState(true);
    const [isMarioOn, setIsMarioOn] = useState(false);

    const handleClickMario = () => {
        if (isMarioOn) {
            setIsMarioOn(false);
            setIsMarioOff(true);
        }
        else {
            setIsMarioOff(false);
            setIsMarioOn(true);
        }
    }


    const handleClickGhost = () => {
        if (gameOver)
            setGameOver(false);
        else
        {
            setIsGhostBefore(false);
            setIsGhostAfter(true);
            setIsGhostMoving(true);
            setIsPacmanEating(false);
            setDots([]);
            console.log("dots", dots);     
        }
    };

    // Déplacement du fantôme vers la gauche avec des points derrière
    useEffect(() => {

        if (isGhostMoving) {
            const moveInterval = setInterval(() => {
                setGhostPosition(prev => {
                    if (prev > 20) {
                        setDots(dots => [...dots, prev]); // Ajoute un point derrière le fantôme
                        return prev - 10; // Déplace le fantôme vers la gauche
                    } else {
                        clearInterval(moveInterval);
                        setTimeout(() => {
                            setIsPacmanEating(true); // Pac-Man commence à manger
                        }, 500);
                        setIsGhostMoving(false);
                        return prev;
                    }
                });
            }, 300);

            return () => clearInterval(moveInterval);
        }
    }, [isGhostMoving]);

    // Pac-Man mange les points de droite à gauche
    useEffect(() => {
        if (isPacmanEating) {
            const eatInterval = setInterval(() => {
                setPacmanPosition(prev => {
                    if (prev > 90)
                        return(prev - 10);
                    else if (prev > 20) {
                        console.log("prev = ", prev);
                        setDots(prevDots => prevDots.slice(1));
                        return prev - 10;
                    } else {
                        clearInterval(eatInterval);
                        setIsPacmanEating(false);
                        setGameOver(true);
                        setIsGhostAfter(false);
                        setGhostPosition(85);
                        setPacmanPosition(110);
                        setIsGhostBefore(true);
                        return prev;
                    }
                });
            }, 300);

            return () => clearInterval(eatInterval);
        }
    }, [isPacmanEating]);


    function createCodeTournament() {
        return Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    }
    
    function drawLine(x1, y1, x2, y2) {
        const canvas = lineRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    const handleClick = () => {
        if (maxScore === 0 || maxTimeMinutes === "00") {
            setErrorMessage("Please enter a score and time!");
            return;
        }
        setErrorMessage("");
        setModalTournament(true);
        setModalCreateTournament(false);
        removeLaunch("createTournament");
        setTournamentCode(createCodeTournament());
        setSettings({
            tournamentCode: tournamentCode,
            maxTimeMinutes: maxTimeMinutes,
            maxTimeSecondes: maxTimeSecondes,
            maxScore: maxScore,
            numberPlayer: numberPlayer,
        });
        setMaxScore(0);
        setMaxTimeMinutes("00");
        setMaxTimeSecondes("00");
        launching({ newLaunch: 'tournament', setModal: setModalTournament }); 
    };

    const setTournament = (setInfo, min, max, e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setInfo(Math.max(min, Math.min(max, value)));
        } else {
            setInfo("");
        }
    };

    useEffect(() => {
        console.log("tournamentSettings.numberPlayer", tournamentSettings.numberPlayer);

        let calculatedColumnBracket = 5;
        if (tournamentSettings.numberPlayer === "2") {
            calculatedColumnBracket -= 2;
        } else if (tournamentSettings.numberPlayer === "4") {
            calculatedColumnBracket = 5;
        } else if (tournamentSettings.numberPlayer === "8") {
            calculatedColumnBracket -= 1;
        }
        setColumnBracket(calculatedColumnBracket);

        console.log("cb", calculatedColumnBracket);
    }, [tournamentSettings.numberPlayer]);

    useEffect(() => {
        console.log("columnBracket mis à jour:", columnBracket);
    }, [columnBracket]);


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
                                onChange={(e) => setTournament(setMaxTimeMinutes, 1, 3, e)}
                            /> :  
                            <input
                                type="number"
                                className="input-max secondes"
                                placeholder="00"
                                value={String(maxTimeSecondes).padStart(2, "0")}
                                onChange={(e) => setTournament(setMaxTimeSecondes, 0, 59, e)}
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
                                onChange={(e) => setTournament(setMaxScore, 1, 11, e)}
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
                     {isMarioOn && (
                        <img
                            src={piece}
                            alt="piece"
                            style={{ position: 'absolute', height: '4%', left: '3%', top:'10%' }}
                        />
                     )}
                    <div style={{ position: 'absolute', height: '50%', top: '15%', left: '0%', width: '23%', overflow: "hidden" }}>
                        <div className="w-100 h-100" style={{ position: 'relative'}}>
                        {isMarioOff && (
                            <>
                                <img
                                    src={block}
                                    alt="block"
                                    style={{ position: 'absolute', height: '8%', left: '5%'}}
                                />
                              <img
                                src={mario}
                                alt="mario"
                                style={{ position: 'absolute', height: '9%', top: '10%', left: '4%', cursor: 'pointer', zIndex: 10 }}
                                onClick={() => handleClickMario()}
                            />
                            </>
                        )}
                        {isMarioOn && (
                            <>
                                <img
                                    src={blockAfter}
                                    alt="blockAfter"
                                    style={{ position: 'absolute', height: '8%', left: '12%' }}
                                />
                                <img
                                    src={marioBreak}
                                    alt="marioAfter"
                                    style={{ position: 'absolute', height: '10%', top: '8%', left: '7%', cursor: 'pointer', zIndex: 10  }}
                                    onClick={() => handleClickMario()}
                                />
                                <div  className="d-flex tournament-text" style={{ width:'80%', marginLeft:'20%', height: '20%', textAlign: 'center', alignItems: 'center', justifyContent:'center' }}> ••• settings ••• </div>
                            </>
                        )}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', height: '50%', top: '15%', right: '0%', width: '23%', overflow: "hidden" }}>
                        <div className="w-100 h-100" style={{ position: 'relative'}}>
                            {dots.map((dot, index) => ( 
                                <span key={index} style={{ position: 'absolute', top: '6%', left: `${dot}%`, color: 'white', zIndex: 10  }}>•</span>
                            ))}
                            {isGhostBefore && (
                                <img
                                src={ghost}
                                alt="Ghost"
                                style={{ position: 'absolute', height: '8%', top: '6%', left: `${ghostPosition}%`, cursor: 'pointer', zIndex: 10  }}    
                                onClick={() => handleClickGhost()}
                                />
                            )}
                            {isGhostAfter && (
                                <img
                                    src={ghostAfter}
                                    alt="Ghost After"
                                    style={{ position: 'absolute', top: '6%', height: '8%', left: `${ghostPosition}%`, cursor: 'pointer', zIndex: 10  }}
                                />
                            )}
                            {isPacmanEating && (
                                <img
                                    src={pacman}
                                    alt="Pac-Man"
                                    style={{ position: 'absolute', top: '6%', height: '30px', left: `${pacmanPosition}%`, zIndex: 10 }}
                                />
                            )}
                            {gameOver && (
                                <>
                                    <div className="tournament-text d-flex w-100" style={{ justifyContent: 'center', height: '20%', alignItems: 'center', textAlign: 'center'}}> 
                                        ••• RULES ••• 
                                    </div>
                                    <div className="w-100 h-100 tournament-text" style={{ fontWeight:'none', position: 'absolute', top: '16%', right: '0%'}}>
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
                            {Array.from({ length: numberPlayer }).map((_, index) => (
                                <img key={index} src={person} alt={`Player ${index + 1}`} className="player-icon" />
                            ))}
                        </div>
                    </div>
                    
                    <div className="tree-tournament" style={{ height: `70%` }}>
                        <TournamentBracket numberPlayer={numberPlayer} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tournament;
