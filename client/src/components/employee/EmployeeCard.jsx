import "../employee/emp.shared.css";
import "../employee/EmployeeCard.css";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const avatarColors = [
  "#7c3aed", "#2563eb", "#0891b2", "#059669",
  "#d97706", "#dc2626", "#7c3aed", "#9333ea",
];

function getAvatarColor(name = "") {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return avatarColors[code % avatarColors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }) {
  const cls =
    status === "Active"
      ? "active"
      : status === "Inactive"
      ? "inactive"
      : "on-leave";
  return <span className={`emp-badge ${cls}`}>{status || "—"}</span>;
}

export default function EmployeeCard({
  employee,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const name = employee.user_id?.name || "Unknown";
  const email = employee.user_id?.email || "";
  const dept = employee.department_id?.departmentName || "—";
  const designation = employee.designation || "—";
  const joinDate = formatDate(employee.date_of_joining);
  const status = employee.employment_status;
  const code = employee.employee_code || "—";

  return (
    <div className="emp-card" onClick={() => onView?.(employee)}>
      <div className="emp-card-header">
        <div
          className="emp-card-avatar"
          style={{ background: getAvatarColor(name) }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="emp-card-name">{name}</div>
          <div className="emp-card-email">{email}</div>
        </div>
      </div>

      <div className="emp-card-body">
        <div className="emp-card-row">
          <span>Code</span>
          <span>{code}</span>
        </div>
        <div className="emp-card-row">
          <span>Designation</span>
          <span>{designation}</span>
        </div>
        <div className="emp-card-row">
          <span>Department</span>
          <span>{dept}</span>
        </div>
        <div className="emp-card-row">
          <span>Joined</span>
          <span>{joinDate}</span>
        </div>
        <div className="emp-card-row" style={{ alignItems: "center" }}>
          <span>Status</span>
          <StatusBadge status={status} />
        </div>
      </div>

      {(canEdit || canDelete) && (
        <div className="emp-action-btns" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <button
              className="emp-icon-btn edit"
              title="Edit"
              onClick={() => onEdit?.(employee)}
            >
              <FiEdit2 size={15} />
            </button>
          )}
          {canDelete && (
            <button
              className="emp-icon-btn delete"
              title="Delete"
              onClick={() => onDelete?.(employee)}
            >
              <FiTrash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
