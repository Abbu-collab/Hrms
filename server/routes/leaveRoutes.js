import express from "express";
import {
  applyLeave,
  getLeaveHistory,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} from "../controllers/leaveController.js";

import {
  verifyToken,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Any authenticated user can apply and view their own history
router.post("/apply", verifyToken, applyLeave);
router.get("/history", verifyToken, getLeaveHistory);

// Admin/HR management: all leaves for review
router.get(
  "/admin/all",
  verifyToken,
  authorizeRoles("Admin", "HR"),
  getAllLeaves
);

// HR/Admin approval and rejection
router.put(
  "/approve/:id",
  verifyToken,
  authorizeRoles("Admin", "HR"),
  approveLeave
);

router.put(
  "/reject/:id",
  verifyToken,
  authorizeRoles("Admin", "HR"),
  rejectLeave
);

// Any authenticated user can cancel their own leave (controller enforces ownership)
router.delete("/:id", verifyToken, cancelLeave);

export default router;