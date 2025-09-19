import express from "express";
import { getCart, addCartItem, deleteCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/", addCartItem);
router.delete("/:id", deleteCartItem);

export default router;
