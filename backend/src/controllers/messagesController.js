import { Message } from "../models/Message.js";
import { AppError } from "../utils/errors.js";
import { sendOk } from "../utils/response.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { assertParticipant, createMessage } from "../services/messageService.js";

export const listMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = Math.max(1, Number.parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(String(req.query.limit), 10) || 30),
  );
  const conv = await assertParticipant(conversationId, req.userId);
  if (!conv) throw new AppError("Conversation not found", 404);

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "sender", select: "username avatar" }),
    Message.countDocuments({ conversation: conversationId }),
  ]);

  sendOk(res, {
    items: items.reverse(),
    page: Number(page),
    limit: Number(limit),
    total,
    hasMore: skip + items.length < total,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  const msg = await createMessage({
    conversationId,
    senderId: req.userId,
    content,
  });
  sendOk(res, msg, 201);
});
