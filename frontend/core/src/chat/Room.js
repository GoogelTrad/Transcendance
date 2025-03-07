import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import useSocket from '../socket'
import useNotifications from "../SocketNotif"
import axiosInstance from "../instance/AxiosInstance";
import "./room.css"
import ModalInstance from "../instance/ModalInstance";
import Profile from "../users/Profile";

import { useTranslation } from 'react-i18next';
import { useAuth } from "../users/AuthContext";

export default function Room() {

	const { t } = useTranslation();

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
	const messagesEndRef = useRef(null);

	const navigate = useNavigate();
	const { userInfo } = useAuth();
	const userId = userInfo.id;

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
					showToast("error", t('ToastsError'));
				}
			});
			return () => {}
		}
	}, [socket, navigate, navigate]);

	const sendMessage = (e) => {
		e.preventDefault();
		setCaracteresRestants(maxLength);
		if (message.trim() === "") {
			showToast("error", t('Toasts.NotBlankMessage'));
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
		} catch (error) {
			showToast("error", t('ToastsError'));
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

		if (!room.name) {
			showToast("error", t('Toasts.NotRoomName'));
			return;
		}

		if (room.password) {
			const enteredPassword = prompt(`${t('PasswordRequired')} "${room.name}" :`);
			if (enteredPassword) {
				clearRoom();
				joinRoom(room.name, enteredPassword);
			} else {
				showToast("error", t('Toasts.EnterPassword'));
			}
		} else {
			clearRoom();
			joinRoom(room.name);
		}
	}

	const listroom = async () => {
		try {
			const response = await axiosInstance.get('/api/livechat/listroom/');
			setlistrooms(response.data.publicRooms);
		} catch (error) {
			showToast("error", t('ToastsError'));
		}
	}

	const FriendList = async () => {
		try {
			const reponse = await axiosInstance.get(`/api/friends/list/${userInfo.id}`);
			setFriendList(reponse.data);
		}
		catch(error) {
			showToast("error", t('ToastsError'));
		}
	}

	const Users_room_list = async () => {
		try {
			const response = await axiosInstance.get(`/api/livechat/users_room/${roomName}`);
			setUsersRoom(response.data.filter((value) => value.id !== userId));
		}
		catch(error) {
			showToast("error", t('ToastsError'));
		}
	}

	const get_room = async () => {
		try {
			const response = await axiosInstance.get(`/api/livechat/room/${roomName}`);
			const { dmname: roomPseudo } = response.data
			setdmname(roomPseudo);
		}
		catch(error) {
			showToast("error", t('ToastsError'));
		}
	}

	useEffect(() => {
		if(userInfo) {
			listroom();
			FriendList();
			Users_room_list();
			get_room();
		}

		const interval = setInterval(() => {
			Users_room_list();
			listroom();
		}, 10000);

		return () => clearInterval(interval);
	}, [roomName]);

	useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [chat]);

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
					<h5>{t('ListRooms')}</h5>
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
					<button className="exit" onClick={() => navigate(`/chat/`)}> {"🠔"} </button>
					<div className="titre">
						<h3>{t('RoomName')}: { dmname ? dmname : roomName }</h3>
					</div>
					<div ref={messagesEndRef} className="chat-messages">
						{chat.map((msg, index) => (
							<div key={index} style={{ marginBottom: '10px' }}>
								<small>({new Date(msg.timestamp).toLocaleTimeString()})</small>
								{' '}<strong>{msg.username}:</strong> {msg.message}{' '}
							</div>
						))}
					</div>
					<div className="saisi">
						<form onSubmit={sendMessage}>
							<div className="d-flex">
								<input id="chat-message-input" type="text" size="100" maxLength={maxLength} value={message} onChange={handleChange}/>
								<button className="send" type='submit'> {"➤"} </button>
							</div>
							<p>{t('Characters')}: {caracteresRestants}</p>
						</form>
					</div>
				</div>
				<div className="List">
					<div className="User_list">
						<h5>{t('Friends')}</h5>
						<ul>
							{friendList?.friends?.length > 0 ? (
								friendList.friends.map((friend) => (
									<li key={friend.id}>
										<Link to={`/profile/${friend.id}`}> {friend.name} </Link>
									</li>
								))
							) : (
								<li>{t('NoFriend')}</li>
							)}
						</ul>
					</div>
					<div>
						<h5>{t('OthersUsers')}</h5>
					</div>
					<div className="btn-group dropend">
						<ul>
							{users_room.map((user, index) => (
								<li key={index}>
									<button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
										{user.username}
									</button>
									<ul className="dropdown-menu">
										<button className="dropdown-item" onClick={() => handleProfile(user.id)}> {t('Profile')} </button>
										<button className="dropdown-item" onClick={() => sendNotification(user.id, `${userInfo.name} ${t('Pong')}`, userId)}> {t('PongInvitation')} </button>
									</ul>
								</li>
							))}
						</ul>
					</div>
					<ModalInstance height="30%" width="40%" isModal={isModalProfile} modalRef={modalProfile} name="Profile" onLaunchUpdate={null} onClose={() => setIsModalProfile(false)}>
						<Profile id={profileId}/>
					</ModalInstance>
					<div>
						<h3>{t('Notifications')}</h3>
						<ul>
							{notifications.map((notif, index) => (
								<li key={index}>
									{notif.response ? (
										<p>{t('Response')} : {notif.response}</p>
									) : (
										<>
											{notif.message}
											<button
												onClick={() => handleResponse(notif.id, "accepté", notif.sender_id)}
												disabled={clickedNotifications[notif.id]}
											>
												✅ {t('Accept')}
											</button>
											<button
												onClick={() => handleResponse(notif.id, "refusé", notif.sender_id)}
												disabled={clickedNotifications[notif.id]}
											>
												❌ {t('Decline')}
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