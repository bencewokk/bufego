import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orders.controller.js";

const router = express.Router();

// Allow order placement without authentication
router.post("/", createOrder);

// (Optional) If you want to secure the GET orders endpoint, you can keep authentication here.
// router.get("/", authenticate, getOrders);
// For public access to listing orders, remove authentication:
router.get("/", getOrders);

router.put("/:orderId/status", updateOrderStatus);

export default router;