import './game.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axiosInstance from '../instance/AxiosInstance.js';
import useSocket from '../socket.js';


const Gamestest = () => {
	const [game, setGame] = useState(null);
	const { id } = useParams();
	const [score1, setScore1] = useState('');
	const [score2, setScore2] = useState('');
	const [player2, setPlayer2] = useState('');
	const navigate = useNavigate();
	const [isEditingPlayer2, setIsEditingPlayer2] = useState(false);
	const init = 120;
	const [TimeIsOver, setTimeIsOver] = useState(false);
	const [update_time, setupdateTime] = useState(init);
	const timerRef = useRef(init);
	const token = getCookies('token');

	/*const { ready, send } = useSocket(id, (data) => {
		const updatedGame = Json.parse(data);
		setGame(updatedGame);
	});*/
	
	const fetch_data = async () => {
		try {
			const response = await axiosInstance.get(`/game/fetch_data/${id}/`);
			setGame(response.data);
			//console.log("Game data:", response.data);
		} catch (error) {
			console.error("Error fetching game by ID:", error);
		}
	};

	const update_game = async () => {
		try {
			await axiosInstance.patch(`/game/fetch_data/${id}/`, { ...game })
			const ws = new WebSocket('ws://localhost:8000/ws/game/');
			ws.onopen = () => {
				console.log('WebSocket is open');
				ws.send(game.player1);
			};
			ws.onmessage = function(e) {
				console.log('Received:', e.data);
			};
			//setGame(response.data);
		} catch (error) {
			console.error("Error fetching game by ID:", error);
		}
	};

	const handleScoreChange = (player, e) => {
		//console.log(player);
		if (player === game.player1) {
			setScore1(e.target.value);
		}
		else if (player === game.player2) {
			setScore2(e.target.value);
		}


	};

	const submitScore = (player) => {
		//const updatedGame = {};
		if (player === game.player1) {
			const newScore = (parseInt(game?.score1, 10) || 0) + parseInt(score1, 10);
			const updatedGame = { ...game, score1: newScore };
			setGame(updatedGame);
			setScore1('');
		}
		else if (player === game.player2) {
			const newScore = (parseInt(game?.score2, 10) || 0) + parseInt(score2, 10);
			const updatedGame = { ...game, score2: newScore };
			setGame(updatedGame);
			setScore2('');
		}
		//send(updatedGame);

	};

	const namePlayer2 = (e) => {
		setGame({ ...game, player2: e.target.value });
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			setIsEditingPlayer2(true);
			setPlayer2(game.player2);
		}
	};

	const handleStat = async () => {
		game.winner = game.score1 > game.score2 ? game.player1 : game.player2;
		game.loser = game.score1 < game.score2 ? game.player1 : game.player2;
		game.time = update_time;
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		await update_game();
		navigate(`/game/${id}`);
	};

	useEffect(() => {
		fetch_data();
		timerRef.current = setInterval(() => {
			setupdateTime((prevTime) => {
				if (prevTime === 0) {
					clearInterval(timerRef.current);
					setTimeIsOver(true);
					return 0;
				}
				return prevTime - 1;
			});
		}, 1000);
		return () => clearInterval(timerRef.current);
	}, []);

	if (!game) {
		return <div>Loading...</div>;
	}

	return (
		<div className="games-container container-fluid">
			{!TimeIsOver ? (
				<>
					<h1 className="position-absolute title text-center text-white title-overlay w-100">PLAY</h1>
					<h1 className="position-absolute title text-center text-white title-overlay w-100" style={{ top: "150px" }} >{update_time}</h1>
					<div className="d-flex justify-content-center align-items-center w-100 h-100">
						<div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
							<h3>{game?.player1 || 'Player 1'}</h3>
							<p>{game?.score1}</p>
							<div>
								<input
									type="number"
									value={score1}
									onChange={(e) => handleScoreChange(game?.player1, e)}
									placeholder="Enter score"
								/>
								<Button onClick={() => submitScore(game?.player1)}>Submit Score</Button>
							</div>
						</div>

						<div style={{ borderLeft: "2px dashed #ccc", height: "100%", margin: "0 30px" }}></div>
						<div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
							<h3>{game?.player2 || 'Player 2'}</h3>
							{!isEditingPlayer2 ? (
								<input
									type="text"
									value={game.player2 || ''}
									onChange={namePlayer2}
									onKeyDown={handleKeyPress}
									placeholder="Enter name"
								/>
							) : null}
							<p>{game?.score2}</p>
							<div>
								<input
									type="number"
									value={score2}
									onChange={(e) => handleScoreChange(game?.player2, e)}
									placeholder="Enter score"
								/>
								<Button onClick={() => submitScore(game?.player2)}>Submit Score</Button>
							</div>
						</div>
					</div>
				</>
			) : <h1 className="position-absolute d-flex justify-content-center align-items-center w-100 h-100">TIME OUT</h1>}
			<div className="position-absolute w-100 d-flex justify-content-center" style={{ bottom: "20px" }}>
				<Button
					className="btn btn-primary"
					onClick={handleStat}
				>
					STAT
				</Button>
			</div>
		</div>
	);
};

