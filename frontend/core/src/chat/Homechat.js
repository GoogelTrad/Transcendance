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

	const [createName, setCreateRoomName] = useState("");
	const [createpassword, setCreatePassword] = useState("");
	const [createdRoomName, setCreatedRoomName] = useState("");
	const [showCreatePublicRoom, setShowCreatePublicRoom] = useState(false);
	const [isCreateSwitchOn, setIsCreateSwitchOn] = useState(false);
	const [listrooms, setlistrooms] = useState([]);
	const [dmrooms, setdmrooms] = useState([]);
	const [usersconnected, setusersconnected] = useState([]);
	const [blockedUsers, setBlockedUsers] = useState([]);
	const [isModalProfile, setIsModalProfile] = useState(false);
	const [profileId, setProfileId] = useState(1);
	const modalProfile = useRef(null);
	

	const navigate = useNavigate();

	const handleChangeCreateRoom = (e) => setCreateRoomName(e.target.value);
	const handleChangeCreatePassword = (e) => setCreatePassword(e.target.value);

	const handleCreateToggle = () => { setIsCreateSwitchOn(!isCreateSwitchOn) };

	const getJwt = useJwt();

	const token = getCookies('token');
	const decodedToken = getJwt(token);
	const userId = decodedToken.id;

	const [blockedData, setBlockedData] = useState({
		from_user: userId,
		to_user: '',
	});
	
	const { notifications, sendNotification, respondNotification } = useNotifications();

	useEffect(() => {
		if (socket.ready) {
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
					console.log("Salle rejoint home:", data.room_name);
					navigate(`/room/${data.room_name}`);
				} else {
					showToast("error", data.error);
				}
			});
		}
	}, [socket]);

	const createRoom = (roomName, invited_user_id = undefined) => {
		if (roomName === "") {
			showToast("error", "Room name cannot be empty");
			return;
		}
		if (socket.ready) {
			socket.send({
				type: "create_room",
				room_name: roomName,
				password: createpassword,
				invited_user_id,
				invitation_required: true
			});
		}
	};

	const joinRoom = (name, password = null, dmname = null) => {
		console.log("join room dmname", dmname);
		if (socket.ready) {
			socket.send({
				type: "join_room",
				room_name: name,
				password: password,
				dmname
			});
		}
	};

	const listroom = async () => {
		try {
			const response = await axiosInstance.get('/api/livechat/listroom/');
			console.log("Liste des salles:", response.data);

			const dmRooms = response.data.dmRooms.map((value) => {
				value.dmname = value.users.filter((v) => {
					if (v.id !== userId) return true;
					return false;
				})[0]?.name + ' dm' ?? value.name + ' dm';
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
			console.log("Liste des users:", response.data);
			setusersconnected(response.data.filter((v) => v.id !== userId));
		} catch (error) {
			console.error("Erreur lors de la récupération des utilisateurs", error);
		}
	};

	const blocked_user = async (id) => {
		const data = {'from_user': userId, 'to_user': id};
		try {
			const response = await axiosInstance.post(`/api/livechat/block/`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.status === 200)
			{
				listUsersBlocked();
				showToast("message", "User block good");
			}

		} catch(error) {
			console.error("Erreur lors de la requete de bloquage", error);
		}
	}

	const unlocked_user = async (id) => {
		const data = {'from_user': userId, 'to_user': id};
		try {
			const response = await axiosInstance.post(`/api/livechat/unlock/`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.status === 200)
			{
				listUsersBlocked();
				showToast("succes", "User unlock good");
			}

		} catch(error) {
			console.error("Erreur lors de la requete de debloquage", error);
		}
	}

	const listUsersBlocked = async () => {
		try {
			const response = await axiosInstance.get(`/api/livechat/blocked_users/${userId}`);
			setBlockedUsers(response.data);
		}
		catch(error) {
			console.log(error);
		}
	};

	useEffect(() => {
		users_connected();
		listroom();
		listUsersBlocked();

		const interval = setInterval(() => {
			users_connected();
			listroom();
			listUsersBlocked();
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	const handleRoomClick = async (e, room, dmname = null) => {
		console.log("dmname", dmname);
		e.preventDefault();

		if (!room.name) {
			showToast("error", "Room name not found");
			return;
		}

		if (room.password) {
			const enteredPassword = prompt(`A password is required for "${room.name}" :`);
			if (enteredPassword) {
				joinRoom(room.name, enteredPassword);
			} else {
				showToast("error", "Enter a password for this room")
			}
		} else {
			joinRoom(room.name, null, dmname);
		}
	}

	const handleProfile = (user_id) => {
		setIsModalProfile(!isModalProfile);
		setProfileId(user_id);
	}

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
									<input type="text" placeholder="Room name" value={createName} onChange={handleChangeCreateRoom} />
									<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
									<button onClick={() => createRoom(createName)}>New Room</button>
									{socket && createdRoomName && <Room/>}
								</>
							)}

							{isCreateSwitchOn && (
								<>
									<input type="text" placeholder="Room name" value={createName} onChange={handleChangeCreateRoom} />
									<input type="password" placeholder="Room password" value={createpassword} onChange={handleChangeCreatePassword} />
									<button onClick={() => setShowCreatePublicRoom(false)}>Cancel</button>
									<button onClick={() => createRoom(createName)}>New Room</button>
									{socket && createdRoomName && <Room/>}
								</>
							)}
						</>
					) : (
						<button onClick={() => setShowCreatePublicRoom(true)}>New Room</button>
					)}

					<h5>List of rooms</h5>
					<ul className="liste_salles">
						{listrooms && listrooms.map((room, index) => (
							<li key={index}>
								<Link to={`/room/${room.name}`} onClick={(e) => handleRoomClick(e, room)}>
									{room.name} {room.password && "🔒"}
								</Link>
							</li>
						))}
					</ul>
					<h5>List of dms</h5>
					<ul className="liste_dms"> 
						{dmrooms && dmrooms.map((room, index) => (
							<li key={index}>
								<Link to={`/room/${room.name}`} onClick={(e) => handleRoomClick(e, room, room.dmname)}>
									{room.dmname}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h5>List of users</h5>
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
											sendNotification(user.id, `${decodedToken.name} wants to start a discussion with you.`, userId, randomRoomName); 
											createRoom(randomRoomName, user.id);}}
										> Start a private discussion </button>
										{!blockedUsers.includes(user.id) && (
											<button className="dropdown-item" onClick={() => blocked_user(user.id)}> Block </button>
										)}
										{blockedUsers.includes(user.id) && (
											<button className="dropdown-item" onClick={() => unlocked_user(user.id)}> Unlock </button>
										)}
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
									{ notif.response ? (
										<p> Response : {notif.response}</p>
									) : (
										<>
											{notif.message}
										</>
									)}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
			<ToastContainer />
		</>
	);
}
