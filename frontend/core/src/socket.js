// import { useEffect, useState } from "react";

// export default function useSocket(name, param = '') {
// 	const [ready, setReady] = useState(false);
// 	const [socket, setSocket] = useState();
// 	const handlers = new Map();

// 	useEffect(() => {
// 		let socket = new WebSocket(`${process.env.REACT_APP_SOCKET_IP}ws/${name}/${encodeURIComponent(String(param))}`)

// 		socket.onopen = () => {
// 			console.log('WebSocket connected');
// 			setReady(true);
// 		};

// 		socket.onclose = () => {
// 			console.log('WebSocket disconnected');
// 		};

// 		socket.onmessage = (e) => {
// 			const data = JSON.parse(e.data);
// 			if (data.type && handlers.has(data.type)) {
// 				const listenner = handlers.get(data.type)
// 				listenner(data);
// 			}
// 		}

// 		socket.onerror = (error) => {
// 			console.error("Erreur WebSocket:", error);
// 			setReady(false);
// 		};

// 		setSocket(socket);

// 		return () => {
// 			if (ready) {
// 				socket.close();
// 				handlers.clear();
// 				setReady(false);
// 			}
// 		};
// 	}, [name, ready, param]);

// 	const send = (data) => {
// 		if (socket) {
// 			return socket.send(JSON.stringify(data));
// 		}
// 	}

// 	const on = (event, listenner) => {
// 		if (!handlers.has(event)) {
// 			handlers.set(event, listenner);
// 		}
// 	};

// 	const remove = (event) => {
// 		if (event in handlers) {
// 			delete handlers[event];
// 		}
// 	}

// 	return {
// 		current: socket, ready, send, on, remove
// 	};
// }

import { useEffect, useState } from "react";

export default function useSocket(name, param = '') {
    const [ready, setReady] = useState(false);
    const [socket, setSocket] = useState();
    const handlers = new Map();

    useEffect(() => {
        // Valider le param avant de créer la connexion WebSocket
        const isValidRoomName = /^[0-9a-zA-Z]+$/.test(String(param));
        if (!isValidRoomName) {
            console.error("Nom de salle invalide:", param);
            handlers.set("error", (data) => {
                console.error("Erreur simulée:", `Invalid room name: ${param}. Use only alphanumeric characters.`);
                alert(`Invalid room name: ${param}. Use only alphanumeric characters.`);
            });
            return;
        }

        let socket = new WebSocket(
            `${process.env.REACT_APP_SOCKET_IP}ws/${name}/${encodeURIComponent(String(param))}`
        );

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
                const listener = handlers.get(data.type);
                listener(data);
            }
        };

        socket.onerror = (error) => {
            setReady(false);
        };

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
        if (socket && ready) {
            return socket.send(JSON.stringify(data));
        }
    };

    const on = (event, listener) => {
        if (!handlers.has(event)) {
            handlers.set(event, listener);
        }
    };

    const remove = (event) => {
        if (handlers.has(event)) {
            handlers.delete(event);
        }
    };

    return {
        current: socket,
        ready,
        send,
        on,
        remove
    };
}