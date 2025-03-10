import React, { useEffect, useRef, useState } from 'react';
import './ModalInstance.css';
import DragableInstance from './DragableInstance'

function ModalInstance(props) {
    const { children, isModal, modalRef, name, onBringToFront = () => {}, onClose, onLaunchUpdate = () => {}, height, width, zIndex = 1, className } = props;

    const pourcent_height = parseInt(height, 10) / 100;
    const pourcent_widht = parseInt(width, 10) / 100;

    const top = (window.innerHeight - (window.innerHeight * pourcent_height)) / 2;
    const left = (window.innerWidth - (window.innerWidth  * pourcent_widht)) / 2;

    const closeModal = () => {
        if (onLaunchUpdate) onLaunchUpdate();
        if (onClose) onClose();
    };

    return (
        <div
            className={`custom-modal ${isModal ? "show" : "hide"} ${className}`}
            ref={modalRef}
            style={{
                position: "absolute",
                height: height,
                width: width,
                zIndex: zIndex,
                top: top,
                left: left,
            }}
            onMouseDown={onBringToFront}
        >
            <DragableInstance 
                className={"modal-header"}
                modalRef={modalRef}
                onBringToFront={onBringToFront}
            >
                <button className="close-button" onClick={closeModal}>
                    X
                </button>
                <span>{name}</span>
            </DragableInstance>
            <div className="content-area custom">{children}</div>
        </div>
    );
}

export default ModalInstance;