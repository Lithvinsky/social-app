import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 280 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    refreshTokenHash: { type: String, select: false, default: "" },
  },
  { timestamps: true }
);

userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
