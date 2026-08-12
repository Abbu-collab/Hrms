import React from "react";
import { FiCalendar, FiInbox } from "react-icons/fi";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const statusConfig = {
  Approved: { cls: "badge-success",  label: "Approved" },
  Pending:  { cls: "badge-warning",  label: "Pending"  },
  Rejected: { cls: "badge-danger",   label: "Rejected" },
};

const typeConfig = {
  Sick:    { icon: "🤒", color: "var(--success)"  },
  Casual:  { icon: "☕", color: "var(--warning)"  },
  Annual:  { icon: "🏖️", color: "var(--primary-600)" },
};

const LeaveCalendar = ({ leaves }) => {
  const leaveList = Array.isArray(leaves) ? leaves : [];

  return (
    <div className="leave-calendar-container">
      <div className="leave-sub-header">
        <h2 className="leave-sub-title">
          <FiCalendar size={18} /> Leave Calendar
        </h2>
        <p className="leave-sub-subtitle">All submitted leave records sorted by date.</p>
      </div>

      {leaveList.length === 0 ? (
        <div className="leave-empty-state">
          <div className="leave-empty-icon">
            <FiInbox size={36} />
          </div>
          <h3>No leave records</h3>
          <p>No leave applications have been submitted yet.</p>
        </div>
      ) : (
        <div className="calendar-table-wrapper table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveList.map((leave) => {
                const config = statusConfig[leave.status] || { cls: "badge-info", label: leave.status };
                const typeConf = typeConfig[leave.leaveType] || { icon: "📋", color: "var(--slate-500)" };

                const start = leave.startDate ? new Date(leave.startDate) : null;
                const end   = leave.endDate   ? new Date(leave.endDate)   : null;
                let durationText = "—";
                if (start && end) {
                  const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  durationText = `${days} day${days !== 1 ? "s" : ""}`;
                }

                return (
                  <tr key={leave._id}>
                    <td>
                      <span style={{ marginRight: 6 }}>{typeConf.icon}</span>
                      <strong style={{ color: typeConf.color }}>{leave.leaveType}</strong>
                    </td>
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>
                      <span className="badge badge-info">{durationText}</span>
                    </td>
                    <td>
                      <span className={`badge ${config.cls}`}>{config.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;