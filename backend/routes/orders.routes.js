import express from "express";
import { createOrder, getOrders, updateOrderStatus, getOrderByPickupCode, getMyOrders, getBuffetOrders } from "../controllers/orders.controller.js";
import { authenticate, requireBuffet } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect order placement with authentication
router.post("/", authenticate, createOrder);

// (Optional) If you want to secure the GET orders endpoint, you can keep authentication here.
// router.get("/", authenticate, getOrders);
// For public access to listing orders, remove authentication:
router.get("/", getOrders);

router.put("/:orderId/status", updateOrderStatus);

// New route to get order by pickup code
router.get("/pickup/:pickupCode", getOrderByPickupCode);

// Route to get authenticated user's orders
router.get("/my", authenticate, getMyOrders);

// Route to get authenticated buffet's orders
router.get("/buffet", authenticate, requireBuffet, getBuffetOrders);

export default router;