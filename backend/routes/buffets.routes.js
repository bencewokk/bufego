import express from "express";
import { getBuffets, getBuffetById, addBuffet } from "../controllers/buffets.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { isBuffet } from "../middleware/buffets.middleware.js";


const router = express.Router();

router.get("/get", getBuffets);
router.get("/get/:id", getBuffetById);
router.post("/add", authenticate, isBuffet, addBuffet);

export default router;