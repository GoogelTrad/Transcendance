import React, { useState, useRef } from 'react';
import './ModalInstance.css'

function ModalInstance({ children, isModal, modalRef, name, onLaunchUpdate, onClose }) {
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

    const handleDragEnd = (modalRef) => {
        const modal = modalRef.current;
        modal.dataset.dragging = false;
    };

    const closeModal = () => {
        if (onLaunchUpdate) {
            onLaunchUpdate(name);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <div
            className={`custom-modal ${isModal ? "show" : "hide"}`}
            ref={modalRef}
            style={{ position: "absolute" }}
            onMouseMove={(e) => handleDragMove(e, modalRef)}
            onMouseUp={() => handleDragEnd(modalRef)}
        >
            <div
                className="modal-header"
                onMouseDown={(e) => handleDragStart(e, modalRef)}
                onMouseUp={() => handleDragEnd(modalRef)}
            >
                <button className="close-button" onClick={closeModal}>
                    X
                </button>
                <span>{name}</span>
            </div>
            <div className="content-area">{children}</div>
        </div>
    );
}

export default ModalInstance;
