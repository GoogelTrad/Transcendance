import { useRef } from 'react';

export default function DragableInstance(props) {
    const { 
        className, 
        children,
        modalRef = null,
        onBringToFront = () => {}
    } = props

    const self = useRef(null);

    let left = 0, top = 0;
    
    const handleDragStart = (e) => {
        e.preventDefault();
        onBringToFront();
        const modal = modalRef ? modalRef.current : null;
        if (!modal) return;

        left = e.clientX
        top = e.clientY

        window.addEventListener("mousemove", handleDragMove);
        window.addEventListener("mouseup", handleDragEnd);
    };

    const handleDragMove = (e) => {
        e.preventDefault();
        const modal =  modalRef ? modalRef.current : null;
        if (!modal) return;
        if (modal) {
            modal.style.left = `${modal.offsetLeft - (left - e.clientX)}px`;
            modal.style.top = `${modal.offsetTop - (top - e.clientY)}px`;
        }
        left = e.clientX
        top = e.clientY
    };

    const handleDragEnd = () => {
        const modal = modalRef ? modalRef.current : null;
        if (!modal) return;

        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
    };

    return (
        <div
            ref={self}
            className={className}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
        >
            {children}
        </div>
    )
}