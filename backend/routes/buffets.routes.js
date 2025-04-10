import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { isBuffet } from "../middleware/buffets.middleware.js";
import { buffetLogin,getBuffets, getBuffetById, addBuffet, updateBuffet, deleteBuffet } from "../controllers/buffets.controller.js";


const router = express.Router();

router.get("/get", getBuffets);
router.get("/get/:id", getBuffetById);
router.post("/add", authenticate, addBuffet);
router.put("/update/:id", authenticate, updateBuffet); 
router.delete("/delete/:id", authenticate, deleteBuffet);

router.post("/login", buffetLogin);

export default router;