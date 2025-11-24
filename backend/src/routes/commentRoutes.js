// routes/commentRoutes.js
import express from "express";
import {
  getProductComments,
  addComment
} from "../controllers/commentController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

// 🟢 Ruta pública - Obtener comentarios
router.get("/product/:productId", getProductComments);

// 🔐 Ruta protegida - Crear comentario
router.post("/product/:productId", authenticateToken, addComment);

export default router;