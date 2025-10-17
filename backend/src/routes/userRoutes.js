import express from "express";
import { registerUser, loginUser, verifyToken } from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", authenticateToken, verifyToken); // ← NUEVA RUTA

export default router;