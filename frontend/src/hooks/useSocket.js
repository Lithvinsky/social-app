import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const url =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, "") ||
  "http://localhost:5050";

export function useSocket() {
  const token = useSelector((s) => s.auth.accessToken);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return undefined;
    }
    const s = io(url, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    return () => {
      s.removeAllListeners();
      s.close();
    };
  }, [token]);

  return socket;
}
