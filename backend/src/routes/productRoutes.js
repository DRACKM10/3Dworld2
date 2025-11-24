// routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadSTLFile,
  updateProductSTLFile,
  upload,
  getMyProducts,
  restoreProduct
} from "../controllers/productController.js";
import authenticateToken, { authorize } from "../middleware/authenticateToken.js";

const router = express.Router();

// 🟢 Rutas públicas
router.get("/", getProducts);
router.get("/:id", getProduct);

// 🔐 Rutas protegidas - Usuarios autenticados
router.get("/my-products", authenticateToken, getMyProducts);
router.post("/", authenticateToken, upload.single("image"), addProduct);

// 🔧 Rutas para archivos STL
router.post(
  "/upload-stl", 
  authenticateToken,
  authorize("admin", "client"),
  upload.single("stl"), 
  uploadSTLFile
);

// 🛠️ Rutas de administración (solo admin)
router.put("/:id", authenticateToken, authorize("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticateToken, authorize("admin"), deleteProduct);
router.put("/:id/stl-file", authenticateToken, authorize(["admin", "client"]), updateProductSTLFile);
router.patch("/:id/restore", authenticateToken, authorize("admin"), restoreProduct);

export default router;