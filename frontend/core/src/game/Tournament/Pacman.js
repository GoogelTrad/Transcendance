import React, { useState, useEffect } from 'react';
import ghost from '../../assets/game/ghost2.png';
import pacman from '../../assets/game/pacman.png';
import ghostAfter from '../../assets/game/ghost3.png';
import './Tournament.css';
import { useTranslation } from 'react-i18next';

const PacmanSection = ({ tournamentResponse, renderImageWithClick }) => {

    const { t } = useTranslation();
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
        <div className="pacman" style={{ position: 'absolute', height: '50%', top: '15%', right: '0%', width: '20%', overflow: "hidden", backgroundColor:'transparent'}}>
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
                        <div className="explications title d-flex p-2" style={{ fontSize: 'clamp(0.2rem, 2.5vw, 1.0rem)'}}>
                            <p>{t('TournamentPong')}</p>
                        </div>
                        <div className="explications one" 
                            style={{ 
                                height: '40%', 
                                width: '94%',
                                margin: '10px 3%',
                                fontSize: 'clamp(0.6rem, 1.5vw, 0.9rem)',
                                lineHeight: '1.4' 
                            }}
                        >
                        <div>
                            <p> {t('ExplainTournament', { size: 5, maxScore: 5, maxTimeMinutes: 8, maxTimeSeconds: 0 })}</p>
                        </div>
                        </div>
                        <div className="border-top border-2 border-white w-75 mx-auto"></div>
                        <div className="explications cmd d-flex p-2" style={{ height: '30%'}}>
                            <div className="column h-100 w-100" style={{paddingRight: '5%'}}>
                                <div className="touch p-2 w-100" style={{
                                    height: '70%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div className="touch-style d-flex flex-column" style={{
                                        transform: `scale(${window.innerHeight <= 700 ? '0.6' : '1'})`,
                                        margin: 'auto',
                                        gap: '5px' 
                                    }}>
                                        <div className="touch-line" style={{ marginBottom: '5px' }}>
                                            <div className="touch-square center">↑</div>
                                        </div>
                                        <div className="touch-line">
                                            <div className="touch-square alpha">↓</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="player-touch p-2 d-flex" style={{fontSize: 'clamp(0.5rem, 1.7vw, 1rem)', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{t('Touch')}</div>
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
                        fontSize: 'clamp(0.5rem, 1.7vw, 1rem)',
                    }}
                >
                    ••• {t('Rules')} •••
                </div>
            )
            }
        </div>
    </div>
    );
};


export default PacmanSection;