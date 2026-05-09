import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { resolveApiOrigin } from "../utils/apiOrigin.js";

function resolveSocketUrl() {
  const socketEnv = import.meta.env.VITE_SOCKET_URL?.trim();
  if (socketEnv) {
    return socketEnv.replace(/\/$/, "");
  }
  const apiOrigin = resolveApiOrigin();
  if (apiOrigin) {
    return apiOrigin;
  }
  if (import.meta.env.DEV) {
    return "http://127.0.0.1:5050";
  }
  return "https://social-app-5sgz.onrender.com";
}

const url = resolveSocketUrl();

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
