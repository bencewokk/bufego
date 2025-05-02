import express from "express";
import { createOrder, getOrders, updateOrderStatus, getOrderByPickupCode, getMyOrders, getBuffetOrders } from "../controllers/orders.controller.js";
import { optionalAuthenticate, authenticate, requireBuffet } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuthenticate, createOrder);
router.get("/", getOrders);
router.put("/:orderId/status", updateOrderStatus);
router.get("/pickup/:pickupCode", getOrderByPickupCode);
router.get("/my", authenticate, getMyOrders);
router.get("/buffet", authenticate, requireBuffet, getBuffetOrders);

export default router;