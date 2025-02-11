//import { socket }  from "../socket";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import { ToastContainer } from "react-toastify";
import useSocket from '../socket'
import axiosInstance from "../instance/AxiosInstance";

import "./Homechat.css"
import Room from './Room'

export default function HomeChat() {

	const socket = useSocket('chat', 'public');

	const [createName, setCreateRoomName] = useState("");
	const [createpassword, setCreatePassword] = useState("");
	const [createdRoomName, setCreatedRoomName] = useState("");
	const [showCreatePublicRoom, setShowCreatePublicRoom] = useState(false);
	const [isCreateSwitchOn, setIsCreateSwitchOn] = useState(false);
	const [listrooms, setlistrooms] = useState([]);

	const navigate = useNavigate();

	const handleChangeCreateRoom = (e) => setCreateRoomName(e.target.value);
	const handleChangeCreatePassword = (e) => setCreatePassword(e.target.value);

	const handleCreateToggle = () => {
		setIsCreateSwitchOn(!isCreateSwitchOn);
	};

	useEffect(() => {
		if (socket.ready) {
			console.log("bonjour");
			socket.on("create_room", (data) => {
				if (data.status) {
					console.log("Salle créée :", data.room_name);
					setCreatedRoomName(data.room_name);
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
			console.log("bonsoir");
			socket.send({
				type: "create_room",
				room_name: createName,
				password: createpassword,
			});
		}
	};

	const joinRoom = (name, password = null) => {
		if (socket.ready) {
			console.log("hello");
			socket.send({
				type: "join_room",
				room_name: name,
				password: password,
			});
		}
	};

	useEffect(() => {
		const listroom = async () => {
			try {
				const response = await axiosInstance.get('/livechat/listroom/');
				console.log("Données reçues:", response.data);
				setlistrooms(response.data);
			} catch (error) {
				console.error("Erreur lors de la récupération des salles", error);
			}
		};

		listroom();
	}, []);

	const handleRoomClick = (e, room) => {
		e.preventDefault();
		console.log("name:", room.name);

		if (!room.name) {
			alert("Le nom de la salle est introuvable.");
			return;
		}

		if (room.password) {
			const enteredPassword = prompt(`Mot de passe requis pour "${room.name}" :`);
			if (enteredPassword) {
				joinRoom(room.name, enteredPassword);
			} else {
				alert("Mot de passe requis !");
			}
		} else {
			joinRoom(room.name);
		}
	}

	return (
		<>
			<div className="general-chat d-flex justify-content-between">
				<div className="create-public-room">
					{showCreatePublicRoom ? (
						<>
							<div className="form-check form-switch">
								<input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={isCreateSwitchOn} onChange={handleCreateToggle} />
								<label className="form-check-label" htmlFor="flexSwitchCheckDefault">{isCreateSwitchOn ? 'Room is private' : 'Room is not private'}</label>
							</div>

							{!isCreateSwitchOn && (
								<>
									<input type="text" placeholder="Nom de la salle" value={createName} onChange={handleChangeCreateRoom} />
									<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
									<button onClick={createRoom}>New Room</button>
									{socket && createdRoomName && (<Room />)}
								</>
							)}

							{isCreateSwitchOn && (
								<>
									<input type="text" placeholder="Nom de la salle" value={createName} onChange={handleChangeCreateRoom} />
									<input type="password" placeholder="Mdp de la salle" value={createpassword} onChange={handleChangeCreatePassword} />
									<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
									<button onClick={createRoom}>New Room</button>
									{socket && createdRoomName && (<Room />)}
								</>
							)}
						</>
					) : (
						<button onClick={() => setShowCreatePublicRoom(true)}>New Room</button>
					)}

					<h5>Liste des salles</h5>
					<ul>
						{listrooms.map((room, index) => (
							<li key={index}>
								<Link to={`/room/${room.name}`} onClick={(e) => handleRoomClick(e, room)}>
									{room.name} {room.password && "🔒"}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
			<ToastContainer />
		</>
	);
}
