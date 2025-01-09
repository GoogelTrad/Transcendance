import React, { useState, useRef } from 'react';
import logo from './assets/user/logo.png'
import TerminalLogin from './users/TerminalLogin';
import LoginRegister from './users/LoginForm';
import './Home.css';

function Home()
{
	const [isModalTerminal, setIsModalTerminal] = useState(false);
	const [isModalForms, setIsModelForms] = useState(false);
	const [isLaunch, setIsLaunch] = useState([]);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef(null);
	const buttonRef = useRef(null);
	
	function isLaunched(launched, searchApp) {
		return launched.includes(searchApp);
	}

	const launching = (newLaunch) => {
		setIsLaunch((prevLaunch) => [...prevLaunch, newLaunch]);
	};

	const removeLaunch = (indexToRemove) => {
		setIsLaunch((prevLaunch) =>
			prevLaunch.filter((_, index) => index !== indexToRemove)
		);
	  };

	const handleModal = ({setModal, boolean}) => setModal(boolean);

    const handleAutoClick = () => {
        if (buttonRef.current) {
            buttonRef.current.click();
        }
    };

    const handleDragStart = (e) => {
        const modal = modalRef.current;
        const rect = modal.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        modal.dataset.dragging = true;
    };

    const handleDragMove = (e) => {
        const modal = modalRef.current;
        if (modal.dataset.dragging === "true") {
            const newLeft = e.clientX - dragOffset.x;
            const newTop = e.clientY - dragOffset.y;

            modal.style.left = `${newLeft}px`;
            modal.style.top = `${newTop}px`;
        }
    };

    const handleDragEnd = () => {
        const modal = modalRef.current;
        modal.dataset.dragging = false;
    };

	const closeModal = ({setIsModal}) => {
        setIsModal(false);
    };

	return (
        <div className='general' onMouseMove={handleDragMove} onMouseUp={handleDragEnd}>

			<button ref={buttonRef} className='icon-forms' onClick={() => launching('forms')}>forms</button>
			<button ref={buttonRef} className='icon-terminal' onClick={() => launching('terminal')}>terminal</button>

            <div className={`custom-modal ${isModalTerminal ? 'show' : 'hide'}`} ref={modalRef}
                style={{ position: 'absolute'}}>
                <div className="modal-header" onMouseDown={handleDragStart} onMouseUp={handleDragEnd}>
					<button className="close-button" onClick={() => closeModal({setIsModal : setIsModalTerminal})}>X</button>
					<span>Terminal</span>
				</div>
                <TerminalLogin />
            </div>
			<div className={`custom-modal-forms ${isModalForms ? 'show' : 'hide'}`} ref={modalRef}
                style={{ position: 'absolute'}}>
                <div className="modal-header-forms" onMouseDown={handleDragStart} onMouseUp={handleDragEnd}>
					<button className="close-button" onClick={() => closeModal({setIsModal : setIsModelForms})}>X</button>
					<span>Forms</span>
				</div>
                <LoginRegister />
            </div>
			<div className='task-bar'>
                <img src={logo} alt='logo' className='logo'></img>
                <div className='border-start border-2 border-black border-opacity-25 h-75'></div>
				{isLaunched(isLaunch, 'terminal') ? (
					<button className={`${isModalTerminal ? 'button-on' : 'button-off'}`} 
					onClick={() => {
						handleModal({setModal: setIsModalTerminal, boolean: !isModalTerminal});
						{ isModalForms ? (closeModal({setIsModal : setIsModelForms})) : (<></>)};
						}}>Terminal
					</button>
				) : (
					<></>
				)}
				{isLaunched(isLaunch, 'forms') ? (
					<button className={`${isModalForms ? 'button-on' : 'button-off'}`} 
					onClick={() => {
						handleModal({setModal: setIsModelForms, boolean: !isModalForms});
						{ isModalTerminal ? (closeModal({setIsModal : setIsModalTerminal})) : (<></>)};
						}}>Forms
					</button>
				) : (
					<></>
				)}
            </div>
		</div>
	);
}

export default Home