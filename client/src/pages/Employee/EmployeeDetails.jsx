import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import EmployeeDetailsCard from "../../components/employee/EmployeeDetailsCard.jsx";
import {
  getEmployeeById,
  updateEmployeeStatus,
  deleteEmployee,
} from "../../services/employeeService.js";
import "../../components/employee/emp.shared.css";
import "../../components/employee/EmployeeDetailsCard.css";
import "./EmployeeList.css";
import { FiArrowLeft, FiXCircle, FiCheckCircle, FiSearch, FiAlertTriangle } from "react-icons/fi";

function ConfirmDialog({ employee, onConfirm, onCancel, loading }) {
  const name =
    (typeof employee?.user_id === "object" && employee?.user_id?.name) ||
    employee?.name ||
    "this employee";

  return (
    <div className="emp-confirm-overlay" role="dialog" aria-modal="true">
      <div className="emp-confirm-box">
        <div className="emp-confirm-icon"><FiAlertTriangle size={28} /></div>
        <h3>Delete Employee?</h3>
        <p>
          Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
        </p>
        <div className="emp-confirm-actions">
          <button className="emp-btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="emp-btn-danger" onClick={onConfirm} disabled={loading} id="confirm-delete-btn">
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const userRole = (user?.role || "").toLowerCase();
  const canEdit = userRole === "admin" || userRole === "hr";

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    getEmployeeById(id)
      .then((data) => setEmployee(data?.employee || null))
      .catch((err) => setError(err.message || "Failed to load employee"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleStatus = async () => {
    if (!employee) return;
    const newStatus =
      employee.employment_status === "Active" ? "Inactive" : "Active";
    setStatusLoading(true);
    setStatusMsg("");
    try {
      const data = await updateEmployeeStatus(id, newStatus);
      setEmployee(data?.employee || employee);
      setStatusMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      setStatusMsg(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(id);
      navigate("/employee");
    } catch (err) {
      setError(err.message || "Failed to delete employee");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (emp) => {
    if (!canEdit) {
      setError("You do not have access permission to edit employee details.");
      return;
    }
    navigate(`/employee/${emp._id || emp.id}/edit`);
  };

  const handleDeleteClick = () => {
    if (!canEdit) {
      setError("You do not have access permission to delete employee details.");
      return;
    }
    setConfirmDelete(true);
  };

  if (loading) {
    return (
      <div className="emp-page">
        <div className="emp-loading">
          <span className="emp-spinner" />
          Loading employee details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-page">
        <div className="emp-alert error">{error}</div>
        <button className="emp-btn-secondary" onClick={() => navigate("/employee")}>
          <FiArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="emp-page">
        <div className="emp-empty-state">
          <div className="emp-empty-icon"><FiSearch size={48} /></div>
          <p>Employee not found</p>
        </div>
        <button
          className="emp-btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() => navigate("/employee")}
        >
          <FiArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="emp-page">
      {statusMsg && (
        <div
          className={`emp-alert ${
            statusMsg.startsWith("Status updated") ? "success" : "error"
          }`}
        >
          {statusMsg}
        </div>
      )}

      {canEdit && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="emp-btn-secondary"
            onClick={handleToggleStatus}
            disabled={statusLoading}
            id="toggle-status-btn"
          >
            {statusLoading
              ? "Updating..."
              : employee.employment_status === "Active"
              ? <><FiXCircle size={15} /> Mark Inactive</>
              : <><FiCheckCircle size={15} /> Mark Active</>}
          </button>
        </div>
      )}

      <EmployeeDetailsCard
        employee={employee}
        canEdit={true}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onBack={() => navigate("/employee")}
      />

      {confirmDelete && (
        <ConfirmDialog
          employee={employee}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
