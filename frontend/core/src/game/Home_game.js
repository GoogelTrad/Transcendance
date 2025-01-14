import './Home_game.css';
import '../Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal, Button } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axiosInstance from "../instance/AxiosInstance";
import Template from '../instance/Template.js';

function Home_game() {
    const [player1, setPlayer1] = useState("");
    const [showModal, setShowModal] = useState(false);
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
          const response = await axiosInstance.post(`http://localhost:8000/game/create_game`, { player1 });
          console.log(response.data);
          navigate(`/games/${response.data.id}`);
        } catch (error) {
          console.error("Error submitting Player:", error);
        }
    };

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (
        <Template>
            <div className="content">
                <Button onClick={handleShow}>Lancer le jeu</Button>
                
                    <Modal show={showModal} onHide={handleClose} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Coucou</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Bienvenue dans le jeu !</p>
                            <Button onClick={() => submitPlayer('1-player')}> 
                                play
                            </Button>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Fermer
                            </Button>
                        </Modal.Footer>
                    </Modal>
                {/* <button onClick={submitPlayer}>Lancer le jeu</button> */}
            </div>
        </Template>
    );
};

export default Home_game;
