import express from "express";
import { createOrder, getOrders, updateOrderStatus, getOrderByPickupCode, getMyOrders, getBuffetOrders } from "../controllers/orders.controller.js";
import { optionalAuthenticate, authenticate, requireBuffet } from "../middleware/auth.middleware.js";

const router = express.Router();

// Allow guest or authenticated order placement: req.user set if token present
router.post("/", optionalAuthenticate, createOrder);

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