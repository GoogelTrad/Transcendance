import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSocket from '../socket'
import "./room.css"

export default function Room() {
	console.log("je passe4");
	const socket = useSocket('chat', 'private');
	console.log("ROOM SOCKET:", socket);
	const { roomName } = useParams();

	const [message, setMessage] = useState('');
	// const [chat] = useState('');
	const [chat, setChat] = useState('');

	const handleChange = (e) => setMessage(e.target.value);

	useEffect(() => {
		if (socket.ready) {
			socket.on('chat_message', (data) => {
				const newMessage = `${data.username}: ${data.message}\n`; // Ajouter l'username
				setChat((prevChat) => prevChat + newMessage);
			});

			return () => {}
		}
	}, [socket]);
	

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
	
	return (
		<>
			<div className="general">
				<div className="titre">
					<h3>Chat Room: {roomName}</h3>
				</div>
				<div className="chat">
					<textarea id="chat-log" cols="100" rows="20" value={chat} readOnly />
					<div className="saisi">
						<input id="chat-message-input" type="text" size="100" value={message} onChange={handleChange}/>
						<button className="send" onClick={sendMessage}> Send </button>
					</div>
				</div>
			</div>
		</>
	);
}

// export default function Room() {
// 	const socket = useSocket('chat', 'public');
// 	const [message, setMessage] = useState('');
// 	const [chat, setChat] = useState('');
// 	const navigate = useNavigate();
// 	const [roomName, setRoomName] = useState("");

// 	const handleChange = (e) => setMessage(e.target.value);
// 	const handleChangeRoomName = (e) => setRoomName(e.target.value);
	
// 	useEffect(() => {
// 		if (socket.ready) {
// 			socket.on('chat_message', (data) => {
// 				const newMessage = `${data.username}: ${data.message}\n`; // Ajouter l'username
// 				setChat((prevChat) => prevChat + newMessage);
// 			});

// 			socket.on('create_room', (data) => {
// 				console.log("Données reçues pour la création de la salle :", data);
// 				if (data.status) {
// 					console.log("Salle créée:", data.room_name);
// 					navigate(`/room/${data.room_name}`); // Redirige vers une page dédiée à la salle
// 				} else {
// 					console.warn("Échec de la création de la salle");
// 				}
// 			});
	
// 			// Nettoyage : réinitialise l'écouteur précédent
// 			return () => {};
// 		}
// 	}, [socket, navigate]);

// 	const createRoom = () => {
// 		if (roomName.trim() === "") {
// 			console.warn("Le nom de la salle ne peut pas être vide.");
// 			return;
// 		}
// 		if (socket.ready) {
// 			socket.send({
// 				type: "create_room",
// 				room_name: roomName,
// 			});
// 		}
// 	};

// 	function sendMessage() {
// 		if (message.trim() === "") {
// 			console.warn("Impossible d'envoyer un message vide."); // Message de débogage
// 			return; // Arrête la fonction si le message est vide ou contient uniquement des espaces
// 		}
// 		if (socket.ready) {
// 			socket.send({
// 				type: 'send_message',
// 				room: 'public',
// 				message: message,
// 			});
// 			setMessage(''); // Réinitialisez le champ message après l'envoi
// 		}
// 	}
	
// 	return (
// 		<>
// 			<div className="general">
// 				<div className="titre">
// 					<p>Public Chat</p>
// 				</div>
// 				<div className="create-room">
// 					<input type="text" placeholder="Nom de la salle" value={roomName} onChange={handleChangeRoomName}/>
// 					<button onClick={createRoom}>New Room</button>
// 				</div>
// 				<div className="chat">
// 					<textarea id="chat-log" cols="100" rows="20" value={chat} readOnly />	{/*onChange={handleChangeChat}*/}
// 					<div className="saisi">
// 						<input id="chat-message-input" type="text" size="100" value={message} onChange={handleChange}/>
// 						<button className="send" onClick={sendMessage}> Send </button>
// 					</div>
// 				</div>
// 			</div>
// 		</>
// 	);
// }