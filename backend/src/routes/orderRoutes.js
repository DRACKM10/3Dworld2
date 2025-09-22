import express from "express";
import authMiddleware from "../middleware/auth.js"; // Default import, sin llaves
import { createOrder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);

export default router;