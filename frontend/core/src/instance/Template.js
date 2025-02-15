import React, { useRef, useState } from 'react';
import logo from '../assets/user/logo.png';
import './Template.css';
import { isDataWithResponseInit } from '@remix-run/router';
import ModalInstance from './ModalInstance';
import { useAuth } from '../users/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';

function Template({ children, taskBarContent, launching, appArray }) {
    const navigate = useNavigate();
    const [isDesktop, setIsDesktop] = useState(false);
    const [isSocial, setIsSocial] = useState(false);
    const { isAuthenticated } = useAuth();
    const desktopRef = useRef(null);

    const toggleDesktop = () => {
        setIsDesktop((prev) => !prev);
    };

    const handleClickOutside = (e) => {
        if (desktopRef.current && !desktopRef.current.contains(e.target) && 
            e.target.className !== 'logo') {
            setIsDesktop(false);
        }
    };

    const handleClick= (modalName) =>
    {
        const app = appArray.find((item) => item.name === modalName);

        if (!app) return;
        app.setter(prev => !prev);

        launching({newLaunch: modalName, setModal: app.setter});
        setIsDesktop(false);
    }

    

    return (
        <div className="general container-fluid">
            <div className="content-area" onClick={handleClickOutside}>{children}</div>
            <div className="task-bar">
                <img
                    src={logo}
                    alt="logo"
                    className="logo"
                    onClick={toggleDesktop}
                />
                <div className="border-start border-2 border-black border-opacity-25 h-75"></div>
            </div>

            {isDesktop && (
                <div className="desktop-overlay" ref={desktopRef}>
                    <div className="desktop-content">
                        <div className="application-desktop d-flex flex-column bd-highlight mb-3">
                            {!isAuthenticated && <div
                                className="p-2 bd-highlight flex-item"
                                onClick={() => handleClick('terminal')} 
                            >
                                Terminal
                            </div>}
                            {isAuthenticated && <div
                                className="p-2 bd-highlight flex-item"
                                onClick={() => handleClick('game')}
                            >
                                Game
                            </div>}
                            {isAuthenticated && <div
                                className="p-2 bd-highlight flex-item"
                                onClick={() =>  navigate("/Home") }
                            >
                                Home
                            </div>}
                        </div>
                    </div>
                </div>
            )}

            {taskBarContent}
        </div>
    );
}

export default Template;

