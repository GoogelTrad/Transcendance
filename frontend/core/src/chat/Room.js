import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { showToast } from "../instance/ToastsInstance";
import useSocket from '../socket'
import axiosInstance from "../instance/AxiosInstance";
import "./room.css"
import useJwt from '../instance/JwtInstance';
import { getCookies } from '../App';


export default function Room() {

	const socket = useSocket('chat', 'private');
	
	const { roomName } = useParams();
	const [message, setMessage] = useState('');
	const [chat, setChat] = useState('');
	// const [nameRoom, setNameRoom] = useState('');
	const [listrooms, setlistrooms] = useState([]);
	const [friendList, setFriendList] = useState([]);
	const [users_room, setUsersRoom] = useState([]);

	const navigate = useNavigate();
	const getJwt = useJwt();

	const handleChange = (e) => setMessage(e.target.value);

	useEffect(() => {
		if (socket.ready) {
			socket.on('chat_message', (data) => {
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
	}, [socket, navigate]);


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
				alert(`Vous vous dirigez vers la salle: ${room.name}`);
				joinRoom(room.name, enteredPassword);
			} else {
				alert("Mot de passe requis !");
			}
		} else {
			alert(`Vous vous dirigez vers la salle: ${room.name}`);
			joinRoom(room.name);
		}
	}

	const listroom = async () => {
		try {
			const response = await axiosInstance.get('/livechat/listroom/');
			//console.log("DONNEES RECUES:", response.data);
			setlistrooms(response.data);
		} catch (error) {
			console.error("Erreur lors de la récupération des salles", error);
		}
	}

	const FriendList = async () => {
		const token = getCookies('token');
		const decodeToken = getJwt(token);

		try {
			const reponse = await axiosInstance.get(`/friends/list/${decodeToken.id}`);
			setFriendList(reponse.data);
			//console.log(reponse.data)
		}
		catch(error) {
			console.log(error);
		}
	}

	// const Users_room_list = async () => {
	// 	try {
	// 		const reponse = await axiosInstance.get(`livechat/users_room/${roomName}`);
	// 		setUsersRoom(reponse.data);
	// 		console.log("USERS ROOMS :", reponse.data)
	// 	}
	// 	catch(error) {
	// 		console.log(error);
	// 	}
	// }

	useEffect(() => {
		listroom();
		FriendList();
		//Users_room_list();
	}, []);

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
						<input id="chat-message-input" type="text" size="100" value={message} onChange={handleChange}/>
						<button className="send" onClick={sendMessage}> Send </button>
					</div>
				</div>
				<div className="friendlist">
				<h5>Liste des amis</h5>
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
				<ul>

				</ul>
				</div>
			</div>
		</>
	);
}