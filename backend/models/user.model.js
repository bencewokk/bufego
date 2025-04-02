import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "customer", "user"] },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  status: {
    type: String,
    enum: ["active", "banned", "inactive"],
    default: "active",
  },
  profilePicture: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
});

export const Users = mongoose.model("user", userSchema, "users");
