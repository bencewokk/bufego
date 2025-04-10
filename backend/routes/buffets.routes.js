import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { isBuffet } from "../middleware/buffets.middleware.js";
import { 
  buffetLogin, getBuffets, getBuffetById, addBuffet, updateBuffet, deleteBuffet,
  getBuffetInventory, updateBuffetInventory, addInventoryItem, removeInventoryItem, toggleItemAvailability
} from "../controllers/buffets.controller.js";

const router = express.Router();

router.get("/get", getBuffets);
router.get("/get/:id", getBuffetById);
router.post("/add", authenticate, addBuffet);
router.put("/update/:id", authenticate, updateBuffet); 
router.delete("/delete/:id", authenticate, deleteBuffet);

router.post("/login", buffetLogin);

// Inventory routes
router.get("/inventory/:id", getBuffetInventory);
router.put("/inventory/:id", authenticate, isBuffet, updateBuffetInventory);
router.post("/inventory/:id/add", authenticate, isBuffet, addInventoryItem);
router.delete("/inventory/:id/remove/:itemId", authenticate, isBuffet, removeInventoryItem);
router.put("/inventory/:id/toggle/:itemId", authenticate, isBuffet, toggleItemAvailability);

export default router;