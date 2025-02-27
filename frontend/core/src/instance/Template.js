import React, { useRef, useState } from 'react';
import logo from '../assets/user/logo.png';
import './Template.css';
import { isDataWithResponseInit } from '@remix-run/router';
import ModalInstance from './ModalInstance';
import { useAuth } from '../users/AuthContext';
import LiveDateTime from './DateInstance';
import social from '../assets/user/friends.svg'; 
import { useLocation, useNavigate, Link } from 'react-router-dom';
import home from '../assets/home.svg'
import info from '../assets/info.svg'
import profile from '../assets/profile.svg'
import power from '../assets/power.svg'

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
                                    onClick={() => navigate("/Home", {state: { modalName: "terminal"}})} 
                                >
                                    Terminal
                                </div>}
                                {isAuthenticated && <div
                                    className="p-2 bd-highlight flex-item"
                                    onClick={() => navigate("/Home", {state: { modalName: "game"}})}
                                >
                                    Game
                                </div>}
                                {isAuthenticated && <div
                                        className="p-2 bd-highlight flex-item"
                                        onClick={() => navigate("/Chat")}
                                    >
                                    Chat
                                </div>}
                                {isAuthenticated && <div
                                    className="p-2 bd-highlight flex-item"
                                    onClick={() => navigate("/Home", {state: { modalName: "stats"}})}
                                >
                                    Stats
                                </div>}
                                {isAuthenticated && 
                                    <>
                                    <div className="w-100" style={{ position: 'absolute', left:'0%', height:'10%', bottom:'10%'}}>
                                        <img src={profile} alt="Profile" title="Profile" style={{ width: '24px', height: '24px', cursor: 'pointer', margin:'2%' }} onClick={() => navigate("/Home", { state: { modalName: "profile" } })} />
                                        <img src={home} alt="Home" title="Home" style={{ width: '24px', height: '24px', cursor: 'pointer', margin:'2%' }} onClick={() => navigate("/Home")} />
                                        <img src={info} alt="Info" title="Infos" style={{ width: '24px', height: '24px', cursor: 'pointer', margin:'2%' }} onClick={() => console.log("Info clicked")} />
                                    </div>
                                    <div className="w-100" style={{ position: 'absolute', borderTop:'2px solid #989a9c', left:'0%', height:'10%', bottom:'0%'}}>
                                        <div className='h-100' style={{position: 'absolute', left:'86%', borderLeft:'2px solid #989a9c' }}></div>
                                        <img src={power} alt="Power" style={{ position: 'absolute', bottom: '0%', width: '24px', height: '24px', cursor: 'pointer', margin:'2%', right: '0%' }} onClick={() => navigate("/logout")} />
                                    </div>
                                    </>
                                }
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

