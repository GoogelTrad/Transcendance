//import { socket }  from "../socket";
import { useEffect, useState } from "react";
import useSocket from '../socket'

export default function Room() {

	const socket = useSocket('chat');
	const [message, setMessage] = useState('');
	const [chat, setChat] = useState('');
	const handleChange = (e) => setMessage(e.target.value);
	// const handleChangeChat = (e) =>  setChat(chat + e.target.value)

	useEffect(() => {
		if (socket.current) socket.current.onmessage = reciveMessage
	}, [socket])

	function reciveMessage(e) {
		const data = JSON.parse(e.data);
		setChat(chat + data.message + '\n');
	}

	function sendMessage() {
		if (socket.ready)
			socket.send({
				room: 'public',
				message: message
			})
	}

	return (
		<>
    		<textarea id="chat-log" cols="100" rows="20" value={chat} readOnly></textarea>	{/*onChange={handleChangeChat}*/}
    		<input id="chat-message-input" type="text" size="100" value={message} onChange={handleChange}/>
			<button onClick={() => sendMessage()}>send</button>
		</>)
}