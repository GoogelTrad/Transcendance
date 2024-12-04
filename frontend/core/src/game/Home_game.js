import './Home_game.css'
import '../Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axios from 'axios';

function Home_game() {
    const [player1, setPlayer1] = useState("");
    const navigate = useNavigate();

    const token = getCookies('token');
    const user = jwtDecode(token);

    useEffect(() => {
        if (user && user.name) {
            setPlayer1(user.name);
        }
    }, [user]);

    const submitPlayer = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/game/create_game`, { player1 }, { 
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            console.log(response.data);
            navigate(`/games/${response.data.id}`);
        } catch (error) {
            console.error("Error submitting Player:", error);
        }
    };

    return (
        <>
        <div className="games-container container-fluid">
            <h1 className='position-absolute title text-center text-white title-overlay w-100'>pong</h1>
            <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
                <Button
                    type='submit'
                    className='button'
                    onClick={submitPlayer}
                >
                    Play_
                </Button>
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-5 flex-grow-1">
                <Button type='submit' className='button'>Tournement_</Button>
            </div>
        </div>
        </>
    );
};

export default Home_game;
