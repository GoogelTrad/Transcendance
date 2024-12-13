import '../Home'
import './Games_pong.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState} from "react";
import { useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axios from 'axios';
import axiosInstance from '../instance/AxiosInstance.js';


function Games_pong(){
    const location = useLocation();
    const { game } = location.state || {};
    const [gameState, setGame] = useState(game)
    const token = getCookies('token');

    const move_paddle_up = async () => {
        try 
        {
            const reponse = await axiosInstance.patch(`game/paddle_up/${game.id}`, {})
            setGame(reponse.data)
        }
        catch
        {
            console.error("Error Moving Paddle:");
        }}

    const move_paddle_down = async () => {
        try 
        {
            const reponse = await axiosInstance.patch(`game/paddle_down/${game.id}`, {})
            setGame(reponse.data)
        }
        catch
        {
            console.error("Error Moving Paddle:");
        }}
   
    useEffect(() => {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "purple";
        const handleKeyPress = (event) => {
            if (event.key === "ArrowUp" && gameState.player1_paddle_y > 0) {
                move_paddle_up();
             } else if (event.key === "ArrowDown" && gameState.player1_paddle_y < 100) {
                move_paddle_down();
             }
        };
        ctx.fillRect(gameState.player1_paddle_x, gameState.player1_paddle_y, 10, 50);
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    },[gameState]);
    return (
        <div className="games-container container-fluid">
        <h1 className='position-absolute title text-center text-white title-overlay w-100'> PONG </h1>
        <canvas >
        </canvas>
    </div>
    )
}
export default Games_pong