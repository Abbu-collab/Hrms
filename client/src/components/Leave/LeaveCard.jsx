import { useState } from "react";
import { cancelLeave } from "../../services/leaveService";
import { FiCalendar, FiFileText, FiXCircle, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const statusConfig = {
  Approved:  { badgeClass: "badge-success", label: "Approved"  },
  Pending:   { badgeClass: "badge-warning", label: "Pending"   },
  Rejected:  { badgeClass: "badge-danger",  label: "Rejected"  },
  Cancelled: { badgeClass: "badge-info",    label: "Cancelled" },
};

const typeIcons = { Sick: "🤒", Casual: "☕", Annual: "🏖️" };

/**
 * LeaveCard — renders a single leave record in the personal history list.
 *
 * Props:
 *   leave          — the leave object
 *   refreshLeaves  — callback to reload the leave list
 *   currentUserId  — the authenticated user's ID (from AuthContext)
 *
 * Cancel button rules:
 *   ✅ Shown  — when leave.employee._id === currentUserId AND status === "Pending"
 *   ❌ Hidden — for any other condition (different owner, non-Pending status, etc.)
 */
export default function LeaveCard({ leave, refreshLeaves, currentUserId }) {
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage]       = useState({ type: "", text: "" });

  const handleCancel = async () => {
    setCancelling(true);
    setMessage({ type: "", text: "" });
    try {
      await cancelLeave(leave._id);
      setMessage({ type: "success", text: "Leave cancelled successfully." });
      if (refreshLeaves) refreshLeaves();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Unable to cancel leave.",
      });
    } finally {
      setCancelling(false);
    }
  };

  // ── Ownership check: show Cancel only for the leave owner, on Pending leaves ──
  const leaveOwnerId = leave.employee?._id || leave.employee;
  const isOwner      = currentUserId && String(leaveOwnerId) === String(currentUserId);
  const canCancel    = isOwner && leave.status === "Pending";

  const sc       = statusConfig[leave.status] || { badgeClass: "badge-info", label: leave.status };
  const typeIcon = typeIcons[leave.leaveType] || "📋";

  return (
    <div className="leave-card-history-item">
      <div className="lchi-left">
        <span className="lchi-type-icon">{typeIcon}</span>
        <div className="lchi-details">
          <strong className="lchi-type">{leave.leaveType} Leave</strong>
          <span className="lchi-dates">
            <FiCalendar size={12} />
            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
          </span>
          {leave.reason && (
            <span className="lchi-reason">
              <FiFileText size={12} /> {leave.reason}
            </span>
          )}
        </div>
      </div>

      <div className="lchi-right">
        <span className={`badge ${sc.badgeClass}`}>{sc.label}</span>

        {/* Cancel — conditionally rendered based on ownership + status */}
        {canCancel && (
          <button
            id={`leave-cancel-${leave._id}`}
            type="button"
            className="btn-danger lchi-cancel-btn"
            onClick={handleCancel}
            disabled={cancelling}
          >
            <FiXCircle size={13} />
            {cancelling ? "Cancelling…" : "Cancel"}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`status-message ${message.type} lchi-msg`}>
          {message.type === "success"
            ? <FiCheckCircle size={13} />
            : <FiAlertCircle size={13} />}
          {message.text}
        </div>
      )}
    </div>
  );
}