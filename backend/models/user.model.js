import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "buffet", "user"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

export const Users = mongoose.model("user", userSchema, "users");
