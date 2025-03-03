import { useEffect, useState } from "react";

export default function useSocket(name, param = '') {
	const [ready, setReady] = useState(false);
	const [socket, setSocket] = useState();
	const handlers = new Map();

	useEffect(() => {
		let socket = new WebSocket(`${process.env.REACT_APP_API_URL}ws/${name}/${String(param)}`)

		socket.onopen = () => {
			console.log('WebSocket connected');
			setReady(true);
		};

		socket.onclose = () => {
			console.log('WebSocket disconnected');
		};

		socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.type && handlers.has(data.type)) {
				const listenner = handlers.get(data.type)
				listenner(data);
			}
		}

		setSocket(socket);

		return () => {
			if (ready) {
				socket.close();
				handlers.clear();
				setReady(false);
			}
		};
	}, [name, ready, param]);

	const send = (data) => {
		if (socket) {
			return socket.send(JSON.stringify(data));
		}
	}

	const on = (event, listenner) => {
		if (!handlers.has(event)) {
			handlers.set(event, listenner);
		}
	};

	const remove = (event) => {
		if (event in handlers) {
			delete handlers[event];
		}
	}

	return {
		current: socket, ready, send, on, remove
	};
}