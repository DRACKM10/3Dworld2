import express from "express";
import { getProfile, updateUserProfile, uploadProfileImage, upload } from "../controllers/profileController.js";

const router = express.Router();

router.get("/:userId", getProfile);
router.put("/", updateUserProfile);
router.post("/upload-image", upload.single('image'), uploadProfileImage);

export default router;
