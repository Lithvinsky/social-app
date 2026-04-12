import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participantKey: { type: String, required: true, unique: true, index: true },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    lastSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    /** Map userId -> last read message time (for unread badge) */
    readAtByUser: {
      type: Map,
      of: Date,
      default: {},
    },
    typingByUser: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
