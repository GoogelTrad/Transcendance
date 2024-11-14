import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './Welcome_game.css';
import './Game.js'

function Welcome_game() {
    return (
            <div>
            <div className="home">
                <h1 className="title"> PONG </h1>
                <button className="buttonGame">
                    <Link to="/Game" class="text-decoration-none text-dark">Play</Link>
                </button>
            </div>
        </div>

    );
}

export default Welcome_game;