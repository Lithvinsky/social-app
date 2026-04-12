import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";
import { setIo } from "./ioRegistry.js";
import { registerSocketHandlers, socketAuthMiddleware } from "./handlers.js";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  setIo(io);

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    registerSocketHandlers(socket);
  });

  return io;
}
