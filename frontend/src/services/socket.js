// src/services/socket.js
import { io } from "socket.io-client";

const API_BASE_URL = "http://192.168.0.74:8000";

const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

let socketInstance = null;

export const connectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    console.log(
      "socket.js: Socket ya conectado, retornando instancia existente."
    ); // Log para depuración
    return socketInstance;
  }

  const token = getAuthToken();
  if (!token) {
    console.warn(
      "socket.js: No authentication token found. Socket connection may fail or be rejected."
    );
  }

  console.log(
    `socket.js: Intentando conectar a ${API_BASE_URL} con path /socket.io/`
  ); // Log con la URL y path
  socketInstance = io(API_BASE_URL, {
    query: {
      token: token,
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    autoConnect: true,
    // Añade logs de eventos específicos del cliente para depuración
    reconnectionAttempts: 5, // Limitar intentos para no saturar logs
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
  });

  // Logs de eventos de conexión/desconexión/errores
  socketInstance.on("connect", () => {
    console.log(
      "socket.js: 🎉 Socket conectado exitosamente:",
      socketInstance.id
    );
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("socket.js: 💔 Socket desconectado. Razón:", reason); // Añadir razón
    // Aquí puedes añadir más lógica de depuración, como un timestamp o stack trace
  });

  socketInstance.on("connect_error", (err) => {
    console.error("socket.js: 🚨 Error de conexión del socket:", err); // Mostrar todo el objeto de error
    if (err.message) {
      console.error("socket.js: Mensaje de error detallado:", err.message);
    }
    if (err.data) {
      console.error("socket.js: Datos de error:", err.data);
    }
  });

  socketInstance.on("new_message", (message) => {
    console.log("socket.js: 📩 Mensaje nuevo recibido:", message);
    // Asegúrate de que este log aparece en la consola del navegador del RECEPTOR
    // y que el 'message' tiene el formato esperado.
  });

  // Otros eventos de Socket.IO que podrías tener:
  socketInstance.on("error", (err) => {
    console.error("socket.js: ❌ Error del socket:", err);
  });
  socketInstance.on("connect_timeout", (timeout) => {
    console.error("socket.js: ⌛ Timeout de conexión:", timeout);
  });
  return socketInstance;
};

export const getSocket = () => {
  if (!socketInstance || !socketInstance.connected) {
    return connectSocket();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
