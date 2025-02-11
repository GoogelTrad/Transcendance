// import { useEffect, useState } from "react";

// const BASE_URL_NOTIF = "ws://localhost:8000/ws/notifications/";

// export default function useNotifications() {
// 	const [socket, setSocket] = useState();
// 	const [notifications, setNotifications] = useState([]);

// 	// useEffect(() => {
// 	// 	const ws = new WebSocket(BASE_URL_NOTIF);

// 	// 	ws.onopen = () => console.log("WebSocket connecté !");
		
// 	// 	ws.onmessage = (event) => {
// 	// 		console.log("📩 Message WebSocket brut :", event.data);
// 	// 		const data = JSON.parse(event.data);
// 	// 		console.log("je suis passe par la !");
// 	// 		if (data.type === "send_notification") {
// 	// 			console.log("je suis passe par la1 !");
// 	// 			setNotifications((prev) => [...prev, { id: data.id, message: data.message, sender_id: data.sender_id }]);
// 	// 		}
// 	// 		else if (data.type === "receive_response") {
// 	// 			console.log(`Notification ${data.notification_id} : ${data.response}`);
// 	// 			alert(`Réponse reçue : ${data.response}`);
// 	// 		}
// 	// 	};

// 	// 	ws.onclose = () => console.log("WebSocket déconnecté");

// 	// 	setSocket(ws);

// 	// 	return () => ws.close();
// 	// }, []);

// 	useEffect(() => {
// 		const ws = new WebSocket(BASE_URL_NOTIF);
	
// 		ws.onopen = () => {
// 			console.log("✅ WebSocket connecté !");
// 			setInterval(() => console.log("📡 WebSocket toujours actif..."), 5000);
// 		};
	
// 		ws.onclose = () => console.log("❌ WebSocket déconnecté !");
// 		ws.onerror = (error) => console.error("⚠️ Erreur WebSocket :", error);
	
// 		ws.onmessage = (event) => {
// 			console.log("📩 Message WebSocket brut :", event.data);
// 			const data = JSON.parse(event.data);
// 			if (data.type === "send_notification") {
// 				setNotifications((prev) => [...prev, { id: data.id, message: data.message, sender_id: data.sender_id }]);
// 			}
// 		};
	
// 		setSocket(ws);
// 		return () => ws.close();
// 	}, []);
	

// 	const sendNotification = (targetId, message, userId) => {
// 		console.log("📨 Tentative d'envoi de notification...", { targetId, message, userId });
// 		if (socket) {
// 			console.log("coucou2");
// 			socket.send(JSON.stringify({
// 				type: "send_notification",
// 				target_id: targetId,
// 				sender_id: userId,
// 				message: message,
// 			}));			
// 			console.log("coucou3");
// 		}
// 	};

// 	// const respondNotification = (notifId, response, senderId) => {
// 	// 	console.log("bonjour");
// 	// 	if (socket) {
// 	// 		socket.send(JSON.stringify({
// 	// 			type: "receive",
// 	// 			notification_id: notifId,
// 	// 			response: response,
// 	// 			sender_id: senderId,
// 	// 		}));			
// 	// 	}
// 	// };

// 	const respondNotification = (notifId, response, senderId) => {
// 		console.log("📤 Envoi de la réponse :", { notifId, response, senderId });
	
// 		if (socket) {
// 			socket.send(JSON.stringify({  // AJOUTER JSON.stringify !
// 				type: "receive_response",
// 				notification_id: notifId,
// 				response: response,
// 				sender_id: senderId,
// 			}));
// 		}
// 	};
	

// 	return { notifications, sendNotification, respondNotification };
// }

import { useEffect, useState } from "react";

const BASE_URL_NOTIF = "ws://localhost:8000/ws/notifications/";

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
          { target_id: data.targetId, message: data.message, sender_id: data.sender_id, response: null },
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
  

//   const sendNotification = (targetId, message, userId) => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       socket.send(
//         JSON.stringify({
//           type: "send_notification",
//           target_id: targetId,
//           sender_id: userId,
//           message: message,
//         })
//       );
//     }
//   };

	const sendNotification = (targetId, message, userId) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
		  const notificationData = {
        type: "send_notification",
        target_id: targetId,
        sender_id: userId,
        message: message,
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

