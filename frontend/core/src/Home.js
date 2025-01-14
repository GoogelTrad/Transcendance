import React, { useState, useRef } from 'react';
import logo from './assets/user/logo.png';
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import './Home.css';
import Template from './instance/Template';

function Home() {
    const [isModalTerminal, setIsModalTerminal] = useState(false);
    const [isModalForms, setIsModalForms] = useState(false);
    const [isLaunch, setIsLaunch] = useState([]);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const modalTerminalRef = useRef(null);
    const modalFormsRef = useRef(null);

    function isLaunched(launched, searchApp) {
        return launched.includes(searchApp);
    }

    // Lancer une nouvelle application
    const launching = ({ newLaunch, setModal }) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        handleModal({ setModal: setModal, boolean: true });
    };

    // Supprimer une application
    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    // Afficher ou cacher les modaux
    const handleModal = ({ setModal, boolean }) => setModal(boolean);

    // Fonction pour gérer le déplacement du modal
    const handleDragStart = (e, modalRef) => {
        const modal = modalRef.current;
        const rect = modal.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        modal.dataset.dragging = true;
    };

    const handleDragMove = (e, modalRef) => {
        const modal = modalRef.current;
        if (modal.dataset.dragging === "true") {
            const newLeft = Math.max(e.clientX - dragOffset.x, 0);
            const newTop = Math.max(e.clientY - dragOffset.y, 0);
            modal.style.left = `${newLeft}px`;
            modal.style.top = `${newTop}px`;
        }
    };

    const handleAutoClick = (buttonRef) => {
        if (buttonRef.current) {
            buttonRef.current.click();
        }
    };

    const handleDragEnd = (modalRef) => {
        const modal = modalRef.current;
        modal.dataset.dragging = false;
    };

    // Fermer le modal
    const closeModal = ({ setIsModal, appName }) => {
        setIsModal(false);
        removeLaunch(appName);
    };

    return (
        <Template>
            {/* Boutons centraux pour Forms et Terminal */}
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


            {isLaunched(isLaunch, "terminal") && (
                <div className={`custom-modal ${isModalTerminal ? "show" : "hide"}`} ref={modalTerminalRef}
                    style={{ position: "absolute" }} onMouseMove={(e) => handleDragMove(e, modalTerminalRef)}
                    onMouseUp={() => handleDragEnd(modalTerminalRef)}>

                    <div className="modal-header" onMouseDown={(e) => handleDragStart(e, modalTerminalRef)}
                        onMouseUp={() => handleDragEnd(modalTerminalRef)}>
                        <button className="close-button" onClick={() => closeModal({ setIsModal: setIsModalTerminal, appName: "terminal" })}>X</button>
                        <span>Terminal</span>
                    </div>
                    <TerminalLogin />
                </div>
            )}

            {isLaunched(isLaunch, "forms") && (
                <div className={`custom-modal-forms ${isModalForms ? "show" : "hide"}`} ref={modalFormsRef}
                    style={{ position: "absolute" }} onMouseMove={(e) => handleDragMove(e, modalFormsRef)} 
                    onMouseUp={() => handleDragEnd(modalFormsRef)}>

                    <div className="modal-header-forms" onMouseDown={(e) => handleDragStart(e, modalFormsRef)}
                        onMouseUp={() => handleDragEnd(modalFormsRef)}>
                        <button className="close-button" onClick={() => closeModal({ setIsModal: setIsModalForms, appName: "forms" })}>X</button>
                        <span>Forms</span>
                    </div>
                    <LoginRegister />
                </div>
            )}

            <div className="task-bar">
                <img src={logo} alt="logo" className="logo" />
                <div className="border-start border-2 border-black border-opacity-25 h-75"></div>
                {isLaunched(isLaunch, "terminal") && (
                    <button className={`${isModalTerminal ? "button-on" : "button-off"}`}
                        onClick={() => handleModal({ setModal: setIsModalTerminal, boolean: !isModalTerminal })}>
                        Terminal
                    </button>
                )}

                {isLaunched(isLaunch, "forms") && (
                    <button className={`${isModalForms ? "button-on" : "button-off"}`}
                        onClick={() => handleModal({ setModal: setIsModalForms, boolean: !isModalForms })}>
                        Forms
                    </button>
                )}
            </div>
        </Template>
    );
}

export default Home;
