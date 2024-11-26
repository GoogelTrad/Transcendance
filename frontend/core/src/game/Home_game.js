import './Home_game.css'
import '../Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import React, {useEffect, useState} from "react";

function Home_game(){
    
    return (
    <>
        <h1 className='position-absolute title text-center text-white title-overlay w-100'>hi</h1>
        <div className='d-flex flex-column align-items-center justify-content-center h-100'>
            
            <div className='d-flex gap-5'>
                <div className='col d-flex justify-content-center align-items-center '>
                    <Link to="/game"><Button type='submit' className=''>Play</Button></Link>
                </div>
                <div className='col d-flex justify-content-center align-items-center'>
                    <Button type='submit' className=''>Tournement</Button>
                </div>
            </div>
        </div>
    </>
    );
};

export default Home_game;
