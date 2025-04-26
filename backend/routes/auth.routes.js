import express from "express";
import { login, register, getAllEmails } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/all-emails", getAllEmails);

export default router;
