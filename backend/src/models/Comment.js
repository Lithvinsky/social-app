import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });

export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
