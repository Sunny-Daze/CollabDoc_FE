import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("socket context not found");
  return context;
};

export default useSocket;