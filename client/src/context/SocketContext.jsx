import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../utils/constants.js";
import { useAuth } from "../hooks/useAuth.js";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }
    const client = io(API_URL, { withCredentials: true });
    setSocket(client);
    return () => {
      client.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
