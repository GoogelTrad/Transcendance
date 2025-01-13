

function ModalInstance({children, modalRef, setIsModal, isModal, appName}) 
{
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
		<div className={`${cssModal} ${isModal ? "show" : "hide"}`} ref={modalRef}
			style={{ position: "absolute" }} onMouseMove={(e) => handleDragMove(e, modalRef)} 
			onMouseUp={() => handleDragEnd(modalRef)}>

			<div className="modal-header-forms" onMouseDown={(e) => handleDragStart(e, modalRef)}
				onMouseUp={() => handleDragEnd(modalRef)}>
				<button className="close-button" onClick={() => closeModal({ setIsModal: setIsModal, appName: appName })}>X</button>
				<span>Forms</span>
			</div>
			{children}
		</div>
	)
}