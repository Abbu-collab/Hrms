import Leave from "../models/Leave.js";
import User from "../models/UserModel.js";
import {
  applyLeaveService,
  getLeaveHistoryService,
  getAllLeavesAdminService,
  approveLeaveService,
  rejectLeaveService,
  cancelLeaveService,
} from "../services/leaveService.js";
import { createNotification } from "../services/notificationService.js";
import { sendLeaveEmail } from "../services/notificationService.js";

// Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const leave = await applyLeaveService({
      ...req.body,
      employee: req.user.id,
    });

    // Return successful response immediately after DB operation
    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });

    // Notify Admin/HR users asynchronously in background without blocking response
    setImmediate(async () => {
      try {
        const approvers = await User.find({
          role: { $in: ["Admin", "HR", "HR Manager", "hr_manager", "hr", "Human Resources"] },
          _id: { $ne: req.user.id },
        }).select("_id email name");

        const applicant = await User.findById(req.user.id).select("name email");
        const applicantName = applicant?.name || "An employee";
        const leaveType = req.body.leaveType || "Leave";
        const startDate = req.body.startDate ? new Date(req.body.startDate).toLocaleDateString("en-IN") : "";
        const endDate = req.body.endDate ? new Date(req.body.endDate).toLocaleDateString("en-IN") : "";

        await Promise.all(
          approvers.map(async (approver) => {
            await createNotification({
              recipient: approver._id,
              type: "leave_applied",
              message: `${applicantName} has applied for ${leaveType} leave (${startDate} – ${endDate}). Review is required.`,
              relatedLeave: leave._id,
            });

            await sendLeaveEmail({
              to: approver.email,
              subject: `New Leave Request — ${applicantName}`,
              html: `
                <h3>New Leave Application</h3>
                <p><strong>${applicantName}</strong> has submitted a <strong>${leaveType} leave</strong> request.</p>
                <ul>
                  <li><strong>From:</strong> ${startDate}</li>
                  <li><strong>To:</strong> ${endDate}</li>
                  <li><strong>Reason:</strong> ${req.body.reason || "—"}</li>
                </ul>
                <p>Please log in to the HRMS to review this request.</p>
              `,
            });
          })
        );
      } catch (notifErr) {
        console.error("Async leave apply notification error:", notifErr.message);
      }
    });
    return;
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Own Leave History — returns only the logged-in user's own leaves
export const getLeaveHistory = async (req, res) => {
  try {
    const leaves = await getLeaveHistoryService(req.user.id);

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Leaves — Admin/HR management view (all users' leaves)
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await getAllLeavesAdminService();

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Approve Leave
export const approveLeave = async (req, res) => {
  try {
    const leaveRecord = await Leave.findById(req.params.id);
    if (!leaveRecord) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const requestingUserId = String(req.user?.id || req.user?._id);
    const leaveOwnerId = String(leaveRecord.employee);

    if (requestingUserId === leaveOwnerId) {
      return res.status(403).json({
        success: false,
        message: "You cannot approve your own leave request",
      });
    }

    const leave = await approveLeaveService(req.params.id);

    // Notify the applicant
    try {
      const applicant = await User.findById(leaveOwnerId).select("email name");
      const leaveType = leaveRecord.leaveType || "Leave";
      const startDate = leaveRecord.startDate ? new Date(leaveRecord.startDate).toLocaleDateString("en-IN") : "";
      const endDate = leaveRecord.endDate ? new Date(leaveRecord.endDate).toLocaleDateString("en-IN") : "";

      await createNotification({
        recipient: leaveOwnerId,
        type: "leave_approved",
        message: `Your ${leaveType} leave request (${startDate} – ${endDate}) has been approved.`,
        relatedLeave: leave._id,
      });

      if (applicant?.email) {
        await sendLeaveEmail({
          to: applicant.email,
          subject: `Leave Approved — ${leaveType} Leave`,
          html: `
            <h3>Your Leave Has Been Approved</h3>
            <p>Hi ${applicant.name || ""},</p>
            <p>Your <strong>${leaveType} leave</strong> request has been <strong style="color:green">approved</strong>.</p>
            <ul>
              <li><strong>From:</strong> ${startDate}</li>
              <li><strong>To:</strong> ${endDate}</li>
            </ul>
            <p>Please plan accordingly. Have a good leave!</p>
          `,
        });
      }
    } catch (notifErr) {
      console.error("Leave approve notification error:", notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Leave approved",
      leave,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Reject Leave
export const rejectLeave = async (req, res) => {
  try {
    const leaveRecord = await Leave.findById(req.params.id);
    if (!leaveRecord) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const requestingUserId = String(req.user?.id || req.user?._id);
    const leaveOwnerId = String(leaveRecord.employee);

    if (requestingUserId === leaveOwnerId) {
      return res.status(403).json({
        success: false,
        message: "You cannot reject your own leave request",
      });
    }

    const leave = await rejectLeaveService(req.params.id);

    // Notify the applicant
    try {
      const applicant = await User.findById(leaveOwnerId).select("email name");
      const leaveType = leaveRecord.leaveType || "Leave";
      const startDate = leaveRecord.startDate ? new Date(leaveRecord.startDate).toLocaleDateString("en-IN") : "";
      const endDate = leaveRecord.endDate ? new Date(leaveRecord.endDate).toLocaleDateString("en-IN") : "";

      await createNotification({
        recipient: leaveOwnerId,
        type: "leave_rejected",
        message: `Your ${leaveType} leave request (${startDate} – ${endDate}) has been rejected.`,
        relatedLeave: leave._id,
      });

      if (applicant?.email) {
        await sendLeaveEmail({
          to: applicant.email,
          subject: `Leave Rejected — ${leaveType} Leave`,
          html: `
            <h3>Your Leave Has Been Rejected</h3>
            <p>Hi ${applicant.name || ""},</p>
            <p>Your <strong>${leaveType} leave</strong> request has been <strong style="color:red">rejected</strong>.</p>
            <ul>
              <li><strong>From:</strong> ${startDate}</li>
              <li><strong>To:</strong> ${endDate}</li>
            </ul>
            <p>Please contact HR if you have any questions.</p>
          `,
        });
      }
    } catch (notifErr) {
      console.error("Leave reject notification error:", notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Leave rejected",
      leave,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Cancel Leave
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Ownership check: only the leave owner can cancel
    const requestingUserId = String(req.user?.id || req.user?._id);
    const leaveOwnerId = String(leave.employee);

    if (requestingUserId !== leaveOwnerId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own leave requests",
      });
    }

    if (leave.status !== "Pending" && leave.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Only Pending or Approved leaves can be cancelled",
      });
    }

    await cancelLeaveService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Leave cancelled successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};