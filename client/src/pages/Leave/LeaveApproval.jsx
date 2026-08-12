import { useState } from "react";
import { approveLeave, rejectLeave } from "../../services/leaveService";
import {
  FiCheckCircle, FiXCircle, FiAlertCircle, FiUsers, FiInbox,
  FiCalendar, FiBriefcase, FiUser, FiMail,
} from "react-icons/fi";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const statusBadge = (status) => {
  const map = {
    Pending:  { cls: "badge-warning", label: "Pending"  },
    Approved: { cls: "badge-success", label: "Approved" },
    Rejected: { cls: "badge-danger",  label: "Rejected" },
  };
  const s = map[status] || { cls: "badge-info", label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

/**
 * LeaveApproval — shows pending leave requests that the current user may
 * approve or reject.
 *
 * Props:
 *   leaves         — array of leave objects (should already be filtered to
 *                    exclude the current user's own requests before being
 *                    passed in — see LeaveDashboard)
 *   refreshLeaves  — callback
 *   currentUserId  — used as a safety guard to never show approve/reject on
 *                    the current user's own leave
 */
export default function LeaveApproval({ leaves = [], refreshLeaves, currentUserId }) {
  const [processing, setProcessing] = useState({});
  const [messages,   setMessages]   = useState({});

  const setMsg = (id, type, text) =>
    setMessages((p) => ({ ...p, [id]: { type, text } }));

  const handleApprove = async (id) => {
    setProcessing((p) => ({ ...p, [id]: "approving" }));
    setMsg(id, "", "");
    try {
      await approveLeave(id);
      setMsg(id, "success", "Leave approved successfully.");
      if (refreshLeaves) refreshLeaves();
    } catch (error) {
      setMsg(id, "error", error.response?.data?.message || error.message || "Approval failed.");
    } finally {
      setProcessing((p) => ({ ...p, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setProcessing((p) => ({ ...p, [id]: "rejecting" }));
    setMsg(id, "", "");
    try {
      await rejectLeave(id);
      setMsg(id, "success", "Leave rejected.");
      if (refreshLeaves) refreshLeaves();
    } catch (error) {
      setMsg(id, "error", error.response?.data?.message || error.message || "Rejection failed.");
    } finally {
      setProcessing((p) => ({ ...p, [id]: null }));
    }
  };

  // Safety guard: never show approve/reject on the current user's own leaves
  const safeLeaves = leaves.filter((l) => {
    const empId = l.employee?._id || l.employee;
    return String(empId) !== String(currentUserId);
  });

  const pendingLeaves = safeLeaves.filter((l) => l.status === "Pending");

  return (
    <div className="leave-approval-container">
      <div className="leave-sub-header">
        <div>
          <h2 className="leave-sub-title">
            <FiUsers size={18} /> Team Leave Requests
          </h2>
          <p className="leave-sub-subtitle">Review and action pending team leave requests.</p>
        </div>
        {pendingLeaves.length > 0 && (
          <span className="badge badge-warning">{pendingLeaves.length} Pending</span>
        )}
      </div>

      {pendingLeaves.length === 0 ? (
        <div className="leave-empty-state">
          <div className="leave-empty-icon">
            <FiInbox size={36} />
          </div>
          <h3>No pending requests</h3>
          <p>All leave requests have been reviewed. Nothing requires your attention right now.</p>
        </div>
      ) : (
        <div className="approval-cards-grid">
          {pendingLeaves.map((leave) => {
            const isApproving = processing[leave._id] === "approving";
            const isRejecting = processing[leave._id] === "rejecting";
            const msg         = messages[leave._id];

            return (
              <div key={leave._id} className="approval-card-pro">
                {/* Card Top */}
                <div className="approval-card-top">
                  <span className="approval-leave-type">{leave.leaveType} Leave</span>
                  {statusBadge(leave.status)}
                </div>

                {/* Employee details */}
                <div className="approval-meta-grid">
                  <div className="approval-meta-item">
                    <FiUser size={13} className="approval-meta-icon" />
                    <span className="approval-meta-label">Employee</span>
                    <span className="approval-meta-value">{leave.employee?.name || "—"}</span>
                  </div>
                  <div className="approval-meta-item">
                    <FiMail size={13} className="approval-meta-icon" />
                    <span className="approval-meta-label">Email</span>
                    <span className="approval-meta-value">{leave.employee?.email || "—"}</span>
                  </div>
                  <div className="approval-meta-item">
                    <FiBriefcase size={13} className="approval-meta-icon" />
                    <span className="approval-meta-label">Role</span>
                    <span className="approval-meta-value">{leave.employee?.role || "—"}</span>
                  </div>
                  <div className="approval-meta-item">
                    <FiCalendar size={13} className="approval-meta-icon" />
                    <span className="approval-meta-label">Period</span>
                    <span className="approval-meta-value">
                      {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                {leave.reason && (
                  <p className="approval-reason">
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                )}

                {/* Inline message */}
                {msg?.text && (
                  <div className={`status-message ${msg.type}`} style={{ margin: 0 }}>
                    {msg.type === "success"
                      ? <FiCheckCircle size={14} />
                      : <FiAlertCircle size={14} />}
                    {msg.text}
                  </div>
                )}

                {/* Actions — Approve / Reject (no Cancel) */}
                <div className="approval-actions-pro">
                  <button
                    id={`approval-approve-${leave._id}`}
                    type="button"
                    className="btn-primary"
                    onClick={() => handleApprove(leave._id)}
                    disabled={isApproving || isRejecting}
                  >
                    <FiCheckCircle size={14} />
                    {isApproving ? "Approving…" : "Approve"}
                  </button>
                  <button
                    id={`approval-reject-${leave._id}`}
                    type="button"
                    className="btn-danger"
                    onClick={() => handleReject(leave._id)}
                    disabled={isApproving || isRejecting}
                  >
                    <FiXCircle size={14} />
                    {isRejecting ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}