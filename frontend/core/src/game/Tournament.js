import './Tournament.css';
import React, { useEffect, useState } from "react";
import person from '../assets/game/person.svg';

function Tournament({ setSettings, tournamentSettings, modalCreateTournament, setModalCreateTournament, setModalTournament, launching, numberPlayer, removeLaunch }) {
    const [maxTimeMinutes, setMaxTimeMinutes] = useState("");
    const [maxTimeSecondes, setMaxTimeSecondes] = useState("");
    const [maxScore, setMaxScore] = useState("");
    const [tournamentCode, setTournamentCode] = useState(8);
    const [columnBracket, setColumnBracket] = useState(0);
    const [numberCol, setNumberCol] = useState(0); // Initialisation correcte

    function createCodeTournament() {
        return Math.floor(Math.random() * (999 - 100 + 1)) + 100;
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
                    <div className="d-flex flex-row w-100 players-container" style={{ position: "absolute", height: "12%", marginTop: "15%" }}>
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
                                            <div key={rowIndex} className="bracket-row d-flex w-100" style={{ height: `${100 / columnBracket}%` }}>
                                                <div className="matchup d-flex align-items-center justify-content-center w-100">
                                                    {tournamentSettings.numberPlayer === "2" && 
                                                        Array.from({ length: 2 }).map((_, colIndex1) => (
                                                            <div style={{ width: '50%', textAlign: 'center' }} key={colIndex1}>cc</div>
                                                        ))
                                                    }
                                                    {tournamentSettings.numberPlayer === "8" && 
                                                        Array.from({ length: calculatedNumberCol }).map((_, colIndex2) => (
                                                            <div style={{ width: `${100 / calculatedNumberCol}%`, textAlign: 'center' }} key={colIndex2}>bob</div>
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
                            <div className="brackets-4 d-flex">
                                <div className="brackets-settings d-flex flex-direction w-100 flex-direction column h-100">
                                    {Array.from({ length: columnBracket}).map((_, rowIndex4) => {
                                        const calculatedNumberCol = Math.floor(numberCol / Math.pow(2, rowIndex4));
                                        return (
                                            <div key={rowIndex4} className="bracket-col flex-direction flex-row-reverse d-flex w-100" style={{ height: `${100 / columnBracket}%` }}>
                                                <div className="matchup d-flex align-items-center justify-content-center w-100">
                                                    {Array.from({ length: calculatedNumberCol }).map((_, rowIndex) => (
                                                        <div style={{ height: `${100 / calculatedNumberCol}%`, textAlign: 'center' }} key={rowIndex}>bob</div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                        })}
                                </div>
                            </div>
                        )

                        }
                    </div>
            )}
        </div>
    );
}

export default Tournament;
