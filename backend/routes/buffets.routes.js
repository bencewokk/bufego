import express from "express";
import Buffet from "../models/buffet.model.js";
import { authenticate } from "../middleware/auth.middleware.js"; // Changed to named import

const router = express.Router();

// POST: Create a new buffet (protected route)
router.post("/", authenticate, async (req, res) => { // Use authenticate instead of authMiddleware
  try {
    const newBuffet = new Buffet(req.body);
    await newBuffet.save();
    res.status(201).json(newBuffet);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// GET: Fetch all buffets (protected route)
router.get("/", async (req, res) => { // Use authenticate instead of authMiddleware
  try {
    const buffets = await Buffet.find();
    res.status(200).json(buffets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update a buffet by ID (protected route)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const updatedBuffet = await Buffet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedBuffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    res.status(200).json(updatedBuffet);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Remove a buffet by ID (protected route)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const deletedBuffet = await Buffet.findByIdAndDelete(req.params.id);
    
    if (!deletedBuffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    
    res.status(200).json({ message: "Buffet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;