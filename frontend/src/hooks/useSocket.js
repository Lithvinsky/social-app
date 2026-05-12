import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { resolveApiOrigin } from "../utils/apiOrigin.js";

/** Engine.IO mounts at `/socket.io` on the API host — strip accidental `/api` path from env. */
function originForSocketIo(url) {
  const trimmed = String(url || "").trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.pathname === "/api" || u.pathname.startsWith("/api/")) {
      u.pathname = "";
      return u.origin;
    }
    return trimmed;
  } catch {
    return trimmed.replace(/\/api\/?$/, "");
  }
}

function resolveSocketUrl() {
  const socketEnv = import.meta.env.VITE_SOCKET_URL?.trim();
  if (socketEnv) {
    return originForSocketIo(socketEnv);
  }
  const apiOrigin = resolveApiOrigin();
  if (apiOrigin) {
    return originForSocketIo(apiOrigin);
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
