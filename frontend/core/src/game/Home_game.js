import './Home_game.css'
import '../Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axiosInstance from "../instance/AxiosInstance";

function Home_game() {
	const [player1, setPlayer1] = useState("");
	const navigate = useNavigate();
	const canvasRefPlay = useRef(null);  
	const canvasRefTournament = useRef(null);
  
	const token = getCookies('token');
	const user = jwtDecode(token);
  
	const drawTriangleWithAnimation = (canvasRef) => {
		const canvas = canvasRef.current;
	  
		if (canvas) {
		  const context = canvas.getContext('2d');
		  canvas.width = 50;
		  canvas.height = 50;
	  
		  context.clearRect(0, 0, canvas.width, canvas.height);  // Effacer l'ancien dessin
		  context.beginPath();
		  context.moveTo(10, 0);
		  context.lineTo(10, 40);
		  context.lineTo(50, 20);
		  context.closePath();
	  
		  // Déclarez une variable pour contrôler l'animation
		  const startTime = Date.now(); // Enregistre l'heure de départ
	  
		  const animateTriangle = () => {
			const elapsedTime = (Date.now() - startTime) / 1000; // Divisez par un plus petit nombre pour accélérer l'animation (1000 au lieu de 2000)
			const colorProgress = (elapsedTime % 1); // S'assure que l'animation oscille entre 0 et 1
	  
			// Calcul de la couleur entre orange et blanc
			let color;
			if (colorProgress < 0.5) {
			  // Transition de l'orange au blanc
			  const factor = colorProgress * 2; // Facteur pour passer de orange à blanc
			  color = `rgb(${255}, ${102 + (153 * factor)}, 0)`;  // Orange vers blanc
			} else {
			  // Transition du blanc à l'orange
			  const factor = (1 - colorProgress) * 2; // Facteur pour revenir à orange
			  color = `rgb(${255}, ${102 + (153 * factor)}, 0)`;  // Blanc vers orange
			}
	  
			// Crée un gradient dynamique entre orange et blanc
			const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
			gradient.addColorStop(0, color);  // Applique la couleur animée
			gradient.addColorStop(1, 'white');  // Fin du gradient : blanc
	  
			context.lineWidth = 4;
			context.strokeStyle = gradient;  // Applique le gradient à la bordure
			context.fillStyle = gradient;    // Applique le gradient au remplissage
			context.stroke();
			context.fill();
	  
			requestAnimationFrame(animateTriangle); // Redemande l'animation
		  };
	  
		  animateTriangle(); // Démarre l'animation
		}
	  };
	  
	  

	// Utilisation des useEffect pour dessiner les triangles lorsque les éléments sont montés
	useEffect(() => {
	  if (canvasRefPlay.current) {
		drawTriangleWithAnimation(canvasRefPlay); // Dessine pour le bouton Play_
	  }
	  if (canvasRefTournament.current) {
		drawTriangleWithAnimation(canvasRefTournament); // Dessine pour le bouton Tournament_
	  }
	}, []);
  
	// Mettre à jour le nom du joueur
	useEffect(() => {
	  if (user && user.name) {
		setPlayer1(user.name);
	  }
	}, [user]);
  
	// Fonction pour soumettre le joueur
	const submitPlayer = async () => {
	  try {
		const response = await axiosInstance.post(`http://localhost:8000/game/create_game`, { player1 });
		console.log(response.data);
		navigate(`/games/${response.data.id}`);
	  } catch (error) {
		console.error("Error submitting Player:", error);
	  }
	};
  
	return (
	  <>
		<div className="games-container container-fluid">
		  <div className="d-flex flex-column align-items-right justify-content-center col-12 col-md-5 flex-grow-1">
			<Button
			  type="submit"
			  className="button"
			  onClick={submitPlayer}
			>
			  <canvas ref={canvasRefPlay}></canvas>
			  Play_
			</Button>
		  </div>
		  <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
			<Button type="submit" className="button">
			  <canvas ref={canvasRefTournament}></canvas>
			  Tournament_
			</Button>
		  </div>
		</div>
	  </>
	);
  }
  
  export default Home_game;