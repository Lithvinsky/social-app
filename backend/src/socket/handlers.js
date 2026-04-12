import mongoose from "mongoose";
import { verifyAccessToken } from "../utils/jwt.js";
import { assertParticipant, createMessage, markMessagesRead } from "../services/messageService.js";
function roomForConversation(id) {
  return `conv:${id}`;
}

export function registerSocketHandlers(socket) {
  const userId = socket.userId;

  socket.on("join_conversation", async (payload, cb) => {
    try {
      const conversationId = typeof payload === "string" ? payload : payload?.conversationId;
      if (!conversationId) {
        cb?.({ ok: false, error: "conversationId required" });
        return;
      }
      const conv = await assertParticipant(conversationId, userId);
      if (!conv) {
        cb?.({ ok: false, error: "Forbidden" });
        return;
      }
      socket.join(roomForConversation(conversationId));
      await markMessagesRead(conversationId, userId);
      cb?.({ ok: true });
    } catch (e) {
      cb?.({ ok: false, error: e.message });
    }
  });

  socket.on("leave_conversation", (payload, cb) => {
    const conversationId =
      typeof payload === "string" ? payload : payload?.conversationId;
    if (!conversationId) {
      cb?.({ ok: false, error: "conversationId required" });
      return;
    }
    socket.leave(roomForConversation(conversationId));
    cb?.({ ok: true });
  });

  socket.on("send_message", async (payload, cb) => {
    try {
      const { conversationId, content } = payload || {};
      if (!conversationId || !content?.trim()) {
        cb?.({ ok: false, error: "Invalid payload" });
        return;
      }
      const msg = await createMessage({
        conversationId,
        senderId: userId,
        content: content.trim(),
      });
      cb?.({ ok: true, message: msg });
    } catch (e) {
      const status = e.statusCode || 500;
      cb?.({ ok: false, error: e.message, status });
    }
  });

  socket.on("typing", async (payload) => {
    const conversationId = typeof payload === "string" ? payload : payload?.conversationId;
    const isTyping =
      typeof payload === "object" && payload ? Boolean(payload.isTyping) : true;
    if (!conversationId) return;
    const conv = await assertParticipant(conversationId, userId);
    if (!conv) return;
    socket.to(roomForConversation(conversationId)).emit("typing", {
      conversationId,
      userId,
      isTyping,
    });
  });

  socket.on("message_read", async (payload, cb) => {
    try {
      const conversationId = typeof payload === "string" ? payload : payload?.conversationId;
      if (!conversationId) {
        cb?.({ ok: false });
        return;
      }
      const conv = await assertParticipant(conversationId, userId);
      if (!conv) {
        cb?.({ ok: false });
        return;
      }
      await markMessagesRead(conversationId, userId);
      cb?.({ ok: true });
    } catch {
      cb?.({ ok: false });
    }
  });

  socket.on("watch_post", (payload, cb) => {
    const postId =
      typeof payload === "object" && payload != null ? payload.postId : payload;
    if (!postId || !mongoose.isValidObjectId(String(postId))) {
      cb?.({ ok: false, error: "postId required" });
      return;
    }
    socket.join(`post:${postId}`);
    cb?.({ ok: true });
  });

  socket.on("unwatch_post", (payload, cb) => {
    const postId =
      typeof payload === "object" && payload != null ? payload.postId : payload;
    if (postId && mongoose.isValidObjectId(String(postId))) {
      socket.leave(`post:${postId}`);
    }
    cb?.({ ok: true });
  });
}

/** Dev-only: allow handshake token from auth object */
export function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    const payload = verifyAccessToken(token);
    if (payload.typ !== "access") {
      return next(new Error("Unauthorized"));
    }
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
