import '../Home'
import './Games_pong.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { getCookies } from './../App.js';
import axiosInstance from '../instance/AxiosInstance.js';


function Games_pong() {
    const location = useLocation();
    const { game } = location.state || {};
    const [gameState, setGame] = useState(game);
    const token = getCookies('token');
    
    const socketRef = useRef(null);

        if (!socketRef.current) {
            socketRef.current = new WebSocket(`ws://localhost:8000/ws/game/${game.id}`);
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
            setGame((prevState) => ({
                ...prevState,
                player1_paddle_y: data.player1_paddle_y,
            }));
        };

    useEffect(() => {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 500;
        canvas.height = 500;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "purple";
        ctx.fillRect(gameState.player1_paddle_x, gameState.player1_paddle_y, 10, 50);

        const handleKeyPress = (event) => {
            if (event.key === "ArrowUp") {
                console.log("cc")
                socketRef.current.send("paddle_up");
            } else if (event.key === "ArrowDown") {
                socketRef.current.send("paddle_down");
            }
        };

        window.addEventListener("keydown", handleKeyPress);

        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [gameState]);

    return (
        <div className="games-container container-fluid">
            <h1 className="position-absolute title text-center text-white title-overlay w-100"> PONG </h1>
            <canvas />
        </div>
    );
}

export default Games_pong;
