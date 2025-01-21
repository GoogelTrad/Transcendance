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
	const [paddleData, setPaddleData] = useState({
		rightY: 0,
		leftY: 0,
		width: 17,
		height: 170,
	});
	const [game, setGame] = useState(null);
	const { id } = useParams();
	const [backDimensions, setBackDimensions] = useState({ width: 0, height: 750 });
  
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

	const handleKeyPress = (e) => {
	  setPaddleData((prev) => {
		let { rightY, leftY, height } = prev;
		switch (e.key) {
		  case "ArrowUp":
			rightY = Math.max(0, rightY - 10);
			break;
		  case "ArrowDown":
			rightY = Math.min(backDimensions.height / 1.31 - height, rightY + 10);
			break;
		  case "z":
			leftY = Math.max(0, leftY - 10);
			break;
		  case "s":
			leftY = Math.min(backDimensions.height / 1.31 - height, leftY + 10);
			break;
		  default:
			break;
		}
		return { ...prev, rightY, leftY };
	  });
	};
  
	useEffect(() => {
	  const handleKeyDown = (e) => handleKeyPress(e);
	  window.addEventListener("keydown", handleKeyDown);
	  return () => window.removeEventListener("keydown", handleKeyDown);
	}, [paddleData]);

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
		}
	  }, [paddleData, showModal]);
  
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
				className="Show-Rules"
				onClick={() => toggleDesktop("rules")}
			>
				Rules
				{showRules && (
					<div className="show rules">
						<p>PONG</p>
					</div>
				)}
			</div>
            <div className="Show-FriendInfos"
				onClick={() => toggleDesktop("friend")}
			>
				STATS
				{showFriend && (
					<div className="show friend">

					</div>
				)

				}
            </div>

            </div>
	);
  };
export default GameInstance;