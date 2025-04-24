// backend/routes/payments.routes.js
import express from "express";
import { createPaymentIntent } from "../controllers/payments.controller.js";
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);

export default router;