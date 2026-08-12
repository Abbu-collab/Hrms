import Leave from "../models/Leave.js";
import {
  deductLeaveBalance,
  restoreLeaveBalance,
  calculateLeaveDays,
} from "./leaveBalanceService.js";

// Apply Leave
export const applyLeaveService = async (leaveData) => {
    const leave = await Leave.create(leaveData);
    return leave;
};

// Get Own Leave History — returns ONLY the logged-in user's own leaves
// regardless of role (Employee, HR, or Admin all see only their own leaves here)
export const getLeaveHistoryService = async (userId) => {
  return await Leave.find({ employee: userId })
    .populate("employee", "name email role")
    .sort({ createdAt: -1 });
};

// Admin Management — returns ALL employees' leaves for review/approval
export const getAllLeavesAdminService = async () => {
  return await Leave.find()
    .populate("employee", "name email role")
    .sort({ createdAt: -1 });
};

// Approve Leave
export const approveLeaveService = async (id) => {
    const leave = await Leave.findById(id);
    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (leave.status !== "Approved") {
      leave.status = "Approved";
      await leave.save();

      const days = calculateLeaveDays(leave.startDate, leave.endDate);
      await deductLeaveBalance(leave.employee, leave.leaveType, days);
    }

    return leave;
};

// Reject Leave
export const rejectLeaveService = async (id) => {
    return await Leave.findByIdAndUpdate(
        id,
        { status: "Rejected" },
        { new: true }
    );
};

// Cancel Leave
export const cancelLeaveService = async (id) => {
    const leave = await Leave.findById(id);
    if (leave) {
      if (leave.status === "Approved") {
        const days = calculateLeaveDays(leave.startDate, leave.endDate);
        await restoreLeaveBalance(leave.employee, leave.leaveType, days);
      }
      await Leave.findByIdAndDelete(id);
    }
    return true;
};