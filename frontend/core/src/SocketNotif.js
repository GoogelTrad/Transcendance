import { useEffect, useState } from "react";

const BASE_URL_NOTIF = `${process.env.REACT_APP_API_URL}ws/notifications/`;

export default function useNotifications() {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    
    const ws = new WebSocket(BASE_URL_NOTIF);

    ws.onopen = () => console.log("WebSocket connecté !");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Message1 reçu :", data);  // Vérifier que les messages arrivent bien
    
      if (data.type === "send_notification") {
        console.log("Notification reçue: ", data);
        setNotifications((prev) => [
          ...prev,
          { target_id: data.targetId, message: data.message, sender_id: data.sender_id, room_name: data.room_name, response: null },
        ]);
      } 
      else if (data.type === "receive_response") {
        console.log(`Réponse reçue pour la notification ${data.target_id}: ${data.response}`);
        setNotifications((prevNotifications) => [
            ...prevNotifications,
            { target_id: data.targetId, message: data.message, sender_id: data.sender_id, response: data.response }
        ]);
        //console.log("Notifications après mise à jour : ", prevNotifications);
      }
    };    

    ws.onclose = () => console.log("WebSocket déconnecté");

    setSocket(ws);

    // Nettoyage lors de la déconnexion du composant
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
	console.log("Notifications mises à jour : ", notifications);
  }, [notifications]); // Ce useEffect s'exécute dès que notifications change
  
	const sendNotification = (targetId, message, userId, room_name = undefined) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
		  const notificationData = {
        type: "send_notification",
        target_id: targetId,
        sender_id: userId,
        message: message,
        room_name
		  };
		  console.log("Envoi de la notification : ", notificationData); // Ajout d'un log
		  socket.send(JSON.stringify(notificationData));
		}
	};

  const respondNotification = (targetId, response, senderId) => {
    console.log("BONSOIR");
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("BONSOIR2");
      const notificationData = {
        type: "receive_response",
        target_id: targetId,
        response: response,
        sender_id: senderId,
      };
      console.log("Envoi de la reponse : ", notificationData); // Ajout d'un log
      socket.send(JSON.stringify(notificationData));
    }
  };

  return { notifications, sendNotification, respondNotification };
}

