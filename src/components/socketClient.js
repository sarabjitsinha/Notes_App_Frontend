import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (socket) socket.disconnect();
  console.log("Token from socket connect",token)
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    transports: ["websocket"],
  });
  
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });
  
  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected)
    {
      socket.emit("logout")
      socket.disconnect();
    } 
  socket = null;
};



export const getSocket = () => socket;
