import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/errors.js";
import { sendOk } from "../utils/response.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10),
  );
  const skip = (page - 1) * limit;
  const filter = { recipient: req.userId };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "fromUser", select: "username avatar" })
      .populate({ path: "post", select: "content" })
      .populate({ path: "conversation", select: "_id" }),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, read: false }),
  ]);
  sendOk(res, {
    items,
    page: Number(page),
    limit: Number(limit),
    total,
    unreadCount: unread,
    hasMore: skip + items.length < total,
  });
});

export const markRead = asyncHandler(async (req, res) => {
  const { notificationIds, markAll } = req.body;
  const filter = { recipient: req.userId };
  if (!markAll && notificationIds?.length) {
    filter._id = { $in: notificationIds };
  } else if (!markAll) {
    throw new AppError("notificationIds or markAll required", 400);
  }
  const result = await Notification.updateMany(filter, { $set: { read: true } });
  sendOk(res, { modified: result.modifiedCount });
});
