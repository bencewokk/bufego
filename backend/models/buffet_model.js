import mongoose from "mongoose";

const buffetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  openingHours: { type: String, required: true },
  image: { type: String, required: true },
  tags: { type: [String], default: [] },
});

// Convert MongoDB's _id to id in JSON responses
buffetSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
buffetSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v; // Remove MongoDB versioning field
    return ret;
  },
});

export default mongoose.model("Buffet", buffetSchema);