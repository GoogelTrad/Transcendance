import { useEffect, useState } from "react";

const BASE_URL = 'ws://localhost:8000/ws/'

export default function useSocket(name) {
	const [ready, setReady] = useState(false);
	const [socket, setSocket] = useState();
  
	useEffect(() => {
		let socket = new WebSocket(`${BASE_URL}${name}/`)
		socket.onopen = () => {
			console.log('WebSocket connected');
			setReady(true);
		};

		socket.onclose = () => {
			console.log('WebSocket disconnected');
		};

		setSocket(socket);

		return () => {
			if (ready) {
				socket.close();
				setReady(false);
			}
		};
	}, [name, ready]);

	const send = (data) => {
		if (socket) {
			return socket.send(JSON.stringify(data));
		}
	}

	const add = (listenner) => {
		if (socket)
			socket.onmessage = listenner
	}

	return {
		current: socket, ready, send, add
	};
}