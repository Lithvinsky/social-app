import { Notification } from "../models/Notification.js";
import { getIo } from "../socket/ioRegistry.js";

export async function createNotification({
  recipientId,
  type,
  fromUserId,
  postId,
  conversationId,
  meta,
}) {
  if (String(recipientId) === String(fromUserId)) {
    return null;
  }
  const doc = await Notification.create({
    recipient: recipientId,
    type,
    fromUser: fromUserId,
    post: postId,
    conversation: conversationId,
    meta,
  });
  const populated = await doc.populate([
    { path: "fromUser", select: "username avatar" },
    { path: "post", select: "content" },
  ]);
  try {
    const io = getIo();
    io.to(`user:${recipientId}`).emit("notification:new", populated.toJSON());
  } catch {
    /* io not ready in tests */
  }
  return populated;
}
