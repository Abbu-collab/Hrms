import { Link, useNavigate } from "react-router-dom";
import "../employee/emp.shared.css";
import "../employee/EmployeeDetailsCard.css";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const cls =
    status === "Active" ? "active" : status === "Inactive" ? "inactive" : "on-leave";
  return <span className={`emp-badge ${cls}`}>{status || "—"}</span>;
}

export default function EmployeeDetailsCard({ employee, onEdit, onDelete, onBack, canEdit = true }) {
  const navigate = useNavigate();
  if (!employee) return null;

  const name =
    (typeof employee.user_id === "object" && employee.user_id?.name) ||
    employee.name ||
    employee.employeeName ||
    "Unknown";

  const email =
    (typeof employee.user_id === "object" && employee.user_id?.email) ||
    employee.email ||
    "—";

  const role =
    (typeof employee.user_id === "object" && employee.user_id?.role) ||
    employee.role ||
    "Employee";

  const dept =
    (typeof employee.department_id === "object" && employee.department_id?.departmentName) ||
    employee.department ||
    employee.departmentName ||
    "—";

  const deptId =
    (typeof employee.department_id === "object" && employee.department_id?.departmentId) ||
    employee.departmentId ||
    "—";

  const deptLocation =
    (typeof employee.department_id === "object" && employee.department_id?.location) ||
    employee.location ||
    "—";

  const designation = employee.designation || employee.role || "Employee";
  
  const rawCode = employee.employee_code || employee.employeeCode;
  const code =
    rawCode && !/^[0-9a-fA-F]{24}$/.test(rawCode)
      ? rawCode
      : (employee._id || employee.id)
      ? `EMP-${String(employee._id || employee.id).slice(-6).toUpperCase()}`
      : "EMP001";

  const joinDate = formatDate(employee.date_of_joining || employee.createdAt);
  const status = employee.employment_status || employee.status || "Active";
  const createdAt = formatDate(employee.createdAt);

  return (
    <div className="emp-detail-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Link
          to="/employee"
          className="emp-btn-secondary"
          id="emp-detail-back-btn"
          style={{ cursor: "pointer" }}
        >
          <FiArrowLeft size={16} /> Back to Directory
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {canEdit && (
            <>
              <button className="emp-btn-primary" onClick={() => onEdit?.(employee)} id="emp-detail-edit-btn">
                <FiEdit2 size={15} /> Edit Employee
              </button>
              <button className="emp-btn-danger" onClick={() => onDelete?.(employee)} id="emp-detail-delete-btn">
                <FiTrash2 size={15} /> Delete Employee
              </button>
            </>
          )}
        </div>
      </div>

      <div className="emp-detail-hero">
        <div className="emp-detail-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="emp-detail-hero-info">
          <h2>{name}</h2>
          <p>{designation} &nbsp;·&nbsp; {dept}</p>
          <p style={{ marginTop: 4, opacity: 0.75, fontSize: 13 }}>{email}</p>
        </div>
        <div className="emp-detail-hero-badge">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="emp-details-grid">
        <div className="emp-details-section">
          <h3>Employment Info</h3>
          <div className="emp-detail-item">
            <label>Employee Code</label>
            <strong>{code}</strong>
          </div>
          <div className="emp-detail-item">
            <label>Designation</label>
            <strong>{designation}</strong>
          </div>
          <div className="emp-detail-item">
            <label>Date of Joining</label>
            <strong>{joinDate}</strong>
          </div>
          <div className="emp-detail-item">
            <label>Status</label>
            <strong><StatusBadge status={status} /></strong>
          </div>
          <div className="emp-detail-item">
            <label>Record Created</label>
            <strong>{createdAt}</strong>
          </div>
        </div>

        <div className="emp-details-section">
          <h3>Personal Info</h3>
          <div className="emp-detail-item">
            <label>Full Name</label>
            <strong>{name}</strong>
          </div>
          <div className="emp-detail-item">
            <label>Email</label>
            <strong>{email}</strong>
          </div>
          <div className="emp-detail-item">
            <label>System Role</label>
            <strong>{role}</strong>
          </div>
        </div>

        <div className="emp-details-section">
          <h3>Department Info</h3>
          <div className="emp-detail-item">
            <label>Department</label>
            <strong>{dept}</strong>
          </div>
          {deptId && deptId !== "—" && (
            <div className="emp-detail-item">
              <label>Department ID</label>
              <strong>{deptId}</strong>
            </div>
          )}
          {deptLocation && deptLocation !== "—" && (
            <div className="emp-detail-item">
              <label>Location</label>
              <strong>{deptLocation}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
