import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import useSocket from '../socket'
import useNotifications from "../SocketNotif"
import axiosInstance from "../instance/AxiosInstance";
import "./room.css"
import useJwt from '../instance/JwtInstance';
import { getCookies } from '../App';
import ModalInstance from "../instance/ModalInstance";
import Profile from "../users/Profile";

export default function Room() {

	const { roomName } = useParams();
	const socket = useSocket('chat', roomName);
	const [message, setMessage] = useState('');
	const [chat, setChat] = useState('');
	const [listrooms, setlistrooms] = useState([]);
	const [friendList, setFriendList] = useState([]);
	const [users_room, setUsersRoom] = useState([]);
	const [blockedUsers, setBlockedUsers] = useState([]);
	const [clickedNotifications, setClickedNotifications] = useState({});
	const maxLength = 10;
	const [caracteresRestants, setCaracteresRestants] = useState(maxLength);
	const [isModalProfile, setIsModalProfile] = useState(false);
	const [profileId, setProfileId] = useState(1);
	const modalProfile = useRef(null);

	const navigate = useNavigate();
	const getJwt = useJwt();

	const token = getCookies('token');
	const decodedToken = getJwt(token);
	const userId = decodedToken.id;

	console.log("ID: ", userId);

	const { notifications, sendNotification, respondNotification } = useNotifications();

	const handleChange = (event) => {
		let texte = event.target.value;
		if (texte.length <= maxLength) {
			setMessage(texte);
			setCaracteresRestants(maxLength - texte.length);
		}
	};

	useEffect(() => {
		const listUsersBlocked = async () => {
			try {
				const response = await axiosInstance.get(`/livechat/blocked-users/`);
				setBlockedUsers(response.data);
			}
			catch(error) {
				console.log(error);
			}
		};
		listUsersBlocked();
	}, []);
	

	useEffect(() => {
		if (socket.ready) {
			socket.on("chat_message", (data) => {
				// Vérifier si l'expéditeur est bloqué côté frontend
				if (blockedUsers.includes(data.username)) {
					return; // Ne pas afficher le message
				}
				const newMessage = `${data.username}: ${data.message}\n`; // Ajouter l'username
				setChat((prevChat) => prevChat + newMessage);
			});
			socket.on("join_room", (data) => {
				if (data.status) {
					console.log("Salle rejoint :", data.room_name);
					navigate(`/room/${data.room_name}`);
				} else {
					showToast("error", data.error);
				}
			});
			return () => {}
		}
	}, [socket, navigate, blockedUsers]);

	function sendMessage() {
		if (message.trim() === "") {
			console.warn("Impossible d'envoyer un message vide.");
			return;
		}
		if (socket.ready) {
			socket.send({
				type: 'send_message',
				room: 'public',
				message: message,
			});
			setMessage(''); // Réinitialisez le champ message après l'envoi
		}
	}

	const clearRoom = async () => {
		try {
			const response = await axiosInstance.post('/livechat/exit-room/', {room_name: roomName});
			console.log(response.data);
		} catch (error) {
			console.error("Erreur lors du clean de la room", error);
		}
	};

	const joinRoom = (name, password = null) => {
		if (socket.ready) {
			socket.send({
				type: "join_room",
				room_name: name,
				password: password,
			});
		}
	};

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
				clearRoom();
				joinRoom(room.name, enteredPassword);
			} else {
				alert("Mot de passe requis !");
			}
		} else {
			clearRoom();
			joinRoom(room.name);
		}
	}

	const listroom = async () => {
		try {
			const response = await axiosInstance.get('/livechat/listroom/');
			//console.log("DONNEES RECUES:", response.data);
			setlistrooms(response.data.publicRooms);
		} catch (error) {
			console.error("Erreur lors de la récupération des salles", error);
		}
	}

	const FriendList = async () => {
		// const token = getCookies('token');
		// const decodeToken = getJwt(token);

		try {
			const response = await axiosInstance.get(`/friends/list/${decodedToken.id}`);
			setFriendList(response.data);
			//console.log(reponse.data)
		}
		catch(error) {
			console.log(error);
		}
	}

	const Users_room_list = async () => {
		try {
			const response = await axiosInstance.get(`livechat/users_room/${roomName}`);
			setUsersRoom(response.data.filter((value) => value.id !== userId));
			console.log("USERS ROOMS :", response.data);
		}
		catch(error) {
			console.log(error);
		}
	}

	useEffect(() => {
		listroom();
		FriendList();
		Users_room_list();

		// Rafraîchir toutes les 5 secondes
		const interval = setInterval(() => {
			Users_room_list();
		}, 10000);

		// Nettoyer l'intervalle quand le composant est démonté
		return () => clearInterval(interval);
	}, [roomName]);

	const handleProfile = (user_id) => {
		setIsModalProfile(!isModalProfile);
		setProfileId(user_id);
	}

	const handleResponse = (notifId, response, senderId) => {
		if (!clickedNotifications[notifId]) {
			respondNotification(userId, response, senderId);
			setClickedNotifications((prev) => ({ ...prev, [notifId]: true }));
		}
	};

	return (
		<>
			<div className="general-room d-flex justify-content-between">
				<div className="listroom">
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
				<div className="chat">
					<div className="titre">
						<h3>Chat Room: {roomName}</h3>
					</div>
					<textarea id="chat-log" cols="100" rows="20" value={chat} readOnly />
					<div className="saisi">
						<input id="chat-message-input" type="text" size="100" maxLength={maxLength} value={message} onChange={handleChange}/>
						<p>Caractères restants : {caracteresRestants}</p>
						<button className="send" onClick={sendMessage}> Send </button>
						<button className="exit" onClick={() => navigate(`/chat/`)}> Exit </button>
					</div>
				</div>
				<div className="List">
					<div className="User_list">
						<h5>Amis</h5>
						<ul>
							{friendList?.friends?.length > 0 ? (
								friendList.friends.map((friend) => (
									<li key={friend.id}>
										<Link to={`/profile/${friend.id}`}> {friend.name} </Link>
									</li>
								))
							) : (
								<li>Aucun ami trouvé.</li>
							)}
						</ul>
					</div>
					<div>
						<h5>Autres utilisateurs</h5>
					</div>
					<div className="btn-group dropend">
						<ul>
							{users_room.map((user, index) => (
								<li key={index}>
									<button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
										{user.username}
									</button>
									<ul className="dropdown-menu">
										<button className="dropdown-item" onClick={() => handleProfile(user.id)}> Profile </button>
										<button className="dropdown-item" onClick={() => sendNotification(user.id, "Voulez-vous jouer une partie ?", userId)}> Envoyer une notification </button>
									</ul>
								</li>
							))}
						</ul>
					</div>
					<ModalInstance height="30%" width="40%" isModal={isModalProfile} modalRef={modalProfile} name="Profile" onLaunchUpdate={null} onClose={() => setIsModalProfile(false)}>
						<Profile id={profileId}/>
					</ModalInstance>
					<div>
						<h3>Notifications</h3>
						<ul>
							{notifications.map((notif, index) => (
								<li key={index}>
									{notif.response ? (
										<p>Réponse : {notif.response}</p>
									) : (
										<>
											{notif.message}
											<button
												onClick={() => handleResponse(notif.id, "accepté", notif.sender_id)}
												disabled={clickedNotifications[notif.id]}
											>
												✅ Accepter
											</button>
											<button
												onClick={() => handleResponse(notif.id, "refusé", notif.sender_id)}
												disabled={clickedNotifications[notif.id]}
											>
												❌ Refuser
											</button>
										</>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</>
	);
}