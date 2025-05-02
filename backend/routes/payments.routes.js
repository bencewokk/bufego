// backend/routes/payments.routes.js
import express from "express";
import { createPaymentIntent, getPaymentIntent, refreshPaymentIntent, createCheckoutSession } from "../controllers/payments.controller.js";
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.get("/payment-intent/:paymentIntentId", getPaymentIntent);
router.post("/refresh-payment-intent", refreshPaymentIntent);
router.post("/create-checkout-session", createCheckoutSession);

export default router;