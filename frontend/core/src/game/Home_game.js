import './Home_game.css'
import '../Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import React, {useEffect, useState} from "react";

function Home_game(){
    
    return (
        <div className='h-100'>
            <h1 className='title'>PONG</h1>
            <div className='row h-100 g-0'>
                <div className='col d-flex justify-content-center align-items-center'>
                    <Button type='submit' className=''>Play</Button>
                </div>
                <div className='col d-flex justify-content-center align-items-center'>
                    <Button type='submit' className=''>Tournement</Button>
                </div>
            </div>
        </div>
    );
};

export default Home_game;
