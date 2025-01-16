import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/user/logo.png';
import './Template.css';

function Template({ children, taskBarContent, onFlexItemClick }) {
    const [isDesktop, setIsDesktop] = useState(false);
    const navigate = useNavigate(); 

    const toggleDesktop = () => {
        setIsDesktop((prev) => !prev);
    };

    const handleClick = (modalName) => {
        navigate(`/home?modal=${modalName}`); 
    };

    return (
        <div className="general container-fluid">
            <div className="content-area">{children}</div>
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
                <div className="desktop-overlay">
                    <div className="desktop-content">
                        <div className="application-desktop d-flex flex-column bd-highlight mb-3">
                            <div
                                className="p-2 bd-highlight flex-item"
                                onClick={() => handleClick('terminal')} 
                            >
                                Terminal
                            </div>
                            <div
                                className="p-2 bd-highlight flex-item"
                                onClick={() => handleClick('forms')}
                            >
                                Forms
                            </div>
                            <div
                                className="p-2 bd-highlight flex-item"
                                onClick={() => handleClick('game')}
                            >
                                Game
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {taskBarContent}
        </div>
    );
}

export default Template;

