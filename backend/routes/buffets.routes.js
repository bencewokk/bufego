import express from "express";
import { getBuffets, getBuffetById } from "../controllers/buffets.controller.js";

const router = express.Router();

router.get("/get", getBuffets);
router.get("/get/:id", getBuffetById);

export default router;