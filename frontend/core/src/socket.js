import { useEffect, useState } from "react";

export default function useSocket(name, param = '') {
    const [ready, setReady] = useState(false);
    const [socket, setSocket] = useState();
    const handlers = new Map();

    useEffect(() => {
        const isValidRoomName = /^[0-9a-zA-Z]+$/.test(String(param));
        if (!isValidRoomName) {
            return;
        }

        let socket = new WebSocket(
            `${process.env.REACT_APP_SOCKET_IP}ws/${name}/${encodeURIComponent(String(param))}`
        );

        socket.onopen = () => {
            setReady(true);
        };

        socket.onclose = () => {
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