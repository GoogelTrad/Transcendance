import { useEffect, useState } from "react";

export default function usePrivateChat(userId) {
  const BASE_URL_CHAT = `ws://localhost:8000/ws/private_chat/${userId}/`;
  const [socket, setSocket] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(BASE_URL_CHAT);

    ws.onopen = () => console.log("✅ WebSocket Chat connecté !");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Message reçu :", data);

	  console.log("BONSOIR");
      if (data.type === "notification") {
		console.log("HELLLO");
        setInvitations((prev) => [...prev, data]);
		console.log("HELLLO1");
      } else if (data.type === "chat_started") {
		console.log("HELLLO2");
        setCurrentChat(data.room_id);
		console.log("HELLLO3");
        setInvitations((prev) => prev.filter((inv) => inv.room_id !== data.room_id));
		console.log("HELLLO4");
      } else if (data.type === "new_message") {
		console.log("HELLLO5");
        setMessages((prev) => [...prev, { sender: data.sender, text: data.message }]);
		console.log("HELLLO6");
      }
    };

    ws.onclose = () => console.log("❌ WebSocket Chat déconnecté");

    setSocket(ws);
    return () => ws.close();
  }, [userId]);

  const sendInvitation = (targetId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const data = { type: "invite_user", target_id: targetId };
      console.log("📨 Envoi invitation :", data);
      socket.send(JSON.stringify(data));
	  console.log("DGSBGD");
    }
  };

  const acceptInvitation = (roomId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const data = { type: "accept_invite", room_id: roomId };
      console.log("✅ Acceptation invitation :", data);
      socket.send(JSON.stringify(data));
    }
  };

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN && currentChat) {
      const data = { type: "send_message", room_id: currentChat, message };
      console.log("💬 Envoi message :", data);
      socket.send(JSON.stringify(data));
      setMessages((prev) => [...prev, { sender: "moi", text: message }]);
    }
  };

  return { invitations, sendInvitation, acceptInvitation, messages, sendMessage, currentChat };
}