const Games = () => {
	const containerRef = useRef(null);
	const canvasRef = useRef(null);
	const gamebarRef = useRef(null);
	const [startGame, setstartGame] = useState(false);
	const [canvasData, setCanvasData] = useState(null);
	const [paddleData, setPaddleData] = useState({
		rightY: 0,
		leftY: 0,
		width: 10,
		height: 100
	});
	const [game, setGame] = useState(null);
	const { id } = useParams();
	const [backDimensions, setBackDimensions] = useState({ width: 0, height: 750 });

	const fetch_data = async () => {
		try {
			const response = await axiosInstance.get(`/game/fetch_data/${id}/`);
			setGame(response.data);
		} catch (error) {
			console.error("Error fetching game by ID:", error);
		}
	};

	useEffect(() => {
		if (containerRef.current) {
			const width = containerRef.current.offsetWidth;
			const height = containerRef.current.offsetHeight;
			setBackDimensions({ width, height });
		}
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const gamebar = gamebarRef.current;

		if (!canvas || !gamebar) return;

		const contextCanvas = canvas.getContext("2d");
		const contextGamebar = gamebar.getContext("2d");

		setCanvasData({ canvas, contextCanvas, gamebar, contextGamebar });
		fetch_data();
	}, []);

	const create_canva = (canvas, contextCanvas) => {
		canvas.width = backDimensions.width / 1.31;
		canvas.height = backDimensions.height / 1.31;
		canvas.style.position = 'absolute';
		canvas.style.bottom = '8.5%';
		canvas.style.left = backDimensions.width / 2;

		contextCanvas.setLineDash([5, 7]);
		contextCanvas.strokeStyle = "white";
		contextCanvas.lineWidth = 5;

		const lineX = canvas.width / 2;
		contextCanvas.beginPath();
		contextCanvas.moveTo(lineX, 0);
		contextCanvas.lineTo(lineX, canvas.height);
		contextCanvas.stroke();
		contextCanvas.setLineDash([]);
	};

	const createPaddles = (contextCanvas, canvas) => {
		const { width, height, rightY, leftY } = paddleData;
		const paddleRightX = canvas.width - width - canvas.width * 0.05; // 5% à partir de la droite
		const paddleLeftX = canvas.width * 0.05; // 5% à partir de la gauche
		contextCanvas.fillStyle = "white";

		contextCanvas.fillRect(paddleLeftX, leftY, width, height);
		contextCanvas.fillRect(paddleRightX, rightY, width, height);
	};

	const handleKeyPress = (e) => {
		setPaddleData((prev) => {
			let { rightY, leftY, height } = prev;
			switch (e.key) {
				case 'ArrowUp':
					rightY = Math.max(0, rightY - 10);
					break;
				case 'ArrowDown':
					rightY = Math.min(backDimensions.height / 1.31 - height, rightY + 10);
					break;
				case 'z':
					leftY = Math.max(0, leftY - 10);
					break;
				case 's':
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
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [paddleData]);

	useEffect(() => {
		if (startGame) {
		const timer = setTimeout(() => {
			setstartGame(true);  // Après 3 secondes, on met à jour l'état pour afficher le jeu
		}, 3000);
	
		// Nettoyer le timer si le composant est démonté
		return () => clearTimeout(timer);
		}
	}, [startGame]);
	
	useEffect(() => {
		if (canvasData && !startGame) {
		const { canvas, contextCanvas } = canvasData;
		create_canva(canvas, contextCanvas);
		createPaddles(contextCanvas, canvas);
		}
	}, [canvasData, paddleData, startGame]);

	return (
		<div className="games-container container-fluid" ref={containerRef}>
			<div className="game-bar-container">
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
						display: 'flex',
					}}
				>
					<div className="column">
						<div className="red">PLAYER 1</div>
						<div className="white">{game?.player1 || 'Player 1'}</div>
					</div>
					<div className="column">
						<div className="red">SCORE</div>
						<div className="white">{game?.score1 || '00000'}</div>
					</div>
					<div className="column">
						<div className="red">TIME</div>
						<div className="white">000</div>
					</div>
					<div className="column">
						<div className="red">SCORE</div>
						<div className="white">{game?.score2 || '00000'}</div>
					</div>
					<div className="column">
						<div className="red">PLAYER 2</div>
						<div className="white">{game?.player2 || 'Player 2'}</div>
					</div>
				</div>
			</div>
			<canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
		</div>
	);
}




function Game() {
	const [game, setGame] = useState('');
	const { id } = useParams();
	const token = getCookies('token');
	
	
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
   

	/*const handleSubmit = async (e) => {
		try {
			const cookie = getCookies('token');
			if (cookie) {
				const decodeCookie = jwtDecode(cookie);
				console.log(decodeCookie.name);

				// Appel API avec authentification par token
				await axios.post('http://localhost:8000/game/gameDetails', {}, {
					headers: {
						"Content-Type": "application/json",
						'Authorization': `Bearer ${cookie}`,
					},
					withCredentials: true,
				});
			}
		} catch (error) {
			console.error('Erreur lors de la récupération des données utilisateur', error);
		}

		try {
			const response = await axios.get('http://localhost:8000/game/gametest');
			console.log(response.data);
		} catch (error) {
			console.error('Erreur lors de la récupération des données utilisateur', error);
		}
	};*/

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