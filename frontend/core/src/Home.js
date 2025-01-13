import React, { useState, useRef } from 'react';
import logo from './assets/user/logo.png';
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import './Home.css';

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

    const launching = ({newLaunch, setModal}) => {
        setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
        handleModal({setModal: setModal, boolean: true});
    };

    const removeLaunch = (appName) => {
        setIsLaunch((prevLaunch) => prevLaunch.filter((app) => app !== appName));
    };

    const handleModal = ({ setModal, boolean }) => setModal(boolean);

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

    const closeModal = ({ setIsModal, appName }) => {
        setIsModal(false);
        removeLaunch(appName);
    };

    return (
        <div className="general">
            <button className="icon-forms" onClick={() => launching({newLaunch: "forms", setModal: setIsModalForms})}>forms</button>
            <button className="icon-terminal" onClick={() => launching({newLaunch: "terminal", setModal: setIsModalTerminal})}>terminal</button>

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
            </div>
        </div>
    );
}

export default Home;
