import './game.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jwtDecode } from "jwt-decode";
import { useUserInfo } from '../instance/TokenInstance';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import useSocket from '../socket.js';
import Template from '../instance/Template.js';
import GameInstance from '../instance/GameInstance.js';

const Games = () => {
	
	// const canvasRef = useRef(null);
	// const gamebarRef = useRef(null);
	// const [startGame, setStartGame] = useState(false);
	// const [canvasData, setCanvasData] = useState(null);
	// const [showModal, setShowModal] = useState(true);
	// const [paddleData, setPaddleData] = useState({
	// 	rightY: 0,
	// 	leftY: 0,
	// 	width: 17,
	// 	height: 170,
	// });
	// const [game, setGame] = useState(null);
	// const { id } = useParams();
	// const [backDimensions, setBackDimensions] = useState({ width: 0, height: 750 });
  
	// const fetchData = async () => {
	//   try {
	// 	const response = await axiosInstance.get(`/game/fetch_data/${id}/`);
	// 	setGame(response.data);
	//   } catch (error) {
	// 	console.error("Error fetching game by ID:", error);
	//   }
	// };
  
	// useEffect(() => {
	// 	const width = window.innerWidth;
	// 	const height = window.innerHeight;
	// 	setBackDimensions({ width, height });
	// }, []);
  
	// useEffect(() => {
	// 	if (canvasRef.current && showModal) {
	// 		const canvas = canvasRef.current;
	// 		const modalWidth = backDimensions.width;
	// 		const modalHeight = backDimensions.height;

	// 		canvas.width = modalWidth;
	// 		canvas.height = modalHeight;
	// 		const context = canvas.getContext("2d");
	// 	}
        
	//   }, [showModal, backDimensions]);

	// const handleKeyPress = (e) => {
	//   setPaddleData((prev) => {
	// 	let { rightY, leftY, height } = prev;
	// 	switch (e.key) {
	// 	  case "ArrowUp":
	// 		rightY = Math.max(0, rightY - 10);
	// 		break;
	// 	  case "ArrowDown":
	// 		rightY = Math.min(backDimensions.height / 1.31 - height, rightY + 10);
	// 		break;
	// 	  case "z":
	// 		leftY = Math.max(0, leftY - 10);
	// 		break;
	// 	  case "s":
	// 		leftY = Math.min(backDimensions.height / 1.31 - height, leftY + 10);
	// 		break;
	// 	  default:
	// 		break;
	// 	}
	// 	return { ...prev, rightY, leftY };
	//   });
	// };
  
	// useEffect(() => {
	//   const handleKeyDown = (e) => handleKeyPress(e);
	//   window.addEventListener("keydown", handleKeyDown);
	//   return () => window.removeEventListener("keydown", handleKeyDown);
	// }, [paddleData]);

	// useEffect(() => {
	// 	if (canvasRef.current) {
	// 	  const canvas = canvasRef.current;
	// 	  const context = canvas.getContext("2d");
	  
	// 	  context.clearRect(0, 0, canvas.width, canvas.height);
	  
	// 	  const { width, height, rightY, leftY } = paddleData;
	// 	  const paddleRightX = canvas.width - width - canvas.width * 0.05;
	// 	  const paddleLeftX = canvas.width * 0.05;
	// 	  context.fillStyle = "white";
	// 	  context.fillRect(paddleLeftX, leftY, width, height);
	// 	  context.fillRect(paddleRightX, rightY, width, height);
	// 	}
	//   }, [paddleData, showModal]);
  
	// useEffect(() => {
	//   fetchData();
	// }, []);
  
	return (
	  <Template>
		{/*appArray={setters}
		launching={launching}
		*/}
		<GameInstance>

		</GameInstance>
        {/* <div className="content-1">
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
			</div> */}
	  </Template>
	);
  };

function Game() {
	const [game, setGame] = useState('');
	const { id } = useParams();
	
	const { tokenUser } = useUserInfo();
	const token = tokenUser;
	
	
	const fetch_data = async () => {
		try {
			const response = await axios.get(`http://localhost:8000/game/fetch_data/${id}/`, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				}
			});
			setGame(response.data);
		} catch (error) {
			console.error("Error fetching game by ID:", error);
		}
	};

	 useEffect(() => {
		fetch_data();
	}, []);
   
	return (
		<div>
			<div className="games-container container-fluid">
				<h1 className="position-absolute title text-center text-white title-overlay w-100">STAT</h1>
				<h1 className="position-absolute title text-center text-white title-overlay w-100" style={{ top: "120px" }}>TIME : {game?.time}</h1>
				<div className="d-flex justify-content-center align-items-center w-100 h-100">
					<div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
						<p> Player1 : {game?.player1}</p>
						<p> Score1 : {game?.score1} </p>
						<h2 className="position-absolute title text-center text-white title-overlay w-100" style={{ bottom: "120px" }} >WINNER : {game?.winner}</h2>
					</div>
					<div style={{ borderLeft: "2px dashed #ccc", height: "100%", margin: "0 30px" }}></div>
					<div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
						<p> Player 2 : {game?.player2} </p>
						<p> Score2 : {game?.score2} </p>
						<h2 className="position-absolute title text-center text-white title-overlay w-100 " style={{ bottom: "120px" }} >Loser : {game?.loser}</h2>
					</div>
				</div>
			</div>
		</div>
	);
}

export { Game, Games };