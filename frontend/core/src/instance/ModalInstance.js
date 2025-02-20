import React, { useEffect, useState, useRef } from 'react';
import './ModalInstance.css'

function ModalInstance(props) {
    const { children, isModal, modalRef, name, onLaunchUpdate, onClose, height, width } = props;
    const rect = modalRef?.current?.getBoundingClientRect();
    // console.log(rect);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const modal = modalRef.current;
        const rect = modal.getBoundingClientRect();
            dragOffsetRef.current = {
                x: rect.left,
                y: rect.top,
            };
        // console.log(rect);
      }, []); 

    const handleDragStart = (e, modalRef) => {
        const modal = modalRef.current;
    
        if (!modal) return;
        if (!modal.style.left || !modal.style.top) {
            // console.log("passe", e);
            const rect = modal.getBoundingClientRect();
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        } else {
            // console.log("passe 2");
            dragOffsetRef.current = {
                x: e.clientX - parseFloat(modal.style.left),
                y: e.clientY - parseFloat(modal.style.top),
            };
        }
    
        modal.dataset.dragging = "true";
        window.addEventListener("mousemove", (event) => handleDragMove(event, modalRef));
        window.addEventListener("mouseup", () => handleDragEnd(modalRef));
    
        e.preventDefault();
    };
    

    const handleDragMove = (e, modalRef) => {
        const modal = modalRef.current;
    
        if (!modal || modal.dataset?.dragging !== "true") return;
    
        const { x, y } = dragOffsetRef.current;
        const newLeft = e.clientX - x;
        const newTop = e.clientY - y;
    
        modal.style.left = `${Math.max(0, newLeft)}px`;
        modal.style.top = `${Math.max(0, newTop)}px`;   
    
        e.preventDefault();
    };
    

    const handleDragEnd = (modalRef) => {
        const modal = modalRef.current;
        if (!modal || modal.dataset?.dragging !== "true") return;
        modal.dataset.dragging = false;
        window.removeEventListener("mousemove", (event) => handleDragMove(event, modalRef));
        window.removeEventListener("mouseup", () => handleDragEnd(modalRef));
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
            style={{
                position: "absolute",
                height: height,
                width: width,  
            }}
            
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
