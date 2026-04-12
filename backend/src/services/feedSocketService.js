import { User } from "../models/User.js";
import { getIo } from "../socket/ioRegistry.js";

/** Users who follow `authorId` plus the author see that author's posts in the home feed. */
export async function notifyFeedSubscribersOfAuthor(authorId, payload) {
  try {
    const io = getIo();
    if (!io || !authorId) return;
    const idStr = String(authorId);
    const followers = await User.find({ following: authorId }).select("_id").lean();
    const recipients = new Set([idStr, ...followers.map((f) => String(f._id))]);
    for (const uid of recipients) {
      io.to(`user:${uid}`).emit("feed:update", payload);
    }
  } catch {
    /* io not ready in tests */
  }
}

/** Clients join room `post:{id}` while a post is visible (feed card or post page). */
export function notifyPostWatchers(postId, payload) {
  try {
    const io = getIo();
    if (!io || !postId) return;
    const id = String(postId);
    io.to(`post:${id}`).emit("post:update", { postId: id, ...payload });
  } catch {
    /* ignore */
  }
}
