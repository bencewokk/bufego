import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { isBuffet } from "../middleware/buffets.middleware.js";
import { getBuffets, getBuffetById, addBuffet, updateBuffet, deleteBuffet } from "../controllers/buffets.controller.js";

const router = express.Router();

router.get("/get", getBuffets);
router.get("/get/:id", getBuffetById);
router.post("/add", authenticate, addBuffet); // Removed isBuffet middleware for now
router.put("/update/:id", authenticate, updateBuffet); // Add this route
router.delete("/delete/:id", authenticate, deleteBuffet); // Add this route

export default router;