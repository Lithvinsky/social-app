import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "message"],
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    read: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
