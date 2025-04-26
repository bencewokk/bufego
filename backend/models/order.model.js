import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    items: [{ type: String, required: true }],
    status: {
        type: String,
        enum: ["pending", "preparing", "ready", "completed"],
        default: "pending"
    },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    pickupCode: { type: String, required: true },
    pickupTime: { type: Date, required: true },
    buffetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buffet', required: true }
});

export default mongoose.model("Order", orderSchema);