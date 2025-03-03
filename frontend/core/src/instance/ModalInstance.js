import React, { useEffect, useRef } from 'react';
import './ModalInstance.css';

function ModalInstance(props) {
    const { children, isModal, modalRef, name, onBringToFront, onClose, onLaunchUpdate, onUpdatePosition, height, width, zIndex, position } = props;
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const modal = modalRef.current;
        if (modal && isModal) {
            if (position) {
                modal.style.left = `${position.left}px`;
                modal.style.top = `${position.top}px`;
            } else {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const modalWidth = modal.offsetWidth;
                const modalHeight = modal.offsetHeight;

                const initialLeft = Math.max(0, (windowWidth - modalWidth) / 2);
                const initialTop = Math.max(0, (windowHeight - modalHeight) / 2);

                modal.style.left = `${initialLeft}px`;
                modal.style.top = `${initialTop}px`;
                onUpdatePosition({ left: initialLeft, top: initialTop });
            }
            modal.style.zIndex = zIndex;
        }
    }, [isModal, modalRef, zIndex, position]);

    const handleDragStart = (e, modalRef) => {
        onBringToFront();
        const modal = modalRef.current;
        if (!modal) return;

        const rect = modal.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        modal.dataset.dragging = "true";
        window.addEventListener("mousemove", (event) => handleDragMove(event, modalRef));
        window.addEventListener("mouseup", () => handleDragEnd(modalRef));
        e.preventDefault();
    };

    const handleDragMove = (e, modalRef) => {
        const modal = modalRef.current;
        if (!modal || modal.dataset?.dragging !== "true") return;

        const { x, y } = dragOffsetRef.current;
        const newLeft = Math.max(0, e.clientX - x);
        const newTop = Math.max(0, e.clientY - y);

        modal.style.left = `${newLeft}px`;
        modal.style.top = `${newTop}px`;
        e.preventDefault();
    };

    const handleDragEnd = (modalRef) => {
        const modal = modalRef.current;
        if (!modal || modal.dataset?.dragging !== "true") return;

        modal.dataset.dragging = "false";
        window.removeEventListener("mousemove", (event) => handleDragMove(event, modalRef));
        window.removeEventListener("mouseup", () => handleDragEnd(modalRef));

        const newPosition = {
            left: parseFloat(modal.style.left),
            top: parseFloat(modal.style.top),
        };
        onUpdatePosition(newPosition);
    };

    const closeModal = () => {
        if (onLaunchUpdate) onLaunchUpdate();
        if (onClose) onClose();
    };

    return (
        <div
            className={`custom-modal ${isModal ? "show" : "hide"}`}
            ref={modalRef}
            style={{
                position: "absolute",
                height: height,
                width: width,
                zIndex: zIndex,
            }}
            onMouseDown={onBringToFront}
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
            <div className="content-area custom">{children}</div>
        </div>
    );
}

export default ModalInstance;