import { createContext, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_WS_BASE_URL;
console.log(SOCKET_URL);

interface SocketContextType {
  socket: Socket | null;
  connectSocket: () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectSocket = () => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("connected to socket");
    });

    setSocket(newSocket);
  };

  return (
    <SocketContext.Provider value={{ socket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
