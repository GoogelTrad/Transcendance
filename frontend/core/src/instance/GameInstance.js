import './GameInstance.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import { useAuth } from '../users/AuthContext.js';
import Template from './Template.js';

import { useTranslation } from 'react-i18next';
import { showToast } from './ToastsInstance.js';

function GameInstance({ children }) {

	const { t } = useTranslation();
    const canvasRef = useRef(null);
    const [isGameOngoing, setIsGameOngoing] = useState(true);
    const [waitingForPlayer, setWaitingForPlayer] = useState(false);
    const [timesUp, setTimesUp] = useState(true);
    const [showModal, setShowModal] = useState(true);
    const [game, setGame] = useState(null);
    const [gameStart, setGameStart] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { authorized } = location.state || false;

    const [isKeyDown, setIsKeyDown] = useState({ ArrowUp: false, ArrowDown: false, w: false, s: false });
    const [waitInput, setWaitInput] = useState(false);
    const [backDimensions, setBackDimensions] = useState(() => ({
        width: 1536,
        height: 826,
    }));
    const [gameData, setGameData] = useState(() => ({
        Seconds: 10,
        Minutes: 0,
        PaddleRightY: 0,
        PaddleLeftY: 0,
        PaddleRightX: 0,
        PaddleLeftX: 0,
        PaddleWidth: 0,
        PaddleHeight: 0,
        Ball_Pos_x: 0,
        Ball_Pos_y: 0,
        Ball_Width: 0,
        Score_P1: 0,
        Score_P2: 0,
        Winner: "",
        Loser: "",
        elo_Player1: 0,
        elo_Player2: 0,
        isInTournament: false,
        tournamentCode: 0,
        status: "started"
    }));

	const { userInfo } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (authorized === undefined) {
            navigate("/home");
            return ;
        }
        if (!socketRef.current) {
            socketRef.current = new WebSocket(`${process.env.REACT_APP_SOCKET_IP}ws/game/${id}`);
        }
        socketRef.current.onopen = () => {
            console.log("WebSocket connection established.");
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        socketRef.current.onerror = (error) => {
            showToast("error", t('ToastsError'));
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setGameData((prevState) => ({
                ...prevState,
                Seconds: data.seconds,
                Minutes: data.minutes,
                PaddleRightY: data.paddleRightY,
                PaddleLeftY: data.paddleLeftY,
                PaddleRightX: data.paddleRightX,
                PaddleLeftX: data.paddleLeftX,
                PaddleWidth: data.width,
                PaddleHeight: data.height,
                Ball_Pos_x: data.new_pos_x,
                Ball_Pos_y: data.new_pos_y,
                Ball_Width: data.ball_width,
                Score_P1: data.score_P1,
                Score_P2: data.score_P2,
                Winner: data.winner,
                Loser: data.loser,
                elo_Player1: data.elo_Player1,
                elo_Player2: data.elo_Player2,
                isInTournament: data.isInTournament,
                tournamentCode: data.tournamentCode,
                status: data.status,
            }));
            if (data.winner || data.loser) {
                setIsGameOngoing(false);
            }
        };
        return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [id]);

	const patchTournament = async () => {
		try {
			await axiosInstance.patch(`/api/game/fetch_data_tournament_by_code/${gameData.tournamentCode}/`, {
				winner: "game_over"
		  });
          navigate(`/games/tournament/${gameData.tournamentCode}` , { state: { makeTournament: true , authorized:true } });
		} catch (error) {
            showToast("error", t('ToastsError'));
		}
	}

    const finishGame = async () => {
        try {
            const response = await axiosInstance.patch(`/api/game/fetch_data/${id}/`, {
                score_player_1: gameData.Score_P1,
                score_player_2: gameData.Score_P2,
                winner: gameData.Winner,
                loser: gameData.Loser,
                timeSeconds: gameData.Seconds,
                timeMinutes: gameData.Minutes,
                elo_Player1: gameData.elo_Player1,
                elo_Player2: gameData.elo_Player2,
                status: gameData.status,
            });
            console.log("gamedata :", response.data)
            setGame(response.data);
            if (gameData.isInTournament === true)
                {
                    await patchTournament()
                }
        } catch (error) {
            showToast("error", t('ToastsError'));
        }
    };

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get(`/api/game/fetch_data/${id}/`);
            if (response.data.status == "aborted" || response.data.status == "finished"){
                setGameData(response.data);
                setIsGameOngoing(false);
            }
        } catch (error) {
            showToast("error", t('ToastsError'));
            navigate('/home');
        }
    }

	useEffect(() => {
		if (gameStart === false) {
			const fetchData = async () => {
				try {
					const response = await axiosInstance.get(`/api/game/fetch_data/${id}/`);
					console.log(response.data)
					setGame(response.data);
					setWaitInput(true);
				} catch (error) {
					showToast("error", t('ToastsError'));
				}
			}
		}
	}, []);

    useEffect(() => {
        if (canvasRef.current && showModal) {
            const canvas = canvasRef.current;
            const modalWidth = backDimensions.width;
            const modalHeight = backDimensions.height;
            canvas.width = modalWidth;
            canvas.height = modalHeight;
        }
    }, [showModal, backDimensions]);

    const drawCanvas = useCallback((context) => {
		if (!canvasRef.current) return;
	
		context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		context.fillStyle = "white";
		context.fillRect(
			gameData.PaddleLeftX,
			gameData.PaddleLeftY,
			gameData.PaddleWidth,
			gameData.PaddleHeight
		);
		context.fillRect(
			gameData.PaddleRightX,
			gameData.PaddleRightY,
			gameData.PaddleWidth,
			gameData.PaddleHeight
		);
        context.beginPath();
		context.arc(gameData.Ball_Pos_x, gameData.Ball_Pos_y, gameData.Ball_Width / 2, 0, Math.PI * 2);
		context.fillStyle = 'white';
		context.fill();
		context.closePath();
	}, [gameData]);

	useEffect(() => {
		if (canvasRef.current && isGameOngoing) {
			const context = canvasRef.current.getContext("2d");
			let animationFrameId;
	
			const animate = () => {
				drawCanvas(context);
				animationFrameId = requestAnimationFrame(animate);
			};
			animate();
	
			return () => cancelAnimationFrame(animationFrameId);
		}
	}, [drawCanvas, isGameOngoing]);
	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			canvas.width = backDimensions.width; 
			canvas.height = backDimensions.height;
		}
	}, [backDimensions]);

    useEffect(() => {
        if (!isGameOngoing) {
            finishGame();
        }
    }, [isGameOngoing]);

    useEffect(() => {
        if (!gameStart) {
            const fetchData = async () => {
                try {
                    const response = await axiosInstance.get(`/api/game/fetch_data/${id}/`);
                    setGame(response.data);
                    setWaitInput(true);
                } catch (error) {
                    showToast("error", t('ToastsError'));
                }
            };
            if (!game) fetchData();

            if (game && game.player1 === userInfo.name) {
                const sendGameInstance = () => {
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({ "message": "Hello from Player 1" }));
                        setGameStart(true);
                        return true;
                    }
                    return false;
                };
                if (!sendGameInstance()) {
                    const retryInterval = setInterval(() => {
                        if (sendGameInstance()) clearInterval(retryInterval);
                    }, 1000);
                    return () => clearInterval(retryInterval);
                }
            }
        }
    }, [backDimensions, game, userInfo.name, id]);

    let keyUpdateTimeout = null;
    const throttleRate = 5;
    
    const sendGameState = (updatedKeyDown) => {
        const player = userInfo.name === game.player1 ? "P1" : (userInfo.name === game.player2 ? "P2" : null);
        const gameState = { isKeyDown: updatedKeyDown, player };
    
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && !keyUpdateTimeout) {
            keyUpdateTimeout = setTimeout(() => {
                socketRef.current?.send(JSON.stringify(gameState));
                keyUpdateTimeout = null;
            }, throttleRate);
        }
    };
    
    const handleKeyPress = (e) => {
        if (isKeyDown[e.key] === undefined || !waitInput) return;
    
        setIsKeyDown((prev) => {
            if (prev[e.key] !== true) {
                const updatedKeyDown = { ...prev, [e.key]: true };
                sendGameState(updatedKeyDown);
                return updatedKeyDown;
            }
            return prev;
        });
    };
    
    const handleKeyUp = (e) => {
        if (isKeyDown[e.key] === undefined || !waitInput) return;
    
        setIsKeyDown((prev) => {
            if (prev[e.key] !== false) {
                const updatedKeyDown = { ...prev, [e.key]: false };
                sendGameState(updatedKeyDown);
                return updatedKeyDown;
            }
            return prev;
        });
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [waitInput]); 

    const  quitToHome = async () => {
        if (gameData.isInTournament === true){
            await patchTournament()
            navigate(`/games/tournament/${gameData.tournamentCode}` , { state: { makeTournament: true , authorized:true } });
        }
        else
            navigate(`/home`);
    };



    return (
        <Template>
            <div className="content-1">
                {isGameOngoing ? (
                    <>
                        <div className="dark-background"></div>
                        <div className="d-flex backgroundGame" style={{ height: '85%', top: '5%', width: '80%', position: 'absolute', left: '10%', backgroundColor: 'white' }}>
                            <div className="game-bar w-100" style={{ height: '15%' }}>
                                <div className="column">
                                    <div className="red">{t('PLAYER1')}</div>
                                    <div>{game?.player1 || "Player 1"}</div>
                                </div>
                                <div className="column">
                                    <div className="red">{t('SCORE')}</div>
                                    <div>{gameData.Score_P1 || "0"}</div>
                                </div>
                                <div className="column">
                                    <div className="red">{t('TIME')}</div>
                                    {timesUp ? (
                                        game?.timeMinutes !== undefined && game?.timeSeconds !== undefined
                                            ? `${gameData.Minutes}:${gameData.Seconds.toString().padStart(2, '0')}`
                                            : "3:00"
                                    ) : (
                                        <span>{t("Time'sUp")}</span>
                                    )}
                                </div>
                                <div className="column">
                                    <div className="red">{t('SCORE')}</div>
                                    <div>{gameData.Score_P2 || "0"}</div>
                                </div>
                                <div className="column">
                                    <div className="red">{t('PLAYER2')}</div>
                                    <div>{game?.player2 || "Player 2"}</div>
                                </div>
                            </div>
                            <canvas className="gameCanva" ref={canvasRef} id="gameCanvas"></canvas>
                            <div className="w-100" style={{ height: '2%', backgroundColor: 'black', bottom: '15%', position: 'absolute' }}></div>
                            <div className="w-100" style={{ height: '2%', backgroundColor: 'black', bottom: '20%', position: 'absolute' }}></div>
                            <div className="w-100 h-100 d-flex">
                                <div className="controller left d-flex">
                                    <div className="touch-controller-left d-flex" style={{ height: '50%', width: '20%', left: '37.5%', top: '5%', fontSize: '110%', alignItems: 'flex-start' }}>▲</div>
                                    <div className="touch-controller-left d-flex" style={{ height: '20%', width: '50%', top: '37.5%', left: '5%', alignItems: 'center', justifyContent: 'start' }}>◀</div>
                                    <div className="touch-controller-left d-flex" style={{ height: '20%', width: '50%', top: '37.5%', right: '5%', alignItems: 'center', justifyContent: 'end' }}>▶</div>
                                    <div className="touch-controller-left d-flex" style={{ height: '50%', width: '20%', left: '37.5%', bottom: '5%', fontSize: '110%', alignItems: 'flex-end' }}>▼</div>
                                </div>
                                <div className="controller right d-flex">
                                    <div className="touch-controller-right" style={{ left: '37.5%', top: '5%' }}>X</div>
                                    <div className="touch-controller-right" style={{ top: '37.5%', left: '5%' }}>Y</div>
                                    <div className="touch-controller-right" style={{ top: '37.5%', right: '5%' }}>A</div>
                                    <div className="touch-controller-right" style={{ left: '37.5%', bottom: '5%' }}>B</div>
                                </div>
                                <div className="w-100 d-flex" style={{ fontSize: '150%', fontStyle: 'italic', fontWeight: 'bold', position: 'absolute', bottom: '0%', height: '10%', color: 'grey', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                    {t('GAMECONTROLLER')}
                                </div>
                                <div className="w-100" style={{ height: '10%', position: 'absolute', bottom: '27%' }}>
                                    <div className="touch-btn" style={{ left: '8%' }}></div>
                                    <div style={{ position: 'absolute', fontWeight: 'bold', left: '8.2%', top: '60%', color: 'black', fontSize: 'clamp(0.7rem, 1vw, 1.5rem)'  }}>{t('Menu')}</div>
                                    <div className="touch-btn" style={{ left: '83%' }}></div>
                                    <div style={{ position: 'absolute', fontWeight: 'bold', left: '83%', top: '60%', color: 'black', fontSize: 'clamp(0.7rem, 1vw, 1.5rem)'  }}>{t('Select')}</div>
                                    <div className="touch-btn" style={{ left: '93%' }}></div>
                                    <div style={{ position: 'absolute', fontWeight: 'bold', left: '93.5%', top: '60%', color: 'black', fontSize: 'clamp(0.7rem, 1vw, 1.5rem)'  }}>{t('Start')}</div>
                                </div>
                            </div>
                        </div>
                        {waitingForPlayer && (
                            <div className="waiting">
                                {t('WaitingPlayer')}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="game-over d-flex flex-column w-100 h-100">
                        <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '40%' }}>
                            <h1 className="title-gameOver" >{t('GameOver')}</h1>
                        </div>
                        <div className=" d-flex justify-content-center align-items-center w-100" style={{ height: '30%' }}>
                            <div className="final-scores d-flex justify-content-around w-100">
                                <div className="score-column text-center">
                                    <p className="title-column">{t('Score player1')}</p>
                                    <p>{game?.score_player_1 || "0"}</p>
                                </div>
                                <div className="score-column text-center">
                                    <p className="title-column">{t('Score player2')}</p>
                                    <p>{game?.score_player_2 || "0"}</p>
                                </div>
                                <div className="score-column text-center">
                                    <p className="title-column">{t('Winner')}</p>
                                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{game?.winner || "No Player"}</p>
                                </div>
                                <div className="score-column text-center">
                                    <p className="title-column">{t('Loser')}</p>
                                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{game?.loser || "No Player"}</p>
                                </div>
                                <div className="score-column text-center">
                                    <p className="title-column">{t('Time')}</p>
                                    <p>{game?.timeMinutes || "0"}:{game?.timeSeconds || "0"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center align-items-center w-100">
                            <div 
                                className="exit-button p-3" 
                                onClick={() => quitToHome()}
                                style={{ cursor: 'pointer' }}
                            > 
                                {t('EXIT')} 
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Template>
    );
}

export default GameInstance;