import mongoose from "mongoose";

const buffetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, default: "-" },
  openingHours: { type: String, default: "-" },
  image: { type: String, default: "-" },
  tags: { type: [String], default: [] },
  email: { type: String, required: true },
  password: { type: String, required: true },
  inventory: [
    {
      name: { type: String, required: true },
      available: { type: Boolean, default: true },
      category: { type: String, default: "Egyéb" } 
    }
  ]
});

export default mongoose.model("Buffet", buffetSchema);