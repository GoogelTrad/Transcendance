//import { socket }  from "../socket";
import { useEffect, useState, useCallback } from "react";
import useSocket from '../socket'
import "./index.css"

export default function Room() {
	const socket = useSocket('chat', 'public');
	const [message, setMessage] = useState('');
	const [chat, setChat] = useState('');
	const handleChange = (e) => setMessage(e.target.value);
	//const handleChangeChat = (e) =>  setChat(chat + e.target.value)	

	// const reciveMessage = useCallback((e) => {
	// 	const data = JSON.parse(e.data);
	// 	setChat((prevChat) => prevChat + data.message + '\n');
	// }, []);
	
	useEffect(() => {
		if (socket.ready) {
			socket.on('chat_message', (data) => {
				const newMessage = `${data.username}: ${data.message}\n`; // Ajouter l'username
				setChat((prevChat) => prevChat + newMessage);
			});

			socket.on('create_room', (data) => {
				if (data.status) {
					// ajoute la room
				}
				console.log(data);
			});
	
			// Nettoyage : réinitialise l'écouteur précédent
			return () => {};
		}
	}, [socket]);

	function createRoom() {
		if (socket.ready) {
			socket.send({
				type: 'create_room',
				room_name: 'test',
			});
		}
	}
	

	function sendMessage() {
		if (message.trim() === "") {
			console.warn("Impossible d'envoyer un message vide."); // Message de débogage
			return; // Arrête la fonction si le message est vide ou contient uniquement des espaces
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
					<p>Public Chat</p>
				</div>
				<button onClick={() => {createRoom()}}>new</button>
				<div className="chat">
					<textarea id="chat-log" cols="100" rows="20" value={chat} readOnly />	{/*onChange={handleChangeChat}*/}
					<div className="saisi">
						<input id="chat-message-input" type="text" size="100" value={message} onChange={handleChange}/>
						<button className="send" onClick={() => sendMessage()}>send</button>
					</div>
				</div>
			</div>
		</>)
}