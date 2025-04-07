import mongoose from "mongoose";

const buffetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  openingHours: { type: String, required: true },
  image: { type: String, required: true },
  tags: { type: [String], default: [] },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model("Buffet", buffetSchema);