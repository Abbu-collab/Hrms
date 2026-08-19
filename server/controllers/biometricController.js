import jwt from "jsonwebtoken";
import Biometric from "../models/Biometric.js";

// Calculate Euclidean distance between 2 descriptor vectors
const euclideanDistance = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

// Configurable threshold (0.45 is default for face-api descriptors, lower = stricter)
const FACE_MATCH_THRESHOLD = process.env.FACE_MATCH_THRESHOLD
  ? parseFloat(process.env.FACE_MATCH_THRESHOLD)
  : 0.45;

// In-memory rate limiting map for verification attempts (10 attempts per 2 min)
const attemptsMap = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userAttempts = attemptsMap.get(String(userId)) || [];
  const recentAttempts = userAttempts.filter((t) => now - t < 120000);

  if (recentAttempts.length >= 10) {
    return false;
  }

  recentAttempts.push(now);
  attemptsMap.set(String(userId), recentAttempts);
  return true;
};

// ENROLL FACE
export const enrollFace = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user." });
    }

    const { faceEmbedding } = req.body;

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid biometric sample data. Must provide a valid face descriptor.",
      });
    }

    let biometric = await Biometric.findOne({ userId });

    if (biometric) {
      biometric.faceEmbedding = faceEmbedding;
      biometric.isActive = true;
      biometric.enrolledAt = new Date();
      await biometric.save();
    } else {
      biometric = await Biometric.create({
        userId,
        faceEmbedding,
        isActive: true,
        enrolledAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Face enrolled successfully.",
      data: {
        isRegistered: true,
        enrolledAt: biometric.enrolledAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to enroll face biometric.",
    });
  }
};

// GET BIOMETRIC STATUS
export const getBiometricStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user." });
    }

    const biometric = await Biometric.findOne({ userId, isActive: true });

    return res.status(200).json({
      success: true,
      data: {
        isRegistered: !!biometric,
        enrolledAt: biometric?.enrolledAt || null,
        lastVerifiedAt: biometric?.lastVerifiedAt || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve biometric status.",
    });
  }
};

// VERIFY FACE & ISSUE SHORT-LIVED TOKEN
export const verifyFace = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user." });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        message: "Too many verification attempts. Please wait 2 minutes before trying again.",
      });
    }

    const { faceEmbedding } = req.body;

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid live face descriptor submitted.",
      });
    }

    const biometric = await Biometric.findOne({ userId, isActive: true }).select("+faceEmbedding");

    if (!biometric || !biometric.faceEmbedding) {
      return res.status(404).json({
        success: false,
        message: "Your face is not registered. Please register your face first.",
      });
    }

    const distance = euclideanDistance(faceEmbedding, biometric.faceEmbedding);

    if (distance > FACE_MATCH_THRESHOLD) {
      return res.status(400).json({
        success: false,
        message: "Face does not match your registered profile.",
      });
    }

    biometric.lastVerifiedAt = new Date();
    await biometric.save();

    // Issue short-lived 120-second verification token
    const biometricToken = jwt.sign(
      {
        userId: String(userId),
        purpose: "biometric_attendance",
        verifiedAt: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "2m" }
    );

    return res.status(200).json({
      success: true,
      message: "Face verification successful.",
      biometricToken,
      expiresInSeconds: 120,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Face verification failed.",
    });
  }
};

// RESET BIOMETRIC
export const resetFace = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    const currentUserRole = req.user?.role;

    let targetUserId = currentUserId;

    if (req.body.targetEmployeeId && (currentUserRole === "Admin" || currentUserRole === "HR" || currentUserRole === "HR Manager")) {
      targetUserId = req.body.targetEmployeeId;
    }

    const result = await Biometric.deleteOne({ userId: targetUserId });

    return res.status(200).json({
      success: true,
      message: "Face registration reset successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset face biometric.",
    });
  }
};
