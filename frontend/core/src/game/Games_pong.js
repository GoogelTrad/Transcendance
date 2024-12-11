import '../Home'
import './Games_pong.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axios from 'axios';

function Game(){
    
    useEffect(() => {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 50, 50);
});
}

function Games_pong() {
    return (
        <div className="games-container container-fluid">
        <h1 className='position-absolute title text-center text-white title-overlay w-100'>pong</h1>
        <canvas >   
        </canvas>
        <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
            <Button type='submit' className='button'>Tournement_</Button>
        </div>
    </div>
    )
}

export default Games_pong