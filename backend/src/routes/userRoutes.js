import express from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  forgotPassword,
  resetPassword,
  googleLogin,
} from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify", authenticateToken, verifyToken);

export default router;
