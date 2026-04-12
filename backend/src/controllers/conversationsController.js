import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { sendOk } from "../utils/response.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { makeParticipantKey } from "../utils/conversationKey.js";

/** Messages from others the user has not marked read (for nav badge). */
export const unreadMessageTotal = asyncHandler(async (req, res) => {
  const uid = new mongoose.Types.ObjectId(req.userId);
  const convs = await Conversation.find({ participants: uid }).select("_id").lean();
  const ids = convs.map((c) => c._id);
  if (ids.length === 0) {
    sendOk(res, { total: 0 });
    return;
  }
  const total = await Message.countDocuments({
    conversation: { $in: ids },
    sender: { $ne: uid },
    readBy: { $nin: [uid] },
  });
  sendOk(res, { total });
});

export const listConversations = asyncHandler(async (req, res) => {
  const uid = req.userId;
  const uidObj = new mongoose.Types.ObjectId(uid);
  const items = await Conversation.find({ participants: uid })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "username avatar")
    .populate("lastSender", "username")
    .lean();

  const convIds = items.map((c) => c._id);
  const unreadMap = new Map();
  if (convIds.length > 0) {
    const rows = await Message.aggregate([
      {
        $match: {
          conversation: { $in: convIds },
          sender: { $ne: uidObj },
          readBy: { $nin: [uidObj] },
        },
      },
      { $group: { _id: "$conversation", count: { $sum: 1 } } },
    ]);
    for (const r of rows) {
      unreadMap.set(String(r._id), r.count);
    }
  }

  const shaped = items.map((c) => {
    const other = c.participants.find((p) => String(p._id) !== String(uid));
    return {
      ...c,
      otherUser: other || null,
      unreadCount: unreadMap.get(String(c._id)) || 0,
    };
  });

  sendOk(res, shaped);
});

export const createOrGetConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const meId = req.userId;
  if (String(meId) === String(participantId)) {
    throw new AppError("Invalid participant", 400);
  }
  const other = await User.findById(participantId);
  if (!other) throw new AppError("User not found", 404);

  const participantKey = makeParticipantKey(meId, participantId);
  let conv = await Conversation.findOne({ participantKey });
  let created = false;
  if (!conv) {
    conv = await Conversation.create({
      participantKey,
      participants: [meId, participantId],
    });
    created = true;
  }
  const populated = await conv.populate([
    { path: "participants", select: "username avatar" },
  ]);
  sendOk(res, populated, created ? 201 : 200);
});
