/* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const sock = io("http://localhost:5000", {
//       auth: {
//         token: localStorage.getItem("token") 
//       }
//     });

//     setSocket(sock);
//     return () => sock.disconnect();
//   }, []);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);

// import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token"); 
    
//     const socketInstance = io(import.meta.env.VITE_API_URL, {
//       auth:{
//         token,
//       }
//     },[]);
//     console.log("connecting to socket",localStorage.getItem("token"))
//     setSocket(socketInstance);

//     return () => socketInstance.disconnect();
//   }, []);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);


import { createContext, useContext, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { connectSocket, disconnectSocket, getSocket } from "../components/socketClient";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const newSocket = connectSocket(token);
      setSocket(newSocket);
    }

    return () => disconnectSocket();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
