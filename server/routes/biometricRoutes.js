import express from "express";
import {
  enrollFace,
  getBiometricStatus,
  verifyFace,
  resetFace,
} from "../controllers/biometricController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/status", verifyToken, getBiometricStatus);
router.post("/enroll", verifyToken, enrollFace);
router.post("/verify", verifyToken, verifyFace);
router.post("/reset", verifyToken, resetFace);

export default router;
