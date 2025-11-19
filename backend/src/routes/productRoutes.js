import express from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadSTLFile,
  updateProductSTLFile, // ✅ NUEVA IMPORTACIÓN
  upload,
} from "../controllers/productController.js";
import authenticateToken, { authorize } from "../middleware/authenticateToken.js";

const router = express.Router();

// 🟢 Rutas públicas
router.get("/", getProducts);

// 🧩 Rutas específicas ANTES de /:id
router.post(
  "/upload-stl", 
  authenticateToken,
  authorize("admin"), 
  upload.single("stl"), 
  uploadSTLFile
);

// 🔧 NUEVA RUTA: Actualizar STL de producto existente
router.put("/:id/stl-file", authenticateToken, authorize("admin"), updateProductSTLFile);

// 🔒 Rutas con parámetros AL FINAL
router.get("/:id", getProduct);
router.post("/", authenticateToken, authorize("admin"), upload.single("image"), addProduct);
router.put("/:id", authenticateToken, authorize("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticateToken, authorize("admin"), deleteProduct);

export default router;