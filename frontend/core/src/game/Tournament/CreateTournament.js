import React, { useState, useEffect } from 'react';
import axiosInstance from "../../instance/AxiosInstance";
import { useNavigate } from 'react-router-dom';
import './Tournament.css';
import { showToast } from '../../instance/ToastsInstance';

import { useTranslation } from 'react-i18next';

const CreateTournament = ({ setIsModalTournament, setIsModalCreateTournament, setTournamentCode, launching, removeLaunch, numberPlayer }) => {
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const { t } = useTranslation();

    const [tournamentSettings, setTournamentSettings] = useState({
        maxTimeMinutes: "00",
        maxTimeSecondes: "00",
        maxScore: 0,
        tournamentCode: 0,
        numberPlayer: parseInt(numberPlayer, 10) || 0
    });

    const setTournament = (field, min, max, e, isMinutes = false) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value)) {
            if (isMinutes) {
                if (value >= min && value <= max) {
                    const newMinutes = value.toString().padStart(2, "0");
                    setTournamentSettings(prev => ({
                        ...prev,
                        [field]: newMinutes,
                        maxTimeSecondes: newMinutes === "03" ? "00" : prev.maxTimeSecondes
                    }));
                }
            } else {
                if (value === 0 || value === 30) {
                    if (tournamentSettings.maxTimeMinutes !== "03" || value === 0) {
                        setTournamentSettings(prev => ({
                            ...prev,
                            [field]: value.toString().padStart(2, "0")
                        }));
                    }
                }
            }
        }
    };

    function createCodeTournament() {
        return Math.floor(Math.random() * (999 - 100 + 1)) + 100;
    }

    const createTournament = async () => {
        try {
            const newCode = createCodeTournament();
            const response = await axiosInstance.post(`/api/game/create_tournament`, {
                code: newCode,
                timeMaxMinutes: tournamentSettings.maxTimeMinutes,
                timeMaxSeconds: tournamentSettings.maxTimeSecondes,
                scoreMax: tournamentSettings.maxScore,
                size: tournamentSettings.numberPlayer,
            });
            setTournamentSettings(prev => ({ ...prev, tournamentCode: newCode }));
            return newCode;
        } catch (error) {
            showToast("error", t('Toasts.FailedToCreateTournament'));
            return false;
        }
    };

    useEffect(() => {
        setTournamentSettings(prev => ({
            ...prev,
            numberPlayer: parseInt(numberPlayer, 10) || 0
        }));
    }, [numberPlayer]);

    const handleClick = async () => {
        if (tournamentSettings.maxScore === 0 || tournamentSettings.maxTimeMinutes === "00") {
            showToast("error", ('Toasts.PleaseEnterAScoreAndTime'));
            return;
        }

        setErrorMessage("");
        const result = await createTournament();

        if (result) {
            const newTournamentCode = result;
            setIsModalCreateTournament(false);
            setIsModalTournament(true);
            removeLaunch("createTournament");
            setTournamentCode(newTournamentCode);
            launching({ newLaunch: 'tournament', setModal: setIsModalTournament });
            navigate(`/games/Tournament/${newTournamentCode}` , { state: { makeTournament: true } });
        } else {
            showToast("error", t('Toasts.FailedToCreateTournament'));
        }
    };

    return (
        <div className="tournament background h-100 w-100">
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
                            value={tournamentSettings.maxTimeMinutes}
                            onChange={(e) => setTournament("maxTimeMinutes", 1, 3, e, true)}
                            min="1"
                            max="3"
                        /> :  
                        <input
                            type="number"
                            className="input-max secondes"
                            placeholder="00"
                            value={tournamentSettings.maxTimeSecondes}
                            onChange={(e) => setTournament("maxTimeSecondes", 0, 30, e)}
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
                            value={tournamentSettings.maxScore}
                            onChange={(e) => setTournament("maxScore", 1, 11, e, true)}
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
        </div>
    );
};

export default CreateTournament;