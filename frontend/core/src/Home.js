import React, { useState, useRef } from 'react';
import logo from './assets/user/logo.png';
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import './Home.css';
import Template from './instance/Template';
import ModalInstance from './instance/ModalInstance';

function Home() {
    const [isModalTerminal, setIsModalTerminal] = useState(false);
    const [isModalForms, setIsModalForms] = useState(false);
    const [isModalGame, setIsModalGame] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);
    const modalTerminalRef = useRef(null);
    const modalFormsRef = useRef(null);
    const modalGameRef = useRef(null);

    function isLaunched(launched, searchApp) {
        return launched.includes(searchApp);
    }

    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    const handleModal = ({ setModal, boolean }) => setModal(boolean);

    const launching = ({ newLaunch, setModal }) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        handleModal({ setModal: setModal, boolean: true });
    };

    return (
        <Template>
            <button
                className="icon forms"
                onClick={() => launching({ newLaunch: "forms", setModal: setIsModalForms })}
            >
                Forms
            </button>
            <button
                className="icon term"
                onClick={() => launching({ newLaunch: "terminal", setModal: setIsModalTerminal })}
            >
                Terminal
            </button>
            <button
                className="icon game"
                onClick={() => launching({ newLaunch: "game", setModal: setIsModalGame })}
            >
                Game
            </button>
            <ModalInstance
                isModal={isModalTerminal}
                modalRef={modalTerminalRef}
                name="Terminal"
                onLaunchUpdate={() => removeLaunch("terminal")}
                onClose={() => setIsModalTerminal(false)}
            >
                <TerminalLogin />
            </ModalInstance>

            <ModalInstance
                isModal={isModalForms}
                modalRef={modalFormsRef}
                name="Forms"
                onLaunchUpdate={() => removeLaunch("forms")}
                onClose={() => setIsModalForms(false)} 
            >
                <LoginRegister />
            </ModalInstance>

            <ModalInstance
                isModal={isModalGame}
                modalRef={modalGameRef}
                name="Game"
                onLaunchUpdate={() => removeLaunch("game")}
                onClose={() => setIsModalGame(false)}   
            >
            </ModalInstance>

            <div className="task-bar">
                <img src={logo} alt="logo" className="logo"></img>
                <div className="border-start border-2 border-black border-opacity-25 h-75"></div>
                {isLaunched(isLaunch, "terminal") ? (
                    <button className={`${isModalTerminal ? "button-on" : "button-off"}`}
                        onClick={() => {handleModal({setModal: setIsModalTerminal, boolean: !isModalTerminal,})}}>Terminal</button>
                ) : (null)}
                {isLaunched(isLaunch, "forms") ? (
                    <button className={`${isModalForms ? "button-on" : "button-off"}`}
                        onClick={() => {handleModal({setModal: setIsModalForms, boolean: !isModalForms,})}}>Form</button>
                ) : (null)}
                {isLaunched(isLaunch, "game") ? (
                    <button className={`${isModalGame ? "button-on" : "button-off"}`}
                        onClick={() => {handleModal({setModal: setIsModalGame, boolean: !isModalGame,})}}>Game</button>
                ) : (null)}
            </div>
        </Template>
    );
}

export default Home;
