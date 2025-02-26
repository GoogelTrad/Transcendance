import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import { ToastContainer } from "react-toastify";
import useSocket from '../socket'
import axiosInstance from "../instance/AxiosInstance";
import ModalInstance from "../instance/ModalInstance";
import Profile from "../users/Profile";

import "./Homechat.css"
import Room from './Room'

import useJwt from '../instance/JwtInstance';
import { getCookies } from '../App';

import useNotifications from "../SocketNotif"

export default function HomeChat() {

	const socket = useSocket('chat', 'public');
	console.log("🛠️ Hook useSocket appelé !");

	const [createName, setCreateRoomName] = useState("");
	const [createpassword, setCreatePassword] = useState("");
	const [createdRoomName, setCreatedRoomName] = useState("");
	const [showCreatePublicRoom, setShowCreatePublicRoom] = useState(false);
	const [isCreateSwitchOn, setIsCreateSwitchOn] = useState(false);
	const [listrooms, setlistrooms] = useState([]);
	const [dmrooms, setdmrooms] = useState([]);
	const [usersconnected, setusersconnected] = useState([]);
	const [isModalProfile, setIsModalProfile] = useState(false);
	const [profileId, setProfileId] = useState(1);
	const modalProfile = useRef(null);
	const [clickedNotifications, setClickedNotifications] = useState({});

	const navigate = useNavigate();

	const handleChangeCreateRoom = (e) => {
		setCreateRoomName(e.target.value);
		console.log("Valeur entrée :", e.target.value);
	};	
	const handleChangeCreatePassword = (e) => setCreatePassword(e.target.value);

	const handleCreateToggle = () => { setIsCreateSwitchOn(!isCreateSwitchOn) };

	const getJwt = useJwt();

	const token = getCookies('token');
	const decodedToken = getJwt(token);
	const userId = decodedToken.id;
	
	const { notifications, sendNotification, respondNotification } = useNotifications();

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
	}, [socket]);

	const createRoom = (roomName, invited_user_id = undefined) => {
		console.log("HYYYYYY");
		if (roomName === "") {
			showToast("error", "Le nom de la salle ne peut pas être vide.");
			return;
		}
		console.log("invited_user_id:", invited_user_id);
		if (socket.ready) {
			console.log("bonsoir");
			socket.send({
				type: "create_room",
				room_name: roomName,
				password: createpassword,
				invited_user_id,
				invitation_required: true
			});
		}
	};

	const joinRoom = (name, password = null) => {
		console.log("joinRoom name:", name);
		if (socket.ready) {
			console.log("hello");
			socket.send({
				type: "join_room",
				room_name: name,
				password: password,
			});
		}
	};

	const listroom = async () => {
		try {
			const response = await axiosInstance.get('/api/livechat/listroom/');
			console.log("Données reçues:", response.data);

			const dmRooms = response.data.dmRooms.map((value) => {
				value.dmname = value.users.filter((v) => {
					if (v.id !== userId) return true;
					return false;
				})[0]?.name + ' dm' ?? value.name;
				return value;
			});

			setlistrooms(response.data.publicRooms);
			setdmrooms(dmRooms);
		} catch (error) {
			console.error("Erreur lors de la récupération des salles", error);
		}
	};

	const users_connected = async () => {
		try {
			const response = await axiosInstance.get('/api/livechat/users_connected/');
			console.log("Données Users:", response.data);
			setusersconnected(response.data.filter((v) => v.id !== userId));
		} catch (error) {
			console.error("Erreur lors de la récupération des utilisateurs", error);
		}
	};

	useEffect(() => {
		listroom();
		users_connected();

		const interval = setInterval(() => {
			users_connected();
			listroom();
		}, 10000);

		return () => clearInterval(interval);
	}, []);

	const handleRoomClick = async (e, room) => {
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

	const handleProfile = (user_id) => {
		setIsModalProfile(!isModalProfile);
		setProfileId(user_id);
	}

	const handleResponse = (notifId, response, senderId, createName) => {
		if (!clickedNotifications[notifId]) {
			respondNotification(userId, response, senderId);
			setClickedNotifications((prev) => ({ ...prev, [notifId]: true }));
			if (response == "accepté") {
				console.log("createName dans handleResponse:", createName);
				joinRoom(createName);
			}
		}
	};

	function makeName(length) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
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
									<button onClick={() => createRoom(createName)}>New Room</button>
									{socket && createdRoomName && <Room/>}
								</>
							)}

							{isCreateSwitchOn && (
								<>
									<input type="text" placeholder="Nom de la salle" value={createName} onChange={handleChangeCreateRoom} />
									<input type="password" placeholder="Mdp de la salle" value={createpassword} onChange={handleChangeCreatePassword} />
									<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
									<button onClick={() => createRoom(createName)}>New Room</button>
									{socket && createdRoomName && <Room/>}
								</>
							)}
						</>
					) : (
						<button onClick={() => setShowCreatePublicRoom(true)}>New Room</button>
					)}

					<h5>Liste des salles</h5>
					<ul className="liste_salles">
						{listrooms && listrooms.map((room, index) => (
							<li key={index}>
								<Link to={`/room/${room.name}`} onClick={(e) => handleRoomClick(e, room)}>
									{room.name} {room.password && "🔒"}
								</Link>
							</li>
						))}
					</ul>
					<h5>Liste des dms</h5>
					<ul className="liste_dms">
						{dmrooms && dmrooms.map((room, index) => (
							<li key={index}>
								<Link to={`/room/${room.name}`} onClick={(e) => handleRoomClick(e, room)}>
									{room.dmname}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h5>Liste des utilisateurs</h5>
					<div className="btn-group dropend">
						<ul>
							{usersconnected.map((user, index) => (
								<li key={index}>
									<button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
										{user.name}
									</button>
									<ul className="dropdown-menu">
										<button className="dropdown-item" onClick={() => handleProfile(user.id)}> Profile </button>
										<button className="dropdown-item" onClick={() => {
											const randomRoomName = makeName(8);
											sendNotification(user.id, `${user.name} veut demarrer une discussion avec vous.`, userId, randomRoomName); 
											createRoom(randomRoomName, user.id);}}> Envoyer une invitation </button>
									</ul>
								</li>
							))}
						</ul>
					</div>
					<ModalInstance
						height="30%"
						width="40%"
						isModal={isModalProfile}
						modalRef={modalProfile}
						name="Profile"
						onLaunchUpdate={null}
						onClose={() => setIsModalProfile(false)}
					>
						<Profile id={profileId}/>
					</ModalInstance>
					<div>
						<h3>Notifications en temps réel</h3>
						<ul>
							{notifications.map((notif, index) => (
								<li key={index}>
									{notif.response ? (
										<p>Réponse : {notif.response}</p>
									) : (
										<>
											{notif.message}
											{/* <button
												onClick={() => handleResponse(notif.id, "accepté", notif.sender_id, notif.room_name)}
												disabled={clickedNotifications[notif.id]}
											>
												✅ Accepter
											</button>
											<button
												onClick={() => handleResponse(notif.id, "refusé", notif.sender_id, null)}
												disabled={clickedNotifications[notif.id]}
											>
												❌ Refuser
											</button> */}
										</>
									)}
								</li>
							))}
						</ul>
					</div>

					{/* {currentChat && (
						<div>
							<h4>Chat Privé</h4>
							<div>
								{messages.map((msg, i) => (
									<p key={i}><strong>{msg.sender}:</strong> {msg.text}</p>
								))}
							</div>
							<input value={message} onChange={(e) => setMessage(e.target.value)} />
							<button onClick={sendMessage}>Envoyer</button>
						</div>
					)} */}
				</div>
			</div>
			<ToastContainer />
		</>
	);
}
