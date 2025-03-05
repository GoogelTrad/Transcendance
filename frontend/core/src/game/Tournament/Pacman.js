import React, { useState, useEffect } from 'react';
import ghost from '../../assets/game/ghost2.png';
import pacman from '../../assets/game/pacman.png';
import ghostAfter from '../../assets/game/ghost3.png';

const PacmanSection = ({ tournamentResponse, renderImageWithClick }) => {
    const [pacmanData, setPacmanData] = useState({
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

    useEffect(() => {
        const interval = setInterval(() => {
            setPacmanData((prev) => ({
                ...prev,
                right: prev.right < 0 ? prev.right + 20 : prev.right
            }));
        }, 500);
    
        return () => clearInterval(interval);
    }, []);

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

    return(
        <div style={{ position: 'absolute', height: '65%', top: '15%', right: '0%', width: '16%', overflow: "hidden", backgroundColor:'transparent'}}>
        <div className="w-100 h-100" style={{ position: 'relative'}}>
            {pacmanData.dots.map((dot, index) => (
                <span key={index} style={{ position: 'absolute', top: '6%', left: `${dot}%`, color: 'white', zIndex: 10 }}>•</span>
            ))}
            {pacmanData.isGhostBefore && renderImageWithClick(ghost, "Ghost", { position: 'absolute', height: '5%', top: '6%', left: `${pacmanData.ghostPosition}%`, cursor: 'pointer', zIndex: 10 }, () => handleClickGhost())}
            {pacmanData.isGhostAfter && renderImageWithClick(ghostAfter, "Ghost After", { position: 'absolute', top: '6%', height: '5%', left: `${pacmanData.ghostPosition}%`, cursor: 'pointer', zIndex: 10 })}
            {pacmanData.isPacmanEating && renderImageWithClick(pacman, "Pac-Man", { position: 'absolute', top: '6%', height: '30px', left: `${pacmanData.pacmanPosition}%`, zIndex: 10 })}
            {pacmanData.gameOver && (
                <>
                    <div className="w-100 h-100 tournament-text" style={{ color:  '#0079bf',fontWeight:'none', position: 'absolute', top: '11%', right: '0%'}}>
                        <div className="explications title d-flex p-2">
                            <p>Tournament PONG</p>
                        </div>
                        <div className="explications one d-flex p-2" style={{fontSize: '55%', height: '25%', width:'96%', marginLeft:'2%'}}>
                            The {tournamentResponse.size} players compete 2 against 2. The first to reach {tournamentResponse.maxScore} points or the one who has the most points at the end of the defined time ({tournamentResponse.maxTimeMinutes} : {tournamentResponse.maxTimeSecondes}) qualifies for the next phase. Dans le cas de 2 joueurs, les deux joueurs s'affrontent jusqu'à la finale. Le joueur qui a le meilleur score à la fin du tournoi le remporte. Le classement se fait donc en fonction du score.
                        </div>
                        <div className="border-top border-2 border-white w-75 mx-auto"></div>
                        <div className="explications cmd d-flex p-2">
                            <div className="column h-100 w-50">
                                <div className="touch p-2">
                                    <div className="touch-style d-flex flex-column">
                                        <div className="touch-line">
                                            <div className="touch-square center">↑</div>
                                        </div>
                                        <div className="touch-line">
                                            <div className="touch-square alpha">←</div>
                                            <div className="touch-square alpha">↓</div>
                                            <div className="touch-square alpha">→</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="player-touch p-2 w-100 h-50">TOUCH</div>
                            </div>
                        </div>
                        <div className="w-100" style={{ position: "relative", top: "2%" }}>
                            <div className="w-100 d-flex justify-content-center" style={{ height: "25%" }}>
                                <div className="w-100 text-center" style={{ marginBottom : '5%'}}>BONUS BALL</div>
                            </div>
                            <div className="w-100 d-flex flex-column justify-content-center align-items-center" style={{ height: "75%" }}>
                                <div className="d-flex align-items-center mb-1" style={{fontSize: '70%'}}>
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#ff914d",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                        }}
                                    ></div>
                                    accélération balle
                                </div>
                                <div className="d-flex align-items-center mb-1" style={{fontSize: '70%'}}>
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#00FF00",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                        }}
                                    ></div>
                                    ralentissement balle
                                </div>
                                <div className="d-flex align-items-center mb-1" style={{fontSize: '70%'}}>
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#0000FF",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                        }}
                                    ></div>
                                    agrandissement raquette
                                </div>
                                <div className="d-flex align-items-center mb-1" style={{fontSize: '70%'}}>
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#FFFF00",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                        }}
                                    ></div>
                                    rétrécissement raquette
                                </div>
                                <div className="d-flex align-items-center" style={{fontSize: '70%'}}>
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#FF00FF",
                                            borderRadius: "50%",
                                            marginRight: "8px",
                                        }}
                                    ></div>
                                    double score
                                </div>
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
    );
};


export default PacmanSection;