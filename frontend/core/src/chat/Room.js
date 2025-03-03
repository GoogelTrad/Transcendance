import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import useSocket from '../socket'
import useNotifications from "../SocketNotif"
import axiosInstance from "../instance/AxiosInstance";
import "./room.css"
import useJwt from '../instance/JwtInstance';
// import { getCookies } from '../App';
import { getCookies } from '../instance/TokenInstance';
import ModalInstance from "../instance/ModalInstance";
import Profile from "../users/Profile";

export default function Room() {

	const { roomName } = useParams();
	const query = new URLSearchParams(useLocation().search);
	const socket = useSocket('chat', roomName);
	const [dmname, setdmname] = useState(undefined);
	const [message, setMessage] = useState('');
	const [chat, setChat] = useState([]);
	const [listrooms, setlistrooms] = useState([]);
	const [friendList, setFriendList] = useState([]);
	const [users_room, setUsersRoom] = useState([]);
	const [blockedUsers, setBlockedUsers] = useState([]);
	const [clickedNotifications, setClickedNotifications] = useState({});
	const maxLength = 100;
	const [caracteresRestants, setCaracteresRestants] = useState(maxLength);
	const [isModalProfile, setIsModalProfile] = useState(false);
	const [profileId, setProfileId] = useState(1);
	const modalProfile = useRef(null);

	const navigate = useNavigate();
	const getJwt = useJwt();
	const token = getCookies('token');
	const decodedToken = getJwt(token);
	const userId = decodedToken.id;

	const { notifications, sendNotification, respondNotification } = useNotifications();

	const handleChange = (event) => {
		let texte = event.target.value;
		if (texte.length <= maxLength) {
			setMessage(texte);
			setCaracteresRestants(maxLength - texte.length);
		}
	};

	useEffect(() => {
		if (socket.ready) {
			socket.on('history', (data) => {
				const formattedMessages = data.messages.map(msg => ({
					username: msg.user,
					message: msg.content,
					timestamp: msg.timestamp
				}));
				setChat(formattedMessages);
			});
			socket.on('chat_message', (data) => {
				const newMessage = {
					username: data.username,
					message: data.message,
					timestamp: data.timestamp,
				}
				setChat((prevChat) => [...prevChat, newMessage]);
			});
			socket.on('join_room', (data) => {
				if (data.status) {
					console.log("Salle rejoint room:", data.room_name);
					navigate(`/room/${data.room_name}`);
				} else {
					showToast("error", data.error);
				}
			});
			return () => {}
		}
	}, [socket, navigate, navigate]);

	const sendMessage = (e) => {
		e.preventDefault();
		setCaracteresRestants(maxLength);
		if (message.trim() === "") {
			showToast("error", "Unable to send a blank message");
			return;
		}
		if (socket.ready) {
			socket.send({
				type: 'send_message',
				room: roomName,
				message: message,
			});
			setMessage('');
		}
	};

	const clearRoom = async () => {
		try {
			const response = await axiosInstance.post('/api/livechat/exit-room/', {room_name: roomName});
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
			showToast("error", "Room name not found");
			return;
		}

		if (room.password) {
			const enteredPassword = prompt(`A password is required for "${room.name}" :`);
			if (enteredPassword) {
				clearRoom();
				joinRoom(room.name, enteredPassword);
			} else {
				showToast("error", "Enter a password for this room")
			}
		} else {
			clearRoom();
			joinRoom(room.name);
		}
	}

	const listroom = async () => {
		try {
			const response = await axiosInstance.get('/api/livechat/listroom/');
			//console.log("DONNEES RECUES:", response.data);
			setlistrooms(response.data.publicRooms);
		} catch (error) {
			console.error("Erreur lors de la récupération des salles", error);
		}
	}

	const FriendList = async () => {
		try {
			const reponse = await axiosInstance.get(`/api/friends/list/${decodedToken.id}`);
			setFriendList(reponse.data);
			//console.log(reponse.data)
		}
		catch(error) {
			console.log(error);
		}
	}

	const Users_room_list = async () => {
		try {
			const response = await axiosInstance.get(`/api/livechat/users_room/${roomName}`);
			setUsersRoom(response.data.filter((value) => value.id !== userId));
			console.log("USERS ROOMS :", response.data);
		}
		catch(error) {
			console.log(error);
		}
	}

	const get_room = async () => {
		try {
			const response = await axiosInstance.get(`/api/livechat/room/${roomName}`);
			const { dmname: roomPseudo } = response.data
			setdmname(roomPseudo);
			console.log("DMNAME:", roomPseudo);
		}
		catch(error) {
			console.log(error);
		}
	}

	useEffect(() => {
		listroom();
		FriendList();
		Users_room_list();
		get_room();

		const interval = setInterval(() => {
			Users_room_list();
		}, 10000);

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
					<h5>List of rooms</h5>
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
						{console.log("ROOM DMNAME:", dmname)}
						<h3>Room Name: { dmname ? dmname : roomName }</h3>
					</div>
					<div className="chat-messages" style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
						{chat.map((msg, index) => (
							<div key={index} style={{ marginBottom: '10px' }}>
								<strong>{msg.username}:</strong> {msg.message}{' '}
								<small>({new Date(msg.timestamp).toLocaleTimeString()})</small>
							</div>
						))}
					</div>
					<div className="saisi">
						<form onSubmit={sendMessage}>
							<input id="chat-message-input" type="text" size="100" maxLength={maxLength} value={message} onChange={handleChange}/>
							<p>Remaining characters: {caracteresRestants}</p>
							<button className="send" type='submit'> Send </button>
						</form>
						<button className="exit" onClick={() => navigate(`/chat/`)}> Exit </button>
					</div>
				</div>
				<div className="List">
					<div className="User_list">
						<h5>Friends</h5>
						<ul>
							{friendList?.friends?.length > 0 ? (
								friendList.friends.map((friend) => (
									<li key={friend.id}>
										<Link to={`/profile/${friend.id}`}> {friend.name} </Link>
									</li>
								))
							) : (
								<li>No friend found</li>
							)}
						</ul>
					</div>
					<div>
						<h5>Other users</h5>
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
										<button className="dropdown-item" onClick={() => sendNotification(user.id, `${decodedToken.name} invites you to play a game of pong`, userId)}> Send an invitation to play </button>
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
										<p>Response : {notif.response}</p>
									) : (
										<>
											{notif.message}
											<button
												onClick={() => handleResponse(notif.id, "accepté", notif.sender_id)}
												disabled={clickedNotifications[notif.id]}
											>
												✅ Accept
											</button>
											<button
												onClick={() => handleResponse(notif.id, "refusé", notif.sender_id)}
												disabled={clickedNotifications[notif.id]}
											>
												❌ Refuse
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