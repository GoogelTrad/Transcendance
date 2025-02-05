import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from './assets/user/logo.png';  
import social from './assets/user/friends.svg'; 
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import HomeGame from './game/Home_game'
import './Home.css';
import Template from './instance/Template';  
import ModalInstance from './instance/ModalInstance';
import FriendRequests from './friends/Friends';
import Profile from './users/Profile';
import { useAuth } from './users/AuthContext';
import { jwtDecode } from "jwt-decode";
import { getCookies } from "./App";

function Home() {
    const [isModalTerminal, setIsModalTerminal] = useState(false);
    const [isModalSocial, setIsModalSocial] = useState(false);
    const [isModalForms, setIsModalForms] = useState(false);
    const [isModalGame, setIsModalGame] = useState(false);
    const [isModalProfile, setIsModalProfile] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);
    const { isAuthenticated } = useAuth();
    const setters = [
        {name: 'terminal', setter: setIsModalTerminal},
        {name: 'game', setter: setIsModalGame},
        {name: 'social', setter:setIsModalSocial},
        {name: 'profile', setter:setIsModalProfile},
    ]
    const modalTerminalRef = useRef(null);
    const modalFormsRef = useRef(null);
    const modalGameRef = useRef(null);
    const modalSocial = useRef(null);
    const modalProfile = useRef(null);

    const token = getCookies('token');
    let decodeToken = null;
    if (token)
      decodeToken = jwtDecode(token);

    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    const handleModal = ({ setModal, boolean }) => setModal(boolean);

    const launching = ({ newLaunch, setModal }) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        handleModal({ setModal: setModal, boolean: true });
    };

    function isLaunched(launched, searchApp) {
        return launched.includes(searchApp);
    }

    const toggleSocial = () => {
        setIsModalSocial(((prev) => !prev));
        launching({ newLaunch: "social", setModal: setIsModalSocial })
    }

    return (
        <Template
            appArray={setters}
            launching={launching}
            taskBarContent={
                <div className="task-bar-content">
                    {isAuthenticated && <img
                        src={social}
                        alt="social"
                        className="social-icon"
                        onClick={toggleSocial}
                    />}
                    {isLaunched(isLaunch, "terminal") && (
                        <button
                            className={`${isModalTerminal ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalTerminal, boolean: !isModalTerminal });
                            }}
                        >
                            Terminal
                        </button>
                    )}
                    {isLaunched(isLaunch, "forms") && (
                        <button
                            className={`${isModalForms ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalForms, boolean: !isModalForms });
                            }}
                        >
                            Form
                        </button>
                    )}
                    {isLaunched(isLaunch, "game") && (
                        <button
                            className={`${isModalGame ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalGame, boolean: !isModalGame });
                            }}
                        >
                            Game
                        </button>
                    )}
                    {isLaunched(isLaunch, "profile") && (
                        <button
                            className={`${isModalProfile ? "button-on" : "button-off"}`}
                            onClick={() => {
                                handleModal({ setModal: setIsModalProfile, boolean: !isModalProfile });
                            }}
                        >
                            Profile
                        </button>
                    )}
                </div>
            }
        >
            <button
                className="icon term"
                onClick={() => launching({ newLaunch: "terminal", setModal: setIsModalTerminal })}
            >
                Terminal
            </button>
            {isAuthenticated && <button
                className="icon game"
                onClick={() => launching({ newLaunch: "game", setModal: setIsModalGame })}
            >
                Game
            </button>}
            {isAuthenticated && <button
                className="icon profileModal"
                onClick={() => {launching({ newLaunch: "profile", setModal: setIsModalProfile });}}
            >
                Profile
            </button>}

            {isLaunched(isLaunch, "terminal") && <ModalInstance
                isModal={isModalTerminal}
                modalRef={modalTerminalRef}
                name="Terminal"
                onLaunchUpdate={() => removeLaunch("terminal")}
                onClose={() => setIsModalTerminal(false)}
            >
                <TerminalLogin setModal={setIsModalForms} launching={launching} setTerminal={setIsModalTerminal}/>
            </ModalInstance>}

            {isAuthenticated && isLaunched(isLaunch, "game") && <ModalInstance
                isModal={isModalGame}
                modalRef={modalGameRef}
                name="Game"
                onLaunchUpdate={() => removeLaunch("game")}
                onClose={() => setIsModalGame(false)}
            >
                <HomeGame/>
            </ModalInstance>}

            <ModalInstance
                isModal={isModalForms}
                modalRef={modalFormsRef}
                name="Forms"
                onLaunchUpdate={() => removeLaunch("forms")}
                onClose={() => setIsModalForms(false)}
            >
                <LoginRegister setModal={setIsModalForms} setTerminal={setIsModalTerminal} removeLaunch={removeLaunch}/>
            </ModalInstance>

            {isAuthenticated && isLaunched(isLaunch, "social") && <ModalInstance
                isModal={isModalSocial}
                modalRef={modalSocial}
                name="Social"
                onLaunchUpdate={() => removeLaunch("social")}
                onClose={() => setIsModalSocial(false)}
            >
                <FriendRequests/>
            </ModalInstance>}
            {isAuthenticated && isLaunched(isLaunch, "profile") && <ModalInstance
                isModal={isModalProfile}
                modalRef={modalProfile}
                name="Profile"
                onLaunchUpdate={() => removeLaunch("profile")}
                onClose={() => setIsModalProfile(false)}
            >
                <Profile id={decodeToken.id}/>
            </ModalInstance>}
        </Template>
    );
}

export default Home;
