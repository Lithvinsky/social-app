import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { sendOk } from "../utils/response.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { destroyCloudinaryByPublicId } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";
import { createNotification } from "../services/notificationService.js";
import {
  notifyFeedSubscribersOfAuthor,
  notifyPostWatchers,
} from "../services/feedSocketService.js";

function uploadsRootDir() {
  return path.join(process.cwd(), "uploads");
}

export const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.create({
    author: req.userId,
    content,
    media: [],
  });
  const populated = await post.populate({
    path: "author",
    select: "username avatar",
  });
  const j = populated.toJSON();
  j.likeCount = populated.likes?.length ?? 0;
  j.isLiked = false;
  await notifyFeedSubscribersOfAuthor(req.userId, {
    kind: "post_created",
    postId: String(populated._id),
    post: j,
  });
  sendOk(res, j, 201);
});

export const feed = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(String(req.query.limit), 10) || 10),
  );
  const me = await User.findById(req.userId).select("following");
  const ids = [...(me?.following || []), req.userId];
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Post.find({ author: { $in: ids } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "author", select: "username avatar" }),
    Post.countDocuments({ author: { $in: ids } }),
  ]);
  const uid = String(req.userId);
  const shaped = items.map((p) => {
    const j = p.toJSON();
    j.likeCount = p.likes?.length ?? 0;
    j.isLiked = p.likes?.some((id) => String(id) === uid) ?? false;
    return j;
  });
  sendOk(res, {
    items: shaped,
    page: Number(page),
    limit: Number(limit),
    total,
    hasMore: skip + items.length < total,
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: "author",
    select: "username avatar",
  });
  if (!post) throw new AppError("Post not found", 404);
  const j = post.toJSON();
  const uid = String(req.userId);
  j.likeCount = post.likes?.length ?? 0;
  j.isLiked = post.likes?.some((id) => String(id) === uid) ?? false;
  sendOk(res, j);
});

function unlinkLocalPostMedia(mediaList) {
  const root = uploadsRootDir();
  for (const m of mediaList || []) {
    const u = m?.url;
    if (typeof u !== "string" || !u.startsWith("/uploads/posts/")) continue;
    const name = path.basename(u);
    if (!name || name.includes("..") || name.includes("/")) continue;
    const abs = path.join(root, "posts", name);
    fs.promises.unlink(abs).catch(() => {});
  }
}

async function removeStoredPostMedia(mediaList) {
  for (const m of mediaList || []) {
    if (!m) continue;
    const pid = typeof m.publicId === "string" ? m.publicId.trim() : "";
    if (pid) {
      await destroyCloudinaryByPublicId(pid, m.resourceType).catch(() => {});
      continue;
    }
    unlinkLocalPostMedia([m]);
  }
}

export const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  if (String(post.author) !== String(req.userId)) {
    throw new AppError("Forbidden", 403);
  }
  await removeStoredPostMedia(post.media);
  await Promise.all([
    Comment.deleteMany({ post: postId }),
    Notification.deleteMany({ post: postId }),
  ]);
  await Post.deleteOne({ _id: postId });
  const authorId = post.author;
  await notifyFeedSubscribersOfAuthor(authorId, {
    kind: "post_deleted",
    postId: String(postId),
  });
  notifyPostWatchers(postId, { kind: "post_deleted" });
  sendOk(res, { ok: true });
});

export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError("Post not found", 404);
  const uid = req.userId;
  const idx = post.likes.findIndex((id) => String(id) === String(uid));
  if (idx >= 0) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(uid);
    if (String(post.author) !== String(uid)) {
      await createNotification({
        recipientId: post.author,
        type: "like",
        fromUserId: uid,
        postId: post._id,
      });
    }
  }
  await post.save();
  const likeCount = post.likes.length;
  await notifyFeedSubscribersOfAuthor(post.author, {
    kind: "post_updated",
    postId: String(post._id),
    likeCount,
  });
  notifyPostWatchers(post._id, { kind: "post_updated", likeCount });
  sendOk(res, {
    liked: idx < 0,
    likeCount,
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError("Post not found", 404);
  const comment = await Comment.create({
    post: post._id,
    author: req.userId,
    content,
  });
  post.commentCount = (post.commentCount || 0) + 1;
  await post.save();
  const populated = await comment.populate({
    path: "author",
    select: "username avatar",
  });
  if (String(post.author) !== String(req.userId)) {
    await createNotification({
      recipientId: post.author,
      type: "comment",
      fromUserId: req.userId,
      postId: post._id,
      meta: { snippet: content.slice(0, 80) },
    });
  }
  notifyPostWatchers(post._id, {
    kind: "comment_added",
    actorId: String(req.userId),
  });
  sendOk(res, populated, 201);
});

export const listComments = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(String(req.query.limit), 10) || 20),
  );
  const post = await Post.findById(req.params.id).select("_id");
  if (!post) throw new AppError("Post not found", 404);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Comment.find({ post: post._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "author", select: "username avatar" }),
    Comment.countDocuments({ post: post._id }),
  ]);
  sendOk(res, {
    items,
    page: Number(page),
    limit: Number(limit),
    total,
    hasMore: skip + items.length < total,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  if (String(comment.author) !== String(req.userId)) {
    throw new AppError("Forbidden", 403);
  }
  const postId = comment.post;
  const postMeta = await Post.findById(postId).select("author").lean();
  await Comment.deleteOne({ _id: commentId });
  await Post.findByIdAndUpdate(postId, {
    $inc: { commentCount: -1 },
  });
  if (postMeta) {
    notifyPostWatchers(postId, {
      kind: "comment_deleted",
      actorId: String(req.userId),
    });
  }
  sendOk(res, { ok: true });
});
