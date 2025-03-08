import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import useSocket from '../socket'
import axiosInstance from "../instance/AxiosInstance";
import ModalInstance from "../instance/ModalInstance";
import Profile from "../users/Profile";
import Template from "../instance/Template";
import { useAuth } from "../users/AuthContext";

import "./Homechat.css"
import Room from './Room'

import useNotifications from "../SocketNotif"

import { useTranslation } from 'react-i18next';

export default function HomeChat() {

	const { t } = useTranslation();


	const { userInfo, refreshUserInfo, isAuthenticated} = useAuth();
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
	const [roomIsPrivate, setRoomIsPrivate] = useState(false);

	const navigate = useNavigate();

	const handleChangeCreateRoom = (e) => {
		const value = e.target.value;
		const filteredValue = value.replace(/[^0-9a-zA-Z]/g, '');
		setCreateRoomName(filteredValue);
	};
	const handleChangeCreatePassword = (e) => setCreatePassword(e.target.value);

	const handleCreateToggle = () => { setIsCreateSwitchOn(!isCreateSwitchOn) };

	const [blockedData, setBlockedData] = useState({
		from_user: userInfo?.id,
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
					showToast("error", t('ToastsError'));
				}
			});
			socket.on("join_room", (data) => {
				if (data.status) {
					console.log("Salle rejoint home:", data.room_name);
					navigate(`/room/${data.room_name}`);
				} else {
					showToast("error", t('ToastsError'));
				}
			});
		}
	}, [socket]);

	const createRoom = (roomName, invited_user_id = undefined) => {
		if (roomName === "") {
			showToast("error", t('Toasts.NotEmptyName'));
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

			const dmRooms = response.data.dmRooms.map((value) => {
				value.dmname = value.users[0]?.name + ' dm' ?? value.name;
				return value;
			});

			setlistrooms(response.data.publicRooms);
			setdmrooms(dmRooms);
		} catch (error) {
			if (error.response.status !== 401 )
				showToast("error", t('ToastsError'));
		}
	};

	const users_connected = async () => {
		try {
			const response = await axiosInstance.get('/api/livechat/users_connected/');
			console.log("Liste des users:", response.data);
			setusersconnected(response.data.filter((v) => v.id !== userInfo.id));
		} catch (error) {
			if (error.response.status !== 401 )
				showToast("error", t('ToastsError'));
		}
	};

	const blocked_user = async (id) => {
		const data = {'from_user': userInfo.id, 'to_user': id};
		try {
			const response = await axiosInstance.post(`/api/livechat/block/`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.status === 200) {
				listUsersBlocked();
				showToast("message", t('Toasts.BlockUsers'));
			}

		} catch(error) {
			if (error.response.status !== 401 )
				showToast("error", t('ToastsError'));
		}
	}

	const unlocked_user = async (id) => {
		const data = {'from_user': userInfo.id, 'to_user': id};
		try {
			const response = await axiosInstance.post(`/api/livechat/unlock/`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.status === 200)
			{
				listUsersBlocked();
				showToast("succes", t('Toasts.UnlockUsers'));
			}

		} catch(error) {
			if (error.response.status !== 401 )
				showToast("error", t('ToastsError'));
		}
	}

	const listUsersBlocked = async () => {
		if (userInfo?.id) { 
			try {
				const response = await axiosInstance.get(`/api/livechat/blocked_users/${userInfo.id}`);
				setBlockedUsers(response.data);
			}
			catch(error) {
				if (error.response.status !== 401 )
					showToast("error", t('ToastsError'));
			}
		}
	};

	useEffect(() => {
		if (userInfo.id)
		{
			users_connected();
			listroom();
			listUsersBlocked();
		}

		const interval = setInterval(() => {
			users_connected();
			listroom();
			listUsersBlocked();
		}, 5000);

		return () => clearInterval(interval);
	}, [userInfo?.id]);

	const handleRoomClick = async (e, room, dmname = null) => {
		e.preventDefault();

		if (!room.name) {
			showToast("error", t('Toasts.NotRoomName'));
			return;
		}

		if (room.password) {
			const enteredPassword = prompt(`${t('PasswordRequired')} "${room.name}" :`);
			if (enteredPassword) {
				joinRoom(room.name, enteredPassword);
			} else {
				showToast("error", t('Toasts.EnterPassword'));
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
		<Template>
			<div className="general-chat d-flex justify-content-between">
				<div className="create-public-room">
					{showCreatePublicRoom ? (
						<>
							<div className="form-check form-switch">
								<input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={isCreateSwitchOn} onChange={handleCreateToggle} />
								<label className="form-check-label" htmlFor="flexSwitchCheckDefault">{isCreateSwitchOn ? t('Private') : t('Public')}</label>
							</div>

							{!isCreateSwitchOn && (
								<>
									<input type="text" placeholder={t('RoomName')} value={createName} onChange={handleChangeCreateRoom} />
									<button onClick={() => setShowCreatePublicRoom(false)}>{t('Cancel')}</button>
									<button onClick={() => createRoom(createName)}>{t('NewRoom')}</button>
									{socket && createdRoomName && <Room/>}
								</>
							)}

							{isCreateSwitchOn && (
								<>
									<input type="text" placeholder={t('RoomName')} value={createName} onChange={handleChangeCreateRoom} />
									<input type="password" placeholder={t('Password')} value={createpassword} onChange={handleChangeCreatePassword} />
									<button onClick={() => setShowCreatePublicRoom(false)}>{t('Cancel')}</button>
									<button onClick={() => createRoom(createName)}>{t('NewRoom')}</button>
									{socket && createdRoomName && <Room/>}
								</>
							)}
						</>
					) : (
						<button onClick={() => setShowCreatePublicRoom(true)}>{t('NewRoom')}</button>
					)}

					<h5>{t('ListRooms')}</h5>
					<ul className="liste_salles">
						{listrooms && listrooms.map((room, index) => (
							<li key={index}>
								<Link to={`/room/${room.name}`} onClick={(e) => handleRoomClick(e, room)}>
									{room.name} {room.password && "🔒"}
								</Link>
							</li>
						))}
					</ul>
					<h5>{t('ListDms')}</h5>
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
					<h5>{t('ListUsers')}</h5>
					<div className="btn-group dropend">
						<ul>
							{usersconnected.map((user, index) => (
								<li key={index}>
									<button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
										{user.name}
									</button>
									<ul className="dropdown-menu">
										<button className="dropdown-item" onClick={() => handleProfile(user.id)}> {t('Profile')} </button>
										<button className="dropdown-item" onClick={() => {
											const randomRoomName = makeName(8);
											sendNotification(user.id, `${userInfo.name} ${t('Discussion')}`, userInfo.id, randomRoomName); 
											createRoom(randomRoomName, user.id);}}
										> {t('StartDiscussion')} </button>
										{!blockedUsers.includes(user.id) && (
											<button className="dropdown-item" onClick={() => blocked_user(user.id)}> {t('Block')} </button>
										)}
										{blockedUsers.includes(user.id) && (
											<button className="dropdown-item" onClick={() => unlocked_user(user.id)}> {t('Unlock')} </button>
										)}
									</ul>
								</li>
							))}
						</ul>
					</div>
					<ModalInstance
						height="13%"
						width="40%"
						isModal={isModalProfile}
						modalRef={modalProfile}
						name="Profile"
						onClose={() => setIsModalProfile(false)}
					>
						<Profile id={profileId}/>
					</ModalInstance>
					<div>
						<h3>{t('Notifications')}</h3>
						<ul>
							{notifications.map((notif, index) => (
								<li key={index}>
									{ notif.response ? (
										<p> {t('Response')} : {notif.response}</p>
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
		</Template>
	);
}
