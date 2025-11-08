import express from "express";
import {
  getProfile,
  updateUserProfile,
  uploadProfileImage
} from "../controllers/profileController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import multer from "multer";

const router = express.Router();

// ⚙️ Configuración de multer para manejar archivos temporales
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔒 Rutas protegidas
router.get("/:userId", authenticateToken, getProfile);
router.put("/", authenticateToken, updateUserProfile);
router.post(
  "/upload-image",
  authenticateToken,
  upload.single("image"),
  uploadProfileImage
);

export default router;
