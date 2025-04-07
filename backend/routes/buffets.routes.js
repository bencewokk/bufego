import express from "express";
import { getBuffets, getBuffetById, addBuffet } from "../controllers/buffets.controller.js";

const router = express.Router();

router.get("/get", getBuffets);
router.get("/get/:id", getBuffetById);
router.post("/add", addBuffet);

export default router;