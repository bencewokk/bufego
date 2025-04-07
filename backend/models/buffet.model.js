import mongoose from "mongoose";

const buffetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: "-" },
  openingHours: { type: String, default: "-" },
  image: { type: String, default: "-" },
  tags: { type: [String], default: [] },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model("Buffet", buffetSchema);