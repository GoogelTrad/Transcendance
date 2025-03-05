import './GameInstance.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import { throttle } from 'lodash';
import { useAuth } from '../users/AuthContext.js';
import Template from './Template.js';

function GameInstance({ children }) {
    const canvasRef = useRef(null);
    const [isGameOngoing, setIsGameOngoing] = useState(true);
    const [waitingForPlayer, setWaitingForPlayer] = useState(false);
    const [timesUp, setTimesUp] = useState(true);
    const [showModal, setShowModal] = useState(true);
    const [game, setGame] = useState(null);
    const [gameStart, setGameStart] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const [isKeyDown, setIsKeyDown] = useState({ ArrowUp: false, ArrowDown: false, z: false, s: false });
    const [waitInput, setWaitInput] = useState(false);
    const [ballColor, setBallColor] = useState("white"); // Track main ball color
    const [isBonusBall, setIsBonusBall] = useState([
        { name: "SpeedUp", color: "#ff914d", active: false },
        { name: "SpeedDown", color: "#00FF00", active: false },
        { name: "PaddlePlus", color: "#FF00FF", active: false },
        { name: "PaddleMinus", color: "#00FFFF", active: false },
        { name: "ScoreUp", color: "#00FFFF", active: false },
    ]);
    const [bonusBalls, setBonusBalls] = useState([]); 
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
    }));

	const { userInfo } = useAuth();
	const user = userInfo;

	const socketRef = useRef(null);
	  if (!socketRef.current) {
		  socketRef.current = new WebSocket(`${process.env.REACT_APP_SOCKET_IP}ws/game/${id}`);
	  }
	  const socket = socketRef.current;
  
	  socket.onopen = () => {
		  console.log("WebSocket connection established.");
	  };
  
	  socket.onclose = () => {
			finishGame();
			console.log("WebSocket connection closed.");
	  };
  
	  socket.onerror = (error) => {
		  console.error("WebSocket error: ", error);
	  };
  
	  socket.onmessage = (event) => {
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
			Ball_Pos_x : data.new_pos_x,
			Ball_Pos_y : data.new_pos_y,
			Ball_Width: data.ball_width,
			Score_P1: data.score_P1,
			Score_P2: data.score_P2,
			Winner: data.winner,
			Loser: data.loser,
			elo_Player1 : data.elo_Player1,
    		elo_Player2 : data.elo_Player2,
		}));
		if (data.winner || data.loser)
			setIsGameOngoing(false);
		if (data.isInTournament === true)
		{
			patchTournament(data)
            console.log("code2 after patch", data.code)
			navigate(`/games/tournament/${data.code}` , { state: { makeTournament: false } });
		}
	};

	const patchTournament = async (data) => {
		try {
			const response = await axiosInstance.patch(`/api/game/fetch_data_tournament_by_code/${data.code}/`, {
				winner: data.winner
		  });
		} catch (error) {
		  console.error("Error updating game:", error);
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
                status: 'finished',
            });
            setGame(response.data);
            if (game?.player1 === userInfo.name) updateEloP1();
            if (game?.player2 === userInfo.name) updateEloP2();
        } catch (error) {
            console.error("Error updating game:", error);
        }
    };

    const updateEloP1 = async () => {
        try {
            await axiosInstance.patch(`/api/user/${userInfo.id}`, { elo: gameData.elo_Player1 });
        } catch (error) {
            console.error("Error fetching user by ID:", error);
        }
    };

    const updateEloP2 = async () => {
        try {
            await axiosInstance.patch(`/api/user/${userInfo.id}`, { elo: gameData.elo_Player2 });
        } catch (error) {
            console.error("Error fetching user by ID:", error);
        }
    };

	const drawBall = (context, x, y, radius, color) => {
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.fillStyle = color;
		context.fill();
		context.closePath();
	};

	const generateRandomPosition = (canvasWidth, canvasHeight) => {
		return {
			x: Math.random() * (canvasWidth - 40),
			y: Math.random() * (canvasHeight - 40),
			type: Math.floor(Math.random() * isBonusBall.length),
			createdAt: Date.now(),
		};
	};

	useEffect(() => {
		if (isGameOngoing === false && socket.readyState !== WebSocket.CLOSED){
			finishGame();
			socket.close();
		}
	}, [isGameOngoing]);

	useEffect(() => {
		if (gameStart === false) {
			const fetchData = async () => {
				try {
					const response = await axiosInstance.get(`/api/game/fetch_data/${id}/`);
					console.log(response.data)
					setGame(response.data);
					setWaitInput(true);
				} catch (error) {
					console.error("Error fetching game by ID:", error);
				}
			}
		}
	}, []);


	useEffect(() => {
		if (!isGameOngoing || !canvasRef.current) return;

		const generateBonusBall = () => {
			const newBall = generateRandomPosition(canvasRef.current.width, canvasRef.current.height);
			setBonusBalls(prev => [...prev, newBall]);

			setTimeout(() => {
				setBonusBalls(prev => prev.filter(ball => ball.createdAt !== newBall.createdAt));
			}, 10000); 
		};

		const interval = setInterval(generateBonusBall, 30000); 
		return () => clearInterval(interval);
	}, [isGameOngoing]);

	const checkCollision = (mainBallX, mainBallY, mainBallRadius, bonusBallX, bonusBallY, bonusBallRadius) => {
		const dx = mainBallX - bonusBallX;
		const dy = mainBallY - bonusBallY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < (mainBallRadius + bonusBallRadius);
	};

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
	
		const mainBallRadius = gameData.Ball_Width / 2;
		drawBall(context, gameData.Ball_Pos_x, gameData.Ball_Pos_y, mainBallRadius, ballColor);
	
		const bonusBallRadius = 20; 
		bonusBalls.forEach((ball, index) => {
			drawBall(context, ball.x, ball.y, bonusBallRadius, isBonusBall[ball.type].color);
			if (checkCollision(
				gameData.Ball_Pos_x,
				gameData.Ball_Pos_y,
				mainBallRadius,
				ball.x,
				ball.y,
				bonusBallRadius
			)) {
				setBallColor(isBonusBall[ball.type].color); 
				setBonusBalls(prev => prev.filter((_, i) => i !== index));
			}
		});
	}, [gameData, ballColor, bonusBalls]);

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
        if (!isGameOngoing && socket.readyState !== WebSocket.CLOSED) {
            finishGame();
            socket.close();
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
                    console.error("Error fetching game by ID:", error);
                }
            };
            if (!game) fetchData();

            if (game && game.player1 === userInfo.name) {
                const sendGameInstance = () => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ "message": "Hello from Player 1" }));
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
    }, [socket, backDimensions, game, userInfo.name, id]);

    let keyUpdateTimeout = null;
    const throttleRate = 1;

    const handleKeyPress = (e) => {
        if (isKeyDown[e.key] === undefined || !waitInput) return;

        setIsKeyDown((prev) => {
            const updatedKeyDown = { ...prev, [e.key]: true };
            const player = userInfo.name === game.player1 ? "P1" : (userInfo.name === game.player2 ? "P2" : null);
            const gameState = { isKeyDown: updatedKeyDown, player };

            if (socket.readyState === WebSocket.OPEN && !keyUpdateTimeout) {
                keyUpdateTimeout = setTimeout(() => {
                    socket.send(JSON.stringify(gameState));
                    keyUpdateTimeout = null;
                }, throttleRate);
            }
            return updatedKeyDown;
        });
    };

    const handleKeyUp = (e) => {
        if (isKeyDown[e.key] === undefined || !waitInput) return;

        setIsKeyDown((prev) => {
            const updatedKeyDown = { ...prev, [e.key]: false };
            const player = userInfo.name === game.player1 ? "P1" : (userInfo.name === game.player2 ? "P2" : null);
            const gameState = { isKeyDown: updatedKeyDown, player };

            if (socket.readyState === WebSocket.OPEN && !keyUpdateTimeout) {
                keyUpdateTimeout = setTimeout(() => {
                    socket.send(JSON.stringify(gameState));
                    keyUpdateTimeout = null;
                }, throttleRate);
            }
            return updatedKeyDown;
        });
    };

    const quitToHome = () => {
        navigate(`/home`);
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
            }
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameData, game, waitInput]);

    return (
        <Template>
            <div className="content-1">
                {isGameOngoing ? (
                    <>
                        <div className="dark-background"></div>
                        <div className="d-flex backgroundGame" style={{ height: '85%', top: '5%', width: '80%', position: 'absolute', left: '10%', backgroundColor: 'white' }}>
                            <div className="game-bar w-100" style={{ height: '15%' }}>
                                <div className="column">
                                    <div className="red">PLAYER 1</div>
                                    <div>{game?.player1 || "Player 1"}</div>
                                </div>
                                <div className="column">
                                    <div className="red">SCORE</div>
                                    <div>{gameData.Score_P1 || "0"}</div>
                                </div>
                                <div className="column">
                                    <div className="red">TIME</div>
                                    {timesUp ? (
                                        game?.timeMinutes !== undefined && game?.timeSeconds !== undefined
                                            ? `${gameData.Minutes}:${gameData.Seconds.toString().padStart(2, '0')}`
                                            : "3:00"
                                    ) : (
                                        <span>Time's up</span>
                                    )}
                                </div>
                                <div className="column">
                                    <div className="red">SCORE</div>
                                    <div>{gameData.Score_P2 || "0"}</div>
                                </div>
                                <div className="column">
                                    <div className="red">PLAYER 2</div>
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
                                    GAME CONTROLLER
                                </div>
                                <div className="w-100" style={{ height: '10%', position: 'absolute', bottom: '27%' }}>
                                    <div className="touch-btn" style={{ left: '8%' }}></div>
                                    <div style={{ position: 'absolute', fontWeight: 'bold', left: '8.2%', top: '60%', color: 'black' }}>Menu</div>
                                    <div className="touch-btn" style={{ left: '83%' }}></div>
                                    <div style={{ position: 'absolute', fontWeight: 'bold', left: '83%', top: '60%', color: 'black' }}>Select</div>
                                    <div className="touch-btn" style={{ left: '93%' }}></div>
                                    <div style={{ position: 'absolute', fontWeight: 'bold', left: '93.5%', top: '60%', color: 'black' }}>Start</div>
                                </div>
                            </div>
                        </div>
                        {waitingForPlayer && (
                            <div className="waiting">
                                Waiting For Player
                            </div>
                        )}
                    </>
                ) : (
                    <div className="game-over">
                        <h1>Game Over!</h1>
                        <div className="final-scores">
                            <p>Player 1: {game?.score_player_1 || "0"}</p>
                            <p>Player 2: {game?.score_player_2 || "0"}</p>
                            <p>Winner: {game?.winner || "No Player"}</p>
                            <p>Loser: {game?.loser || "No Player"}</p>
                            <p>Seconds: {game?.timeSeconds || "0"}</p>
                            <p>Minutes: {game?.timeMinutes || "0"}</p>
                            <div className="p-2" onClick={() => quitToHome()}> EXIT </div>
                        </div>
                    </div>
                )}
            </div>
        </Template>
    );
}

export default GameInstance;