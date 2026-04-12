import mongoose from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { sendOk } from "../utils/response.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadBuffer, isCloudinaryReady } from "../utils/cloudinary.js";
import { createNotification } from "../services/notificationService.js";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive username substring; excludes self; marks if already followed. */
export const searchUsers = asyncHandler(async (req, res) => {
  const meId = req.userId;
  const raw = String(req.query.q || "").trim().toLowerCase();
  const safe = escapeRegex(raw);
  const me = await User.findById(meId).select("following");
  if (!me) throw new AppError("Unauthorized", 401);
  const followingSet = new Set((me.following || []).map((id) => String(id)));

  const users = await User.find({
    _id: { $ne: meId },
    username: new RegExp(safe, "i"),
  })
    .select("username avatar bio")
    .limit(20)
    .lean();

  const items = users.map((u) => ({
    ...u,
    isFollowing: followingSet.has(String(u._id)),
  }));
  sendOk(res, items);
});

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id)
    .populate("followers", "username avatar")
    .populate("following", "username avatar");
  if (!user) throw new AppError("User not found", 404);
  const json = user.toJSON();
  json.followerCount = user.followers?.length ?? 0;
  json.followingCount = user.following?.length ?? 0;
  if (req.userId && String(req.userId) !== String(id)) {
    const me = await User.findById(req.userId).select("following");
    json.isFollowing = me?.following?.some((f) => String(f) === String(id)) ?? false;
  }
  sendOk(res, json);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (String(req.userId) !== String(id)) {
    throw new AppError("Forbidden", 403);
  }
  const { bio, avatar } = req.body;
  const update = {};
  if (bio !== undefined) update.bio = bio;
  if (avatar !== undefined) update.avatar = avatar;

  if (req.file?.buffer && isCloudinaryReady()) {
    const result = await uploadBuffer(req.file.buffer, {
      folder: "social-app/avatars",
      resourceType: "image",
    });
    update.avatar = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) throw new AppError("User not found", 404);
  sendOk(res, user.toJSON());
});

export const follow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const meId = req.userId;
  if (String(meId) === String(targetId)) {
    throw new AppError("Cannot follow yourself", 400);
  }
  const [me, target] = await Promise.all([
    User.findById(meId),
    User.findById(targetId),
  ]);
  if (!target) throw new AppError("User not found", 404);
  if (!me) throw new AppError("Unauthorized", 401);
  const already = me.following.some((f) => String(f) === String(targetId));
  if (already) {
    sendOk(res, { following: true });
    return;
  }
  await User.findByIdAndUpdate(meId, { $addToSet: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: meId } });

  await createNotification({
    recipientId: targetId,
    type: "follow",
    fromUserId: meId,
  });

  sendOk(res, { following: true });
});

export const unfollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const meId = req.userId;
  await User.findByIdAndUpdate(meId, { $pull: { following: targetId } });
  await User.findByIdAndUpdate(targetId, { $pull: { followers: meId } });
  sendOk(res, { following: false });
});

export const suggestions = asyncHandler(async (req, res) => {
  const meId = new mongoose.Types.ObjectId(req.userId);
  const me = await User.findById(meId).select("following");
  if (!me) throw new AppError("Unauthorized", 401);
  const myFollowing = me.following || [];
  if (myFollowing.length === 0) {
    const popular = await User.find({
      _id: { $ne: meId },
    })
      .select("username avatar bio followers")
      .limit(15);
    sendOk(res, popular);
    return;
  }

  const rows = await User.aggregate([
    { $match: { _id: { $in: myFollowing } } },
    { $unwind: "$following" },
    {
      $match: {
        following: {
          $nin: [...myFollowing, meId],
        },
      },
    },
    { $group: { _id: "$following", score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: "$user._id",
        username: "$user.username",
        avatar: "$user.avatar",
        bio: "$user.bio",
        score: 1,
      },
    },
  ]);

  sendOk(res, rows);
});
