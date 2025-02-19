import React, { useRef, useState } from 'react';
import logo from '../assets/user/logo.png';
import './Template.css';
import { isDataWithResponseInit } from '@remix-run/router';
import ModalInstance from './ModalInstance';
import { useAuth } from '../users/AuthContext';
import LiveDateTime from './DateInstance';
import social from '../assets/user/friends.svg'; 
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

    const toggleSocial = () => {
        console.log('prout')
        setIsSocial(((prev) => !prev));
        handleClick('social')
    }

    const handleClickOutside = (e) => {
        if (desktopRef.current && !desktopRef.current.contains(e.target) && 
            e.target.className !== 'logo') {
            setIsDesktop(false);
        }
    };

    const handleClick= (modalName) =>
    {
        console.log('coucou')
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
                <div className='left-task'>
                    <img
                        src={logo}
                        alt="logo"
                        className="logo"
                        onClick={toggleDesktop}
                    />
                </div>
                <div className="border-start border-2 border-black border-opacity-25 h-75"></div>          

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
                <div className='right-task'>
                    {<img
                        src={social}
                        alt="social"
                        className="social-icon"
                        onClick={toggleSocial}
                    />}
                    <div className='date-task'>
                        <LiveDateTime />
                    </div>
                </div>  
            </div>
        </div>
    );
}

export default Template;

