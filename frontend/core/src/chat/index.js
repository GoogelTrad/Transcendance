//import { socket }  from "../socket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import { ToastContainer } from "react-toastify";
import useSocket from '../socket'

import "./index.css"
import Room from './Room'

export default function HomeChat() {
	const socket = useSocket('chat', 'public');
	const [createName, setCreateRoomName] = useState("");
	const [createpassword, setCreatePassword] = useState("");
	const [joinpassword, setJoinPassword] = useState("");
	const [joinName, setJoinRoomName] = useState("");
	const [createdRoomName, setCreatedRoomName] = useState("");
	const navigate = useNavigate();

	const [showCreatePrivateRoom, setShowCreatePrivateRoom] = useState(false);
	const [showCreatePublicRoom, setShowCreatePublicRoom] = useState(false);
	const [showJoinPrivateRoom, setShowJoinPrivateRoom] = useState(false);
	const [showJoinPublicRoom, setShowJoinPublicRoom] = useState(false);

	const handleChangeCreateRoom = (e) => setCreateRoomName(e.target.value);
	const handleChangeJoinRoom = (e) => setJoinRoomName(e.target.value);
	const handleChangeCreatePassword = (e) => setCreatePassword(e.target.value);
	const handleChangeJoinPassword = (e) => setJoinPassword(e.target.value);

	const [isSwitchOn, setIsSwitchOn] = useState(false); // État initial : false

	// Fonction pour gérer le changement d'état
	const handleToggle = () => {
		setIsSwitchOn(!isSwitchOn); // Inverse l'état actuel
	};

	useEffect(() => {
		if (socket.ready) {
			socket.on("create_room", (data) => {
				if (data.status) {
					console.log("Salle créée :", data.room_name);
					navigate(`/room/${data.room_name}`);
				}
				else {
					showToast("error", data.error);
				}
			});
			socket.on("join_room", (data) => {
				if (data.status) {
					console.log("Salle rejoint :", data.room_name);
					navigate(`/room/${data.room_name}`);
				} else {
					showToast("error", data.error);
				}
			});
		}
	}, [socket, navigate]);
	
	
	const createRoom = () => {
		if (createName.trim() === "") {
			showToast("error", "Le nom de la salle ne peut pas être vide.");
			return;
		}
		if (socket.ready) {
			socket.send({
				type: "create_room",
				room_name: createName,
				password: createpassword,
			});
		}
	};

	const joinRoom = () => {
		if (joinName.trim() === "") {
			showToast("error", "Le nom de la salle ne peut pas être vide.");
			return;
		}
		if (socket.ready) {
			socket.send({
				type: "join_room",
				room_name: joinName,
				password: joinpassword,
			});
		}
	};

	return (
		<>
		<div className="general">

				{showCreatePublicRoom ? (
					<>
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={isSwitchOn} onChange={handleToggle}/>
							<label class="form-check-label" for="flexSwitchCheckDefault">{isSwitchOn ? 'Room is private' : 'Room is not private'}</label>
						</div>

						{!isSwitchOn && (
							<>
								<input type="text" placeholder="Nom de la salle" value={createName} onChange={handleChangeCreateRoom}/>
								<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
								<button onClick={createRoom}>New Room</button>
								{socket && createdRoomName && (
									<Room />
								)}
							</>
						)}

						{isSwitchOn && (
							<>
								<input type="text" placeholder="Nom de la salle" value={createName} onChange={handleChangeCreateRoom}/>
								<input type="password" placeholder="Mdp de la salle" value={createpassword} onChange={handleChangeCreatePassword}/>
								<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
								<button onClick={createRoom}>New Room</button>
								{socket && createdRoomName && (
									<Room />
								)}
							</>
						)}
					</>
				) : (
					<div className="create-public-room">
						<button onClick={() => setShowCreatePublicRoom(true)}>New Room</button>
					</div>
				)}

				{showJoinPublicRoom ? (
					<>
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={isSwitchOn} onChange={handleToggle}/>
							<label class="form-check-label" for="flexSwitchCheckDefault">{isSwitchOn ? 'Room is private' : 'Room is not private'}</label>
						</div>

						{!isSwitchOn && (
							<>
								<input type="text" placeholder="Nom de la salle" value={joinName} onChange={handleChangeJoinRoom}/>
								<button onClick={() => setShowJoinPublicRoom(false)}>Cancel</button>
								<button onClick={joinRoom}>Join Room</button>
								{socket && createdRoomName && (
									<Room />
								)}
							</>
						)}

						{isSwitchOn && (
							<>
								<input type="text" placeholder="Nom de la salle" value={joinName} onChange={handleChangeJoinRoom}/>
								<input type="password" placeholder="Mdp de la salle" value={joinpassword} onChange={handleChangeJoinPassword}/>
								<button onClick={() => setShowJoinPrivateRoom(false)}>Cancel</button>
								<button onClick={joinRoom}>Join Room</button>
								{socket && createdRoomName && (
									<Room />
								)}
							</>
						)}
					</>
				) : (
						<div className="join-public-room">
							<button onClick={() => setShowJoinPublicRoom(true)}>Join Room</button>
						</div>
				)}
		</div>
		<ToastContainer />
		</>
	);
}