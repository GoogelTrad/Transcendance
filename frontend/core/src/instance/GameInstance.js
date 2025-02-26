import './GameInstance.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import useSocket from '../socket.js';
import { throttle } from 'lodash';



function GameInstance ( {children} ) {
    const canvasRef = useRef(null);
	const [isGameOngoing, setisGameOngoing] = useState(true);
	const [waitingForPlayer, setwaitingForPlayer] = useState(false);
	const [timesUp, settimesUp] = useState(true)
	const gamebarRef = useRef(null);
	const [showModal, setShowModal] = useState(true);
    const [showRules, setShowRules] = useState(false);
	const [showFriend, setShowFriend] = useState(false);
	const [game, setGame] = useState(null);
	const [gameStart, setGameStart] = useState(false);
	const { id } = useParams();
	const [isKeyDown, setIsKeyDown] = useState({ ArrowUp: false, ArrowDown: false, z: false, s: false });
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
		Ball_Pos_x : 0,
		Ball_Pos_y : 0,
		Ball_Width: 0,
		Score_P1: 0,
		Score_P2: 0,
		Winner : "",
		Loser : "",
	}));

	const token = getCookies('token');
	let user = null;

	if (token) {
		try {
			user = jwtDecode(token);
		} catch (error) {
			console.error("Error decoding token:", error);
		}
	};

	
	const socketRef = useRef(null);
	  if (!socketRef.current) {
		  socketRef.current = new WebSocket(`ws://${window.location.hostname}:8000/ws/game/${id}`);
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
		}));
		if (data.winner || data.loser)
			setisGameOngoing(false);
	};

	const finishGame = async () => {
		try {
			const response = await axiosInstance.patch(`/game/fetch_data/${id}/`, {
				score_player_1: gameData.Score_P1,
				score_player_2: gameData.Score_P2,
				winner: gameData.Winner,
				loser: gameData.Loser,
				timeSeconds: gameData.Seconds,
				timeMinutes: gameData.Minutes,
				status: 'finished',
		  });
		  setGame(response.data);
		} catch (error) {
		  console.error("Error updating game:", error);
		}
	}

	const toggleDesktop = (name) => {
		if (name === "rules")
			setShowRules((prev) => !prev);
		if (name === "friend")
			setShowFriend((prev) => !prev);
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
		context.arc(
		  gameData.Ball_Pos_x,
		  gameData.Ball_Pos_y,
		  gameData.Ball_Width / 2,
		  0,
		  Math.PI * 2
		);
		context.fillStyle = "white";
		context.fill();
		context.closePath();
	  }, [gameData]);
	  
	  useEffect(() => {
		if (canvasRef.current) {
			const context = canvasRef.current.getContext("2d");
			drawCanvas(context);
		}
	  }, [gameData, drawCanvas]);

	useEffect(() => {
		if (isGameOngoing === false && socket.readyState !== WebSocket.CLOSED){
			finishGame();
			socket.close();
		}
	}, [isGameOngoing])
	  
	
	useEffect(() => {
		if (gameStart === false) {
		const fetchData = async () => {
			try {
				const response = await axiosInstance.get(`/game/fetch_data/${id}/`);
				setGame(response.data);
			} catch (error) {
				console.error("Error fetching game by ID:", error);
			}
		};
		if (!game)
			fetchData();
		if (game && game.player1 === user.name) {
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
					if (sendGameInstance()) {
						clearInterval(retryInterval);
					}
				}, 1000);
				return () => clearInterval(retryInterval);
			}
		}
	}
	}, [socket, backDimensions, game, user.name, id]);
	
	
	let keyUpdateTimeout = null;
	const throttleRate = 30;
	
	const handleKeyPress = (e) => {
		if (isKeyDown[e.key] === undefined) return;
	
		setIsKeyDown((prev) => {
			const updatedKeyDown = { ...prev, [e.key]: true };
			const player = user.name === game.player1 ? "P1" : (user.name === game.player2 ? "P2" : null);
			const gameState = { isKeyDown: updatedKeyDown, player: player };
			
			if (socket.readyState === WebSocket.OPEN && !keyUpdateTimeout) {
				// console.log(gameState);
				keyUpdateTimeout = setTimeout(() => {
					socket.send(JSON.stringify(gameState));
					keyUpdateTimeout = null;
				}, throttleRate);
			}
	
			return updatedKeyDown;
		});
	};
	
	const handleKeyUp = (e) => {
		setIsKeyDown((prev) => {
			const updatedKeyDown = { ...prev, [e.key]: false };
			const player = user.name === game.player1 ? "P1" : (user.name === game.player2 ? "P2" : null);
			const gameState = { isKeyDown: updatedKeyDown, player: player };
			
			if (socket.readyState === WebSocket.OPEN && !keyUpdateTimeout) {
				keyUpdateTimeout = setTimeout(() => {
					socket.send(JSON.stringify(gameState));
					keyUpdateTimeout = null;
				}, throttleRate);
			}
	
			return updatedKeyDown;
		});
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
	}, [gameData]);
	
	return (
		<div className="content-1">

	  		{isGameOngoing ? (
			<>
				<div className="dark-background"></div>
			  <canvas
				className="gamebar"
				ref={gamebarRef}
				style={{
				  width: `${backDimensions.width / 1.292}px`,
				  height: `${backDimensions.height / 10.85}px`,
				}}
			  ></canvas>
	  
			  <div
				className="game-bar"
				style={{
				  width: `${backDimensions.width / 1.292}px`,
				  height: `${backDimensions.height / 10.85}px`,
				  display: "flex",
				}}
			  >
				<div className="column">
				  <div className="red">PLAYER 1</div>
				  <div className="white">{game?.player1 || "Player 1"}</div>
				</div>
				<div className="column">
				  <div className="red">SCORE</div>
				  <div className="white">{gameData.Score_P1 || "0"}</div>
				</div>
				<div className="column">
  				<div className="red">TIME</div>
  				{timesUp ? (
    				game?.timeMinutes != undefined && game?.timeSeconds != undefined
      				? `${gameData.Minutes}:${gameData.Seconds.toString().padStart(2, '0')}`: "3:00"
 				) : (
    			<span>Time's up</span>
  				)}
				</div>
				<div className="column">
				  <div className="red">SCORE</div>
				  <div className="white">{gameData.Score_P2 || "0"}</div>
				</div>
				<div className="column">
				  <div className="red">PLAYER 2</div>
				  <div className="white">{game?.player2 || "Player 2"}</div>
				</div>
			  </div>
	  
			  <canvas
				className="gameCanva"
				ref={canvasRef}
				id="gameCanvas"
			  ></canvas>
			  {waitingForPlayer && (
					<div className="waiting">
					Waiting For Player
					</div>)}
				<div
				className="Show-option Rules"
				onClick={() => toggleDesktop("rules")}
			  >
				Rules
				{showRules && (
				  <div className="show-option rules">
					<div className="explications title d-flex p-2">
					  <p>PONG</p>
					</div>
					<div className="explications one d-flex p-2">
					  You have to score points by sending the ball to the opponent's side. The first one to reach 11 points wins!
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
				)}
			  </div>
	  
			  <div
				className="Show-option FriendInfos"
				onClick={() => toggleDesktop("friend")}
			  >
				STATS
				{showFriend && <div className="show-option friend"></div>}
			  </div>
			</>
		  ) : (
			<div className="game-over">
			  <h1>Game Over!</h1>
			  
			  <div className="final-scores">
				<p>Player 1: {game?.score_player_1 || "0"}</p>
				<p>Player 2: {game?.score_player_2 || "0"}</p>
				<p>Winner: {game?.winner || "No Player"}</p>
				<p>Loser: {game?.loser || "No Player"}</p>
				<p>seconds: {game?.timeSeconds || "Bug"}</p>
				<p>minutes: {game?.timeMinutes || "Bug"}</p>
			  </div>
			</div>
		  )}
		</div>
	  );
}
export default GameInstance;