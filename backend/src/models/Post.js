import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video"], required: true },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, default: "", maxlength: 8000 },
    media: [mediaSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
