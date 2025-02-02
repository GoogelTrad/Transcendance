import './GameInstance.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import useSocket from '../socket.js';

function GameInstance ( {children} ) {
    const canvasRef = useRef(null);
	const gamebarRef = useRef(null);
	const [startGame, setStartGame] = useState(false);
	const [canvasData, setCanvasData] = useState(null);
	const [showModal, setShowModal] = useState(true);
    const [showRules, setShowRules] = useState(false);
	const [showFriend, setShowFriend] = useState(false);
	const [game, setGame] = useState(null);
	const { id } = useParams();
	const [backDimensions, setBackDimensions] = useState({ width: 0, height: 750 });
	const [paddleData, setPaddleData] = useState({
		rightY: 0,
		leftY: 0,
		width: 17,
		height: 170,
		height_canvas : backDimensions.height,
	});
	const [pongData, setpongData] = useState({
		pos_x: backDimensions.width / 2,
		pos_y: backDimensions.height / 2, 
		width: 20,
		height_canvas : backDimensions.height,
		velocity_x: 4,
    	velocity_y: 4,  
	});
	const [score, setScore] = useState(0);

	const paddleDataRef = useRef({
		rightY: 0,
		leftY: 0,
		width: 17,
		height: 170,
		height_canvas: backDimensions.height,
	});
  
	const fetchData = async () => {
	  try {
		const response = await axiosInstance.get(`/game/fetch_data/${id}/`);
		setGame(response.data);
	  } catch (error) {
		console.error("Error fetching game by ID:", error);
	  }
	};

	const toggleDesktop = (name) => {
		if (name === "rules")
			setShowRules((prev) => !prev);
		if (name === "friend")
			setShowFriend((prev) => !prev);
	};
  



	useEffect(() => {
		const width = window.innerWidth;
		const height = window.innerHeight;
		setBackDimensions({ width, height });
	}, []);
  
	useEffect(() => {
		if (canvasRef.current && showModal) {
			const canvas = canvasRef.current;
			const modalWidth = backDimensions.width;
			const modalHeight = backDimensions.height;
			canvas.width = modalWidth;
			canvas.height = modalHeight;
			const context = canvas.getContext("2d");
		}
        
	  }, [showModal, backDimensions]);


	  const socketRef = useRef(null);

	  if (!socketRef.current) {
		  socketRef.current = new WebSocket(`ws://localhost:8000/ws/game/${id}`);
	  }
  
	  const socket = socketRef.current;
  
	  socket.onopen = () => {
		  console.log("WebSocket connection established.");
	  };
  
	  socket.onclose = () => {
		  console.log("WebSocket connection closed.");
	  };
  
	  socket.onerror = (error) => {
		  console.error("WebSocket error: ", error);
	  };
  
	  socket.onmessage = (event) => {
		  const data = JSON.parse(event.data);
		  setPaddleData((prevState) => ({
			  ...prevState,
			  rightY: data.player1_paddle_y,
			  leftY: data.player2_paddle_y,
		  }));
		  paddleDataRef.current.rightY = data.player1_paddle_y;
		  paddleDataRef.current.leftY = data.player2_paddle_y;
	  };
	  
	  const [isKeyDown, setIsKeyDown] = useState({ ArrowUp: false, ArrowDown: false, z: false, s: false });
  
	  const handleKeyPress = (e) => {
		  if (isKeyDown[e.key] === undefined) return;
		  setIsKeyDown((prev) => {
			  const updatedKeyDown = { ...prev, [e.key]: true };
			  
			  const gameState = { paddleData, isKeyDown: updatedKeyDown };
			  socket.send(JSON.stringify(gameState));
			  
			  return updatedKeyDown;
		  });
		  };
		  
		  const handleKeyUp = (e) => {
			setIsKeyDown((prev) => ({ ...prev, [e.key]: false }));
		  };
		  
		  useEffect(() => {
			window.addEventListener('keydown', handleKeyPress);
			window.addEventListener('keyup', handleKeyUp);
		  
			return () => {
			  window.removeEventListener('keydown', handleKeyPress);
			  window.removeEventListener('keyup', handleKeyUp);
			};
		  }, [paddleData]);
	
	useEffect(() => {
	  const handleKeyDown = (e) => handleKeyPress(e);
	  window.addEventListener("keydown", handleKeyDown);
	  return () => window.removeEventListener("keydown", handleKeyDown);
	}, [paddleData]);

	const drawBall = (context, pongData) => {
		context.beginPath();
		context.arc(pongData.pos_x, pongData.pos_y, pongData.width / 2, 0, Math.PI * 2);
		context.fillStyle = "white";
		context.fill();
		context.closePath();
	};

	useEffect(() => {
		setpongData(prev => ({
		  ...prev,
		  pos_x: backDimensions.width / 2,
		  pos_y: backDimensions.height / 2,
		}));
	  }, [backDimensions]);


	useEffect(() => {
		const updateBallPosition = () => {
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");
			const paddleRightX = canvas.width - paddleData.width - canvas.width * 0.05;
			const paddleLeftX = canvas.width * 0.05;
			
			setpongData(prev => {
				console.log("score : ", score);
				let new_velocity_y = prev.velocity_y;
				let new_velocity_x = prev.velocity_x;
				if (prev.pos_y >= canvas.height) 
				 	new_velocity_y = new_velocity_y * -1;
				if (prev.pos_y <= 0)
					new_velocity_y = new_velocity_y * -1;
				if (prev.pos_x <= paddleLeftX + paddleDataRef.current.width && prev.pos_y >= paddleDataRef.current.leftY && prev.pos_y <= paddleDataRef.current.leftY + paddleDataRef.current.height)
					new_velocity_x = new_velocity_x * -1;
				if (prev.pos_x >= paddleRightX && prev.pos_y >= paddleDataRef.current.rightY && prev.pos_y <= paddleDataRef.current.rightY + paddleDataRef.current.height)
					new_velocity_x = new_velocity_x * -1;
				if (prev.pos_x <= 0) {
					setScore(prevScore => prevScore + 1);
					return {
					  ...prev,
					  pos_x: backDimensions.width / 2,
					  pos_y: backDimensions.height / 2,
					  velocity_x: 4,
					  velocity_y: 4,
					};
				  }
			
				  if (prev.pos_x >= canvas.width) {
					setScore(prevScore => prevScore + 1);
					return {
					  ...prev,
					  pos_x: backDimensions.width / 2,
					  pos_y: backDimensions.height / 2,
					  velocity_x: 4,
					  velocity_y: 4,
					};
				  }
				return {
					...prev,
					pos_x: prev.pos_x + new_velocity_x,
					pos_y: prev.pos_y + new_velocity_y,
					velocity_x: new_velocity_x,
					velocity_y: new_velocity_y,
				};
			});
		};
		const interval = setInterval(updateBallPosition, 1000 / 60);
		return () => clearInterval(interval);
	}, [backDimensions.width]);
	

	useEffect(() => {
		if (canvasRef.current) {
		  const canvas = canvasRef.current;
		  const context = canvas.getContext("2d");
	  
		  context.clearRect(0, 0, canvas.width, canvas.height);
	  
		  const { width, height, rightY, leftY } = paddleData;
		  const paddleRightX = canvas.width - width - canvas.width * 0.05;
		  const paddleLeftX = canvas.width * 0.05;
		  context.fillStyle = "white";
		  context.fillRect(paddleLeftX, leftY, width, height);
		  context.fillRect(paddleRightX, rightY, width, height);
		  drawBall(context, pongData);

		}
	  }, [paddleData, showModal, pongData]);
  
	useEffect(() => {

	  fetchData();
	}, []);
  
	return (
        <div className="content-1">
			<div className="dark-background"></div>
                <canvas
                    className="gamebar"
                    ref={gamebarRef}
                    style={{
                    width: `${backDimensions.width / 1.292}px`,
                    height: `${backDimensions.height / 10.85}px`,
                    }}
                ></canvas>
                <div className="game-bar"
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
                        <div className="white">{game?.score1 || "00000"}</div>
                    </div>
                    <div className="column">
                        <div className="red">TIME</div>
                        <div className="white">000</div>
                    </div>
                    <div className="column">
                        <div className="red">SCORE</div>
                        <div className="white">{game?.score2 || "00000"}</div>
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
							You have to score points by sending the ball to the opponent's side. The first one to reach 11 points wins !
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
								<div className="player-touch p-2 w-100 h-50">
									Player 1
								</div>
						
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
								<div className="player-touch p-2 w-100 h-50">
									Player 2
								</div>
						
							</div>
						</div>
					</div>
				)}
			</div>
            <div className="Show-option FriendInfos"
				onClick={() => toggleDesktop("friend")}
			>
				STATS
				{showFriend && (
					<div className="show-option friend">

					</div>
				)

				}
            </div>

            </div>
	);
  };
export default GameInstance;