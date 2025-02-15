import './Tournament.css';
import React, { useEffect, useState, useRef  } from "react";
import person from '../assets/game/person.svg';

function Tournament({ setSettings, tournamentSettings, modalCreateTournament, setModalCreateTournament, setModalTournament, launching, numberPlayer, removeLaunch }) {
    const [maxTimeMinutes, setMaxTimeMinutes] = useState("");
    const [maxTimeSecondes, setMaxTimeSecondes] = useState("");
    const [maxScore, setMaxScore] = useState("");
    const [tournamentCode, setTournamentCode] = useState(8);
    const [columnBracket, setColumnBracket] = useState(0);
    const lineRef = useRef(null);
    const canvasRef = useRef(null);
    const bracketRefs = useRef([]);

    const [numberCol, setNumberCol] = useState(0);

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
        setNumberCol(parseInt(tournamentSettings.numberPlayer, 10));

        console.log("cb", calculatedColumnBracket);
    }, [tournamentSettings.numberPlayer]);

    useEffect(() => {
        console.log("columnBracket mis à jour:", columnBracket);
    }, [columnBracket]);

    const width = 10 * numberPlayer;

    return (
        <div className="tournament background h-100 w-100">
            {modalCreateTournament ? (
                <div className="line d-flex flex-direction row w-100 h-100">
                    <div className="column d-flex w-100">
                        <p className="cell-left w-50 text-center">Number of players:</p>
                        <p className="cell-right w-50 text-center">{numberPlayer}</p>
                    </div>
                    <div className="column d-flex w-100">
                        <p className="cell-left w-50 text-center">Max time:</p>
                        <p className="cell-right w-50 text-center">
                            <input 
                                type="number"
                                className="input-max minutes"
                                placeholder="00"
                                value={maxTimeMinutes}
                                onChange={(e) => setTournament(setMaxTimeMinutes, 1, 5, e)}
                            /> :  
                            <input
                                type="number"
                                className="input-max secondes"
                                placeholder="00"
                                value={maxTimeSecondes}
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
                        <button onClick={handleClick} className="cell">Create tournament</button>
                    </div>
                </div>
            ) : (
                <div className="h-100 w-100">
                    <div className="w-100" style={{ position: "absolute", height: "10%", marginTop: "3%" }}>
                        <div className="tournament-text d-flex flex-row w-100">
                            <div className="d-flex flex-column h-100 w-25">Tournament Code</div>
                            <div className="d-flex flex-column h-100 w-25">Time</div>
                            <div className="d-flex flex-column h-100 w-25">Max Score</div>
                            <div className="d-flex flex-column h-100 w-25">Players</div>
                        </div>
                        <div className="tournament-text d-flex flex-row w-100">
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.tournamentCode}</div>
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.maxTimeMinutes} : {tournamentSettings.maxTimeSecondes}</div>
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.maxScore}</div>
                            <div className="d-flex flex-column h-100 w-25">{tournamentSettings.numberPlayer}</div>
                        </div>
                    </div>
                    <div className="players-container d-flex flex-row w-100 " style={{ position: "absolute", height: "12%", marginTop: "11%", textAlign: `center`, alignItems: `center`, justifyContent: `center` }}>
                        <div className="players-co">
                            {Array.from({ length: numberPlayer }).map((_, index) => (
                                <img key={index} src={person} alt={`Player ${index + 1}`} className="player-icon" />
                            ))}
                        </div>
                    </div>
                   
                        {(tournamentSettings.numberPlayer === "2" || tournamentSettings.numberPlayer === "8") && (
                            <div className="brackets d-flex" style={{ width: `${10 * numberPlayer}%`, left: `${(100 - (10 * numberPlayer)) / 2}%` }}>
                                <div className="brackets-settings d-flex flex-direction w-100 flex-column-reverse h-100">
                                    {Array.from({ length: columnBracket }).map((_, rowIndex) => {
                                        const calculatedNumberCol = Math.floor(numberCol / Math.pow(2, rowIndex));
                                        return (
                                            <div key={rowIndex} className="bracket-row d-flex w-100" style={{ height: `${100 / columnBracket}%`, alignItems: `center`, justifyContent: `center`, textAlign: `center` }}>
                                                <div className="matchup d-flex align-items-center justify-content-center w-100">
                                                    {tournamentSettings.numberPlayer === "2" && 
                                                        Array.from({ length: 2 }).map((_, colIndex1) => (
                                                            <div className="elements-tab" style={{ width: '50%', textAlign: 'center' }} key={colIndex1}>cc</div>
                                                        ))
                                                    }
                                                   {tournamentSettings.numberPlayer === "8" && 
                                                        Array.from({ length: calculatedNumberCol }).map((_, colIndex2) => (
                                                            <div  
                                                                style={{ 
                                                                    width: `${100 / calculatedNumberCol}%`,
                                                                    display: 'flex',
                                                                    justifyContent: 'center', 
                                                                    alignItems: 'center' 
                                                                }} 
                                                                key={colIndex2}
                                                            >
                                                                <div className="elements-tab eight"> Bob </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {tournamentSettings.numberPlayer === "4" && (
                            <div className="brackets d-flex w-100">
                                <div className="name-bracket lose"> Loser bracket </div>
                                <div className="name-bracket win"> Winner bracket </div>
                                <div className="brackets-settings d-flex flex-direction w-100 flex-direction column h-100">
                                    {Array.from({ length: columnBracket }).map((_, rowIndex4) => {
                                        let calculatedNumberCol = 0;
                                        if (rowIndex4 < 2) {
                                            calculatedNumberCol = rowIndex4 + 1;
                                        } else if (rowIndex4 == 2) {
                                            calculatedNumberCol = 4;
                                        }else if (rowIndex4 == 4) {
                                            calculatedNumberCol = 1;
                                        }
                                        else {
                                            calculatedNumberCol = 2;
                                        }

                                        return (
                                        <div
                                            key={rowIndex4}
                                            className="bracket-col d-flex flex-row mb-3 h-100 w-100"
                                            >
                                            <div className="matchup d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                                {Array.from({ length: calculatedNumberCol }).map((_, rowIndex) => (
                                                    <div
                                                        style={{
                                                            height: `${100 / calculatedNumberCol}%`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            textAlign: "center",
                                                            width: "100%",
                                                            position: "relative",
                                                        }}
                                                        key={rowIndex}
                                                        >
                                                        <div className="elements-tab"> bob </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        );
                                    })}
                                </div>
                        </div>
                        )}

                    </div>
                    //{Array.from({lenght: 7}).map((_, lineIndex) => (
                    //    <div>
                    //    <canvas 
                    //        ref={canvasRef} 
                    //        width={500}
                    //        height={500}
                    //        style={{ border: "1px solid black", position: "absolute", top: "20%", left: "20%" }}
                    //    ></canvas>
                    //    drawLine(0, 5, 2, 8);
                    //    </div>
                    //))}
            )}
        </div>
    );
}