import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

// FIXED: removed hardcoded URL
const url =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, "") ||
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://social-app-5sgz.onrender.com";

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
