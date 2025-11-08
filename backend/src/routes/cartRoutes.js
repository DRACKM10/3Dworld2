import express from "express";
import {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem
} from "../controllers/cartController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// 🔒 Todas requieren autenticación
router.get("/", authenticateToken, getCart);
router.post("/", authenticateToken, addCartItem);
router.put("/:id", authenticateToken, updateCartItem);
router.delete("/:id", authenticateToken, deleteCartItem);

export default router;
