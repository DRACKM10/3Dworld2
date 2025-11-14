import express from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadSTLFile,
  upload,
} from "../controllers/productController.js";
import authenticateToken, { authorize } from "../middleware/authenticateToken.js";
// ✅ Importar como default y named export

const router = express.Router();

// 🟢 Rutas públicas
router.get("/", getProducts);

// 🧩 Rutas específicas ANTES de /:id
router.post(
  "/upload-stl", 
  authenticateToken,  // ✅ Ya no necesita ()
  authorize("admin"), 
  upload.single("stl"), 
  uploadSTLFile
);

// 🔒 Rutas con parámetros AL FINAL
router.get("/:id", getProduct);
router.post("/", authenticateToken, authorize("admin"), upload.single("image"), addProduct);
router.put("/:id", authenticateToken, authorize("admin"), upload.single("image"), updateProduct);
router.delete("/:id", authenticateToken, authorize("admin"), deleteProduct);

export default router;