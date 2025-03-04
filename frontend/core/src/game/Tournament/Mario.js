import React, { useState, useEffect } from 'react';
import block from '../../assets/game/block.png';
import marioInit from '../../assets/game/mario-init.png';
import marioRun1 from '../../assets/game/mario-run-1.png';
import marioRun2 from '../../assets/game/mario-run-2.png';
import marioJump from '../../assets/game/mario-jump.png';
import blockAfter from '../../assets/game/blockAfter.png';
import piece from '../../assets/game/piece.png';
import ban from '../../assets/ban.png';
import './Tournament.css';

const MarioSection = ({ tournamentResponse, renderImageWithClick, onKickPlayer, onStartTournament }) => {
    const [marioData, setMarioData] = useState({
        marioPosition: 4,
        isMarioInit: true,
        isMarioRun1: false,
        isMarioRun2: false,
        isMarioJump: false,
        left: -80,
        title: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setMarioData((prev) => ({
                ...prev,
                left: prev.left < 0 ? prev.left + 6 : prev.left
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleClickMario = () => {
        if (marioData.isMarioInit) {
            setMarioData(prevState => ({
                ...prevState,
                isMarioInit: false,
                isMarioRun1: true,
                title: true,
                left: -80,
            }));
        } else {
            setMarioData(prevState => ({
                ...prevState,
                isMarioJump: false,
                isMarioInit: true,
                title: false,
            }));
        }
    };

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

    const renderPlayer = (playerName, showBan = false) => (
        playerName && (
            <div
                className="w-100"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                }}
            >
                {playerName || "player"}
                {showBan && renderImageWithClick(ban, "ban", { height: '20px' }, () => onKickPlayer(playerName), "KICK")}
            </div>
        )
    );

    return (
        <div className="mario-container h-100 w-100" style={{backgroundColor:'transparent'}}>
            {marioData.isMarioJump && renderImageWithClick(
                    piece, 
                    "piece", 
                    { position: 'absolute', height: '4%', left: '11%', top:'13%' }, 
                    handleClickMario
            )}
            <div className="mario-section" style={{position: 'absolute', height: '50%', top:'18%', width: '15%'}}>
                    <div className="w-100 h-100" style={{ position: 'relative', overflow: "hidden" }}>
                        {marioData.isMarioInit && (
                            <>
                                {renderImageWithClick(block, "block", { position: 'absolute', height: '8%', right: '15%' })}
                                {renderImageWithClick(marioInit, "mario", { 
                                    position: 'absolute', 
                                    height: '9%', 
                                    top: '10%', 
                                    left: '4%', 
                                    cursor: 'pointer', 
                                    zIndex: 10 
                                }, handleClickMario)}
                            </>
                        )}

                        {marioData.isMarioRun1 && (
                            <>
                                {renderImageWithClick(block, "block", { position: 'absolute', height: '8%', right: '15%' })}
                                {renderImageWithClick(marioRun1, "marioRun1", { 
                                    position: 'absolute', 
                                    height: '9%', 
                                    top: '10%', 
                                    left: `${marioData.marioPosition}%`, 
                                    cursor: 'pointer', 
                                    zIndex: 10 
                                })}
                            </>
                        )}

                        {marioData.isMarioRun2 && (
                            <>
                                {renderImageWithClick(block, "block", { position: 'absolute', height: '8%', right: '15%' })}
                                {renderImageWithClick(marioRun2, "marioRun2", { 
                                    position: 'absolute', 
                                    height: '9%', 
                                    top: '10%', 
                                    left: `${marioData.marioPosition}%`, 
                                    cursor: 'pointer', 
                                    zIndex: 10 
                                })}
                            </>
                        )}

                        {marioData.isMarioJump && (
                            <>
                                {renderImageWithClick(blockAfter, "blockAfter", { position: 'absolute', height: '8%', right: '15%' })}
                                {renderImageWithClick(marioJump, "marioAfter", { 
                                    position: 'absolute', 
                                    height: '8%', 
                                    top: '8%', 
                                    left: '67%', 
                                    cursor: 'pointer', 
                                    zIndex: 10 
                                }, handleClickMario)}
                            </>
                        )}

                        {marioData.title && (
                            <div
                                className="d-flex tournament-text"
                                style={{
                                    width: "80%",
                                    height: "20%",
                                    left: `${marioData.left + 3}%`,
                                    position: "absolute",
                                    top: "0%",
                                    transition: "left 0.2s ease-in-out",
                                    overflow: "hidden",
                                    color: '#9632ab',
                                    paddingLeft: "15px",
                                }}
                            >
                                ••• players •••
                            </div>
                        )}

                        {marioData.isMarioJump && (
                            <div className="w-100 tournament-text" style={{
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
                            }}>
                                {renderPlayer(tournamentResponse?.player1, false)}
                                {renderPlayer(tournamentResponse?.player2, true)}
                                {renderPlayer(tournamentResponse?.player3, true)}
                                {renderPlayer(tournamentResponse?.player4, true)}

                                <button 
                                    className="tournament-text" 
                                    onClick={onStartTournament}
                                    style={{ 
                                        height:'10%', 
                                        fontSize:'120%', 
                                        color:'rgb(11, 49, 77)', 
                                        marginTop: '2%', 
                                        fontWeight:'bold'
                                    }}
                                >
                                    START
                                </button>

                                <div
                                    className="w-100 horizontal-line"
                                    style={{ backgroundColor: 'white' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
};

export default MarioSection;