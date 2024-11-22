import './game.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import React, {useEffect, useState} from "react";
import { getCookies } from './../App.js';
import { jwtDecode } from "jwt-decode";



function Game() {

    const handleSubmit = async (e) =>
    {
       
        try{
            const cookie = getCookies('token');
            if (cookie)
            {
                const decodeCookie = jwtDecode(cookie);
                console.log(decodeCookie.name);
                const reponse = await axios.post(`http://localhost:8000/game`,{
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${cookie}`,
                    },
                    withCredentials: true,
                });

            }
        }
        catch (error)
        {
            console.error('Erreur lors de la récupération des données utilisateur', error);
        }

    };

    return (
        <Button type='submit' className='' onClick={handleSubmit} >Test </Button>

    )
};

export default Game;