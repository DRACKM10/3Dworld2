import express from "express";
import authMiddleware from "../middleware/authenticateToken.js";
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrder, 
  deleteOrder 
} from "../controllers/orderController.js";

const router = express.Router();

// Crear orden desde carrito (requiere autenticación)
router.post("/", authMiddleware, createOrder);

// Obtener órdenes del usuario autenticado
router.get("/", authMiddleware, getOrders);

// Obtener orden específica por ID
router.get("/:id", authMiddleware, getOrderById);

// Actualizar orden
router.put("/:id", authMiddleware, updateOrder);

// Eliminar orden
router.delete("/:id", authMiddleware, deleteOrder);

export default router;