import express from "express";
import { getCart, addCartItem, deleteCartItem, updateCartItem } from "../controllers/cartController.js";
import authenticateToken from "../middleware/authenticateToken.js";
const router = express.Router();

router.get("/", authenticateToken(), getCart);
router.post("/", authenticateToken(), addCartItem);
router.put("/:id", authenticateToken(), updateCartItem);
router.delete("/:id", authenticateToken(), deleteCartItem);

export default router;