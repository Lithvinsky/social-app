import mongoose from "mongoose";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { Notification } from "../models/Notification.js";
import { createNotification } from "./notificationService.js";
import { getIo } from "../socket/ioRegistry.js";
import { AppError } from "../utils/errors.js";

function roomForConversation(id) {
  return `conv:${id}`;
}

export async function assertParticipant(conversationId, userId) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) return null;
  const ok = conv.participants.some((p) => String(p) === String(userId));
  return ok ? conv : null;
}

export async function createMessage({ conversationId, senderId, content }) {
  const conv = await assertParticipant(conversationId, senderId);
  if (!conv) {
    throw new AppError("Conversation not found", 404);
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content,
    readBy: [senderId],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content.slice(0, 200),
    lastMessageAt: new Date(),
    lastSender: senderId,
  });

  const populated = await message.populate([
    { path: "sender", select: "username avatar" },
  ]);

  const other = conv.participants.find((p) => String(p) !== String(senderId));
  if (other) {
    await createNotification({
      recipientId: other,
      type: "message",
      fromUserId: senderId,
      conversationId,
      meta: { preview: content.slice(0, 120) },
    });
  }

  try {
    const io = getIo();
    const payload = populated.toJSON();
    io.to(roomForConversation(conversationId)).emit("receive_message", payload);
  } catch {
    /* ignore */
  }

  return populated;
}

export async function markMessagesRead(conversationId, userId) {
  const conversationObjectId = new mongoose.Types.ObjectId(conversationId);

  await Promise.all([
    Message.updateMany(
      {
        conversation: conversationObjectId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    ),
    Notification.updateMany(
      {
        recipient: userId,
        type: "message",
        conversation: conversationObjectId,
        read: false,
      },
      { $set: { read: true } }
    ),
  ]);

  const conv = await Conversation.findById(conversationId);
  if (conv) {
    const m = conv.readAtByUser || new Map();
    m.set(String(userId), new Date());
    conv.readAtByUser = m;
    await conv.save();
  }

  try {
    const io = getIo();
    io.to(roomForConversation(conversationId)).emit("message_read", {
      conversationId,
      userId,
    });
  } catch {
    /* ignore */
  }
}
