import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from "../controllers/orderController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// 🔒 Todas protegidas
router.post("/", authenticateToken, createOrder);
router.get("/", authenticateToken, getOrders);
router.get("/:id", authenticateToken, getOrderById);
router.put("/:id", authenticateToken, updateOrder);
router.delete("/:id", authenticateToken, deleteOrder);

export default router;
